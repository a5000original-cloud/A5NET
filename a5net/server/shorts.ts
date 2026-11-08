import Profiles from "../tables/profiles.table";
import Posts from "../tables/posts.table";
import Reactions from "../tables/reactions.table";
import type { AuthorCard, ShortsData } from "../shared/types";
import { timeAgo } from "../shared/format";
import {
  getAuthorMap,
  fallbackAuthor,
  toAuthorCard,
  getViewerSocial,
} from "./social";
import { getEmojiSummary } from "./emoji";

export async function getShortsData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: "owner" | "admin" | "member",
): Promise<ShortsData> {
  const nowMs = Date.now();
  const social = await getViewerSocial(ctx, viewer.id);

  // Get vertical/short videos
  const raw = await Posts.findAll(ctx, {
    where: { visibility: "visible", kind: "video" },
    limit: 200,
    order: [{ hypeScore: "desc" }, { publishedAt: "desc" }],
  });

  const authorMap = await getAuthorMap(
    ctx,
    raw.map((post) => post.authorId),
  );
  const postIds = raw.map((post) => post.id);
  const reactionRows = postIds.length
    ? await Reactions.findAll(ctx, {
        where: { postId: postIds, profileId: viewer.id },
        limit: postIds.length,
      })
    : [];
  const reactionMap = new Map(
    reactionRows.map((row) => [row.postId, row.value as "like" | "dislike"]),
  );
  const emoji = await getEmojiSummary(ctx, postIds, viewer.id);

  const items = raw.map((post) => {
    const created =
      post.publishedAt instanceof Date
        ? post.publishedAt
        : new Date(post.publishedAt);
    const author =
      authorMap.get(post.authorId) ?? fallbackAuthor(post.authorId);
    return {
      id: post.id,
      kind: post.kind,
      title: post.title,
      body: post.body,
      topics: post.topics.map((id) => {
        const { topicById } = require("./taxonomy");
        const topic = topicById(id);
        return { id: topic.id, label: topic.label, hue: topic.hue };
      }),
      mediaUrl: post.mediaUrl ?? null,
      coverUrl: post.coverUrl ?? null,
      mediaStatus: post.mediaStatus ?? "ready",
      mimeType: post.mimeType ?? null,
      sizeBytes: post.sizeBytes ?? 0,
      source: post.source ?? "seed",
      coverHue: post.coverHue,
      durationSec: post.durationSec,
      orientation: "vertical",
      hypeScore: post.hypeScore,
      hypeLevel: Math.min(1, Math.max(0.05, post.hypeScore / 70)),
      likes: post.likes,
      dislikes: post.dislikes,
      commentsCount: post.commentsCount,
      views: Math.max(post.views, post.likes + post.dislikes),
      createdAt: created.toISOString(),
      author: toAuthorCard(author),
      viewerReaction: reactionMap.get(post.id) ?? null,
      emojiCounts: (emoji.counts.get(post.id) ?? {}) as Record<string, number>,
      viewerEmoji: emoji.viewer.get(post.id) ?? null,
      collabId: post.collabId ?? null,
      pinned: post.pinned ?? false,
      promoteLevel: post.promoteLevel ?? null,
      pollOptions: null,
      pollVotes: null,
      pollExpiresAt: null,
      ago: timeAgo(created.toISOString(), nowMs),
      flowLabel: "",
      discovery:
        !social.friendIds.has(post.authorId) &&
        !social.followingIds.has(post.authorId),
    };
  });

  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    items,
    now: new Date(nowMs).toISOString(),
  };
}
