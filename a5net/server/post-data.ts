import Profiles from "../tables/profiles.table";
import Posts from "../tables/posts.table";
import Reactions from "../tables/reactions.table";
import Comments from "../tables/comments.table";
import type {
  CommentItem,
  PostCard,
  ReactionValue,
  TopicRef,
} from "../shared/types";
import { timeAgo } from "../shared/format";
import { topicById } from "./taxonomy";
import {
  getAuthorMap,
  fallbackAuthor,
  toAuthorCard,
  getViewerSocial,
} from "./social";

export function toTopicRefs(ids: string[]): TopicRef[] {
  return ids.map((id) => {
    const topic = topicById(id);
    return { id: topic.id, label: topic.label, hue: topic.hue };
  });
}

export function toPostCard(
  post: typeof Posts.T,
  author: ReturnType<typeof toAuthorCard>,
  reaction: ReactionValue | null,
  nowMs: number,
  discovery = false,
  emojiCounts: Record<string, number> = {},
  viewerEmoji: string | null = null,
): PostCard {
  const created =
    post.publishedAt instanceof Date
      ? post.publishedAt
      : new Date(post.publishedAt);
  return {
    id: post.id,
    kind: post.kind,
    title: post.title,
    body: post.body,
    topics: toTopicRefs(post.topics),
    mediaUrl: post.mediaUrl ?? null,
    coverUrl: post.coverUrl ?? null,
    mediaStatus: post.mediaStatus ?? "ready",
    mimeType: post.mimeType ?? null,
    sizeBytes: post.sizeBytes ?? 0,
    source: post.source ?? "seed",
    coverHue: post.coverHue,
    durationSec: post.durationSec,
    orientation: post.orientation ?? "horizontal",
    hypeScore: post.hypeScore,
    hypeLevel: Math.min(1, Math.max(0.05, post.hypeScore / 70)),
    likes: post.likes,
    dislikes: post.dislikes,
    commentsCount: post.commentsCount,
    views: Math.max(post.views, post.likes + post.dislikes),
    createdAt: created.toISOString(),
    author,
    viewerReaction: reaction,
    emojiCounts,
    viewerEmoji,
    collabId: post.collabId ?? null,
    pinned: post.pinned ?? false,
    promoteLevel: post.promoteLevel ?? null,
    pollOptions: post.pollOptions ?? null,
    pollVotes: post.pollVotes ?? null,
    pollExpiresAt:
      post.pollExpiresAt instanceof Date
        ? post.pollExpiresAt.toISOString()
        : post.pollExpiresAt
          ? new Date(post.pollExpiresAt).toISOString()
          : null,
    ago: timeAgo(created.toISOString(), nowMs),
    flowLabel: flowLabel(created),
    discovery,
  };
}

export async function listPosts(
  ctx: app.Ctx,
  options: {
    viewerId: string;
    limit?: number;
    offset?: number;
    authorId?: string;
    kind?: "text" | "video" | "music" | "collab";
  },
): Promise<{ items: PostCard[]; hasMore: boolean }> {
  const limit = Math.min(options.limit ?? 24, 60);
  const offset = Math.max(0, options.offset ?? 0);
  const where: {
    visibility: "visible";
    authorId?: string;
    kind?: "text" | "video" | "music" | "collab";
  } = { visibility: "visible" };
  if (options.authorId) where.authorId = options.authorId;
  if (options.kind) where.kind = options.kind;
  const rows = await Posts.findAll(ctx, {
    where,
    limit: limit + 1,
    offset,
    order: [{ publishedAt: "desc" }, { id: "asc" }],
  });
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  const nowMs = Date.now();
  const authorMap = await getAuthorMap(
    ctx,
    page.map((post) => post.authorId),
  );
  const postIds = page.map((post) => post.id);
  const reactions = postIds.length
    ? await Reactions.findAll(ctx, {
        where: { postId: postIds, profileId: options.viewerId },
        limit: postIds.length,
      })
    : [];
  const reactionMap = new Map(
    reactions.map((row) => [row.postId, row.value as ReactionValue]),
  );
  const emoji = await import("./emoji").then((mod) =>
    mod.getEmojiSummary(ctx, postIds, options.viewerId),
  );

  return {
    items: page.map((post) =>
      toPostCard(
        post,
        authorMap.get(post.authorId) ?? fallbackAuthor(post.authorId),
        reactionMap.get(post.id) ?? null,
        nowMs,
        false,
        emoji.counts.get(post.id) ?? {},
        emoji.viewer.get(post.id) ?? null,
      ),
    ),
    hasMore,
  };
}

export async function listComments(
  ctx: app.Ctx,
  postId: string,
  viewerId: string,
): Promise<CommentItem[]> {
  const rows = await Comments.findAll(ctx, {
    where: { postId, visibility: "visible" },
    limit: 100,
    order: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const authorMap = await getAuthorMap(
    ctx,
    rows.map((row) => row.authorId),
  );
  const byId = new Map(rows.map((row) => [row.id, row]));
  const nowMs = Date.now();
  return rows.map((row) => {
    const created =
      row.publishedAt instanceof Date
        ? row.publishedAt
        : new Date(row.publishedAt);
    return {
      id: row.id,
      text: row.text,
      likes: row.likes,
      createdAt: created.toISOString(),
      ago: timeAgo(created.toISOString(), nowMs),
      author: authorMap.get(row.authorId) ?? fallbackAuthor(row.authorId),
      isMine: row.authorId === viewerId,
      parentId: row.parentId ?? null,
      replyToName: row.parentId
        ? (authorMap.get(byId.get(row.parentId)?.authorId ?? "")?.name ?? null)
        : null,
    };
  });
}

export async function findRelatedPosts(
  ctx: app.Ctx,
  post: typeof Posts.T,
  viewerId: string,
  limit = 3,
): Promise<PostCard[]> {
  const rows = await Posts.findAll(ctx, {
    where: { visibility: "visible" },
    limit: 40,
    order: [{ publishedAt: "desc" }, { id: "asc" }],
  });
  const topicSet = new Set(post.topics);
  const scored = rows
    .filter((row) => row.id !== post.id)
    .map((row) => ({
      row,
      overlap: row.topics.filter((topic) => topicSet.has(topic)).length,
    }))
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.row.hypeScore - a.row.hypeScore)
    .slice(0, limit);
  if (!scored.length) return [];
  const authorMap = await getAuthorMap(
    ctx,
    scored.map((entry) => entry.row.authorId),
  );
  const reactionRows = await Reactions.findAll(ctx, {
    where: { postId: scored.map((entry) => entry.row.id), profileId: viewerId },
    limit: scored.length,
  });
  const reactionMap = new Map(
    reactionRows.map((row) => [row.postId, row.value as ReactionValue]),
  );
  const nowMs = Date.now();
  return scored.map((entry) =>
    toPostCard(
      entry.row,
      authorMap.get(entry.row.authorId) ?? fallbackAuthor(entry.row.authorId),
      reactionMap.get(entry.row.id) ?? null,
      nowMs,
    ),
  );
}

export async function getPostPageData(
  ctx: app.Ctx,
  postId: string,
  viewerId: string,
): Promise<{
  post: PostCard;
  comments: CommentItem[];
  author: typeof Profiles.T;
  related: PostCard[];
} | null> {
  const post = await Posts.findById(ctx, postId);
  if (!post) return null;
  const author = await Profiles.findById(ctx, post.authorId);
  if (!author) return null;
  const [comments, related] = await Promise.all([
    listComments(ctx, postId, viewerId),
    findRelatedPosts(ctx, post, viewerId),
  ]);
  const postCard = toPostCard(post, toAuthorCard(author), null, Date.now());
  return { post: postCard, comments, author, related };
}

export async function viewerSocialSafe(ctx: app.Ctx, profileId: string) {
  return getViewerSocial(ctx, profileId);
}

function flowLabel(date: Date): string {
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Moscow",
  }).format(date);
  const hour = Number(time.slice(0, 2));
  const part =
    hour < 6 ? "ночь" : hour < 12 ? "утро" : hour < 18 ? "день" : "вечер";
  return `${time} · ${part}`;
}
