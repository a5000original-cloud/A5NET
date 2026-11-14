import Profiles from "../tables/profiles.table";
import Posts from "../tables/posts.table";
import Comments from "../tables/comments.table";
import Reactions from "../tables/reactions.table";
import Collabs from "../tables/collabs.table";
import type {
  AuthorCard,
  CollabCard,
  FeedData,
  PlatformStats,
  ProfileCard,
  StickerPlacement,
  TrendItem,
} from "../shared/types";
import { timeAgo } from "../shared/format";
import { LEAF_TOPICS, topicById } from "./taxonomy";
import {
  fallbackAuthor,
  getAuthorMap,
  getViewerSocial,
  toAuthorCard,
  type ViewerSocial,
} from "./social";
import { listPosts, toPostCard, toTopicRefs } from "./post-data";
import { getEmojiSummary } from "./emoji";
import { getFleet } from "./settings";
import { cosine, postVector } from "./vec";
import { hashSeed } from "./rng";

export async function getStats(ctx: app.Ctx): Promise<PlatformStats> {
  const [humans, bots, postsCount, commentsCount, collabs, posts] =
    await Promise.all([
      Profiles.countBy(ctx, { kind: "human" }),
      Profiles.countBy(ctx, { kind: "bot" }),
      Posts.countBy(ctx, { visibility: "visible" }),
      Comments.countBy(ctx, { visibility: "visible" }),
      Collabs.countBy(ctx, {}),
      Posts.findAll(ctx, { where: { visibility: "visible" }, limit: 500 }),
    ]);
  const watchSeconds = posts.reduce((sum, post) => sum + post.watchSeconds, 0);
  return {
    humans,
    bots,
    posts: postsCount,
    comments: commentsCount,
    hoursWatched: Math.round((watchSeconds / 3600) * 10) / 10,
    collabs,
  };
}

export async function getFeedData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: "owner" | "admin" | "member",
  offset = 0,
): Promise<FeedData> {
  const nowMs = Date.now();
  const social = await getViewerSocial(ctx, viewer.id);
  const raw = await Posts.findAll(ctx, {
    where: { visibility: "visible" },
    limit: 120,
    order: [{ publishedAt: "desc" }, { id: "asc" }],
  });

  const rawAuthorIds = [...new Set(raw.map((post) => post.authorId))];
  const rawAuthors = rawAuthorIds.length
    ? await Profiles.findAll(ctx, {
        where: { id: rawAuthorIds },
        limit: rawAuthorIds.length,
      })
    : [];
  const kindById = new Map(
    rawAuthors.map((author) => [author.id, author.kind]),
  );
  const followersById = new Map(
    rawAuthors.map((author) => [author.id, author.followersCount]),
  );

  // Get owner profile to identify A5000's posts
  const ownerProfile = rawAuthors.find((author) => author.handle === "a5000");
  const ownerId = ownerProfile?.id ?? null;

  const scored = raw.map((post) => {
    const created =
      post.publishedAt instanceof Date
        ? post.publishedAt.getTime()
        : new Date(post.publishedAt).getTime();
    const ageHours = Math.max(0, (nowMs - created) / 3600000);
    const recency = Math.exp(-ageHours / 26);
    const affinity = cosine(
      viewer.interestVector,
      postVector(post.title, post.body, post.topics),
    );
    const friendBoost = social.friendIds.has(post.authorId)
      ? 0.55
      : social.followingIds.has(post.authorId)
        ? 0.3
        : 0;
    const hype = Math.min(1.4, post.hypeScore / 60);
    const jitter = ((hashSeed(post.id) % 1000) / 1000) * 0.22;
    const isOwnerPost = ownerId && post.authorId === ownerId;
    const engagementScore =
      Math.log10(1 + post.likes) * 0.35 +
      Math.log10(1 + post.commentsCount) * 0.55 -
      Math.log10(1 + post.dislikes) * 0.2;
    return {
      postId: post.id,
      score:
        recency * 0.9 +
        Math.max(0, affinity) * 1.75 +
        friendBoost +
        hype * 0.42 +
        jitter +
        (kindById.get(post.authorId) === "human" ? 0.45 : 0) +
        Math.log10(1 + (followersById.get(post.authorId) ?? 0)) * 0.18 +
        engagementScore +
        (isOwnerPost ? 0.6 : 0), // A5000 posts get a small visibility bump, but rank purely on real engagement
    };
  });
  scored.sort((a, b) => b.score - a.score);
  const diversified = diversify(scored, byIdOf(raw));

  const pageIds = diversified
    .slice(offset, offset + 24)
    .map((entry) => entry.postId);
  const byId = new Map(raw.map((post) => [post.id, post]));
  const pagePosts = pageIds
    .map((id) => byId.get(id))
    .filter((post): post is (typeof raw)[number] => Boolean(post));

  const authorMap = await getAuthorMap(
    ctx,
    pagePosts.map((post) => post.authorId),
  );
  const reactionRows = pageIds.length
    ? await Reactions.findAll(ctx, {
        where: { postId: pageIds, profileId: viewer.id },
        limit: pageIds.length,
      })
    : [];
  const reactionMap = new Map(
    reactionRows.map((row) => [row.postId, row.value as "like" | "dislike"]),
  );
  const emoji = await getEmojiSummary(ctx, pageIds, viewer.id);

  const items = pagePosts.map((post) =>
    toPostCard(
      post,
      authorMap.get(post.authorId) ?? fallbackAuthor(post.authorId),
      reactionMap.get(post.id) ?? null,
      nowMs,
      !social.friendIds.has(post.authorId) &&
        !social.followingIds.has(post.authorId),
      emoji.counts.get(post.id) ?? {},
      emoji.viewer.get(post.id) ?? null,
    ),
  );

  const artifactPost =
    pagePosts
      .filter((post) => post.kind === "video")
      .sort((a, b) => {
        const aAge =
          nowMs -
          (a.publishedAt instanceof Date
            ? a.publishedAt.getTime()
            : new Date(a.publishedAt).getTime());
        const bAge =
          nowMs -
          (b.publishedAt instanceof Date
            ? b.publishedAt.getTime()
            : new Date(b.publishedAt).getTime());
        const aScore = a.hypeScore + (aAge < 24 * 3600000 ? 30 : 0);
        const bScore = b.hypeScore + (bAge < 24 * 3600000 ? 30 : 0);
        return bScore - aScore;
      })[0] ?? null;
  const artifact = artifactPost
    ? (items.find((item) => item.id === artifactPost.id) ?? null)
    : null;

  const [trends, suggestions, stats, collabs, fleet] = await Promise.all([
    Promise.resolve(buildTrends(raw)),
    buildSuggestions(ctx, viewer, social),
    getStats(ctx),
    buildCollabs(ctx, viewer.id),
    getFleet(ctx),
  ]);

  return {
    items,
    trends,
    suggestions,
    stats,
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    now: new Date(nowMs).toISOString(),
    hasMore: diversified.length > offset + 24,
    collabs,
    artifact,
    fleetEnabled: fleet.enabled,
    topicOptions: LEAF_TOPICS.slice(0, 28).map((topic) => ({
      id: topic.id,
      label: topic.label,
      hue: topic.hue,
    })),
  };
}

function buildTrends(
  posts: Array<{
    topics: string[];
    hypeScore: number;
    likes: number;
    commentsCount: number;
  }>,
): TrendItem[] {
  const map = new Map<string, { posts: number; hype: number }>();
  for (const post of posts) {
    for (const topic of post.topics) {
      const entry = map.get(topic) ?? { posts: 0, hype: 0 };
      entry.posts += 1;
      entry.hype += post.hypeScore + post.likes + post.commentsCount * 2;
      map.set(topic, entry);
    }
  }
  return [...map.entries()]
    .map(([id, value]) => {
      const topic = topicById(id);
      return {
        topic: { id: topic.id, label: topic.label, hue: topic.hue },
        posts: value.posts,
        hype: Math.round(value.hype),
      };
    })
    .sort((a, b) => b.hype - a.hype)
    .slice(0, 7);
}

async function buildSuggestions(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  social: ViewerSocial,
): Promise<AuthorCard[]> {
  const all = await Profiles.findAll(ctx, {
    limit: 200,
    order: [{ friendsCount: "desc" }, { id: "asc" }],
  });
  const nowMs = Date.now();
  return all
    .filter(
      (profile) =>
        profile.id !== viewer.id &&
        !social.friendIds.has(profile.id) &&
        !social.followingIds.has(profile.id),
    )
    .map((profile) => {
      const affinity = cosine(viewer.interestVector, profile.interestVector);
      const last =
        profile.lastActionAt instanceof Date
          ? profile.lastActionAt.getTime()
          : 0;
      const freshness = last
        ? Math.max(0, 1 - (nowMs - last) / (1000 * 60 * 60 * 48))
        : 0;
      return {
        profile,
        score: affinity + freshness * 0.2 + (hashSeed(profile.id) % 100) / 500,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => toAuthorCard(entry.profile));
}

export async function buildCollabs(
  ctx: app.Ctx,
  viewerId: string,
): Promise<CollabCard[]> {
  const rows = await Collabs.findAll(ctx, {
    limit: 30,
    order: [{ createdAt: "desc" }, { id: "asc" }],
  });
  const allIds = [
    ...new Set(rows.flatMap((row) => [row.initiatorId, ...row.participantIds])),
  ];
  const authors = await getAuthorMap(ctx, allIds);
  const linkedIds = [
    ...new Set(rows.flatMap((row) => (row.postId ? [row.postId] : []))),
  ];
  const linkedPosts = linkedIds.length
    ? await Posts.findAll(ctx, {
        where: { id: linkedIds },
        limit: linkedIds.length,
      })
    : [];
  const postDates = new Map(
    linkedPosts.map((post) => [post.id, post.publishedAt]),
  );
  const profileRows = await Profiles.findAll(ctx, {
    where: { id: allIds },
    limit: allIds.length,
  });
  const followersById = new Map(
    profileRows.map((profile) => [profile.id, profile.followersCount]),
  );
  const nowMs = Date.now();
  return rows.map((row) => {
    const linkedDate = row.postId ? postDates.get(row.postId) : undefined;
    const created =
      linkedDate instanceof Date
        ? linkedDate
        : row.createdAt instanceof Date
          ? row.createdAt
          : new Date(row.createdAt);
    return {
      id: row.id,
      title: row.title,
      brief: row.brief,
      status: row.status,
      participants: row.participantIds
        .map((id) => authors.get(id))
        .filter((item): item is AuthorCard => Boolean(item)),
      initiator:
        authors.get(row.initiatorId) ?? fallbackAuthor(row.initiatorId),
      createdAt: created.toISOString(),
      ago: timeAgo(created.toISOString(), nowMs),
      postId: row.postId ?? null,
      goal: row.goal ?? "Совместный проект",
      deadline: row.deadline
        ? (row.deadline instanceof Date
            ? row.deadline
            : new Date(row.deadline)
          ).toISOString()
        : null,
      daysLeft: row.deadline
        ? Math.max(
            0,
            Math.ceil(
              ((row.deadline instanceof Date
                ? row.deadline.getTime()
                : new Date(row.deadline).getTime()) -
                nowMs) /
                86400000,
            ),
          )
        : null,
      goalFollowers: row.goalFollowers ?? 15000,
      targetFollowers:
        (row.goalFollowers ?? 15000) * (row.participantIds.length + 1),
      currentFollowers: [row.initiatorId, ...row.participantIds].reduce(
        (sum, id) => sum + (followersById.get(id) ?? 0),
        0,
      ),
      progress: Math.min(
        100,
        Math.round(
          ([row.initiatorId, ...row.participantIds].reduce(
            (sum, id) => sum + (followersById.get(id) ?? 0),
            0,
          ) /
            Math.max(
              1,
              (row.goalFollowers ?? 15000) * (row.participantIds.length + 1),
            )) *
            100,
        ),
      ),
      tasks: row.tasks ?? [],
      joined:
        row.participantIds.includes(viewerId) || row.initiatorId === viewerId,
    };
  });
}

function parseStickerLayout(
  raw: string | undefined,
  stickers: string[],
): StickerPlacement[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed) && parsed.length === stickers.length) {
      return parsed.map((item, index) => ({
        x: Number(item?.x) || 10 + index * 13,
        y: Number(item?.y) || 14 + (index % 3) * 20,
        scale: Number(item?.scale) || 1,
        float: Boolean(item?.float),
      }));
    }
  } catch {
    // fall through
  }
  return stickers.map((_, index) => ({
    x: 10 + index * 13,
    y: 14 + (index % 3) * 20,
    scale: 1,
    float: index % 2 === 0,
  }));
}

export function buildProfileCard(
  profile: typeof Profiles.T,
  viewer: typeof Profiles.T,
  targetSocial: ViewerSocial,
  viewerSocial: ViewerSocial,
): ProfileCard {
  return {
    ...toAuthorCard(profile),
    age: profile.age,
    bio: profile.bio,
    interests: toTopicRefs(profile.interests),
    followersCount: profile.followersCount,
    externalSubscribers: profile.externalSubscribers ?? 0,
    subscriberSource: profile.subscriberSource ?? null,
    followingCount: profile.followingCount,
    friendsCount: Math.max(profile.friendsCount, targetSocial.friendIds.size),
    postsCount: profile.postsCount,
    chronotype: profile.chronotype,
    coverUrl: profile.coverUrl ?? null,
    coverPosition: profile.coverPosition ?? 50,
    tagline: profile.tagline ?? "",
    stickers: profile.stickers ?? [],
    stickerLayout: parseStickerLayout(
      profile.stickerLayout,
      profile.stickers ?? [],
    ),
    stamps: profile.stamps ?? [],
    premiumUntil:
      profile.premiumUntil instanceof Date
        ? profile.premiumUntil.toISOString()
        : profile.premiumUntil
          ? new Date(profile.premiumUntil).toISOString()
          : null,
    links: profile.links ?? [],
    profileTheme: profile.profileTheme ?? "graphite",
    accentHue: profile.accentHue ?? profile.avatarHue,
    pinnedPostId: profile.pinnedPostId ?? null,
    canEdit: profile.id === viewer.id,
    isFollowing: viewerSocial.followingIds.has(profile.id),
    isFriend: viewerSocial.friendIds.has(profile.id),
    requestPending:
      viewerSocial.pendingOut.has(profile.id) ||
      viewerSocial.pendingIn.has(profile.id),
    isSelf: profile.id === viewer.id,
    lastActionAt:
      profile.lastActionAt instanceof Date
        ? profile.lastActionAt.toISOString()
        : null,
  };
}

export async function getProfilePageData(
  ctx: app.Ctx,
  profileId: string,
  viewer: typeof Profiles.T,
) {
  const profile = await Profiles.findById(ctx, profileId);
  if (!profile) return null;
  const [targetSocial, viewerSocial, posts, allCollabs] = await Promise.all([
    getViewerSocial(ctx, profile.id),
    getViewerSocial(ctx, viewer.id),
    listPosts(ctx, { viewerId: viewer.id, authorId: profile.id, limit: 24 }),
    buildCollabs(ctx, viewer.id),
  ]);
  const collabs = allCollabs.filter(
    (collab) =>
      collab.initiator.id === profile.id ||
      collab.participants.some((person) => person.id === profile.id),
  );
  const friendIds = [...targetSocial.friendIds].slice(0, 12);
  const friendMap = await getAuthorMap(ctx, friendIds);
  const friends = friendIds
    .map((id) => friendMap.get(id))
    .filter((item): item is AuthorCard => Boolean(item));
  return {
    profile: buildProfileCard(profile, viewer, targetSocial, viewerSocial),
    posts: posts.items,
    collabs,
    friends,
    incomingRequest: viewerSocial.pendingIn.has(profile.id),
    now: new Date().toISOString(),
  };
}

function byIdOf(
  posts: Array<{ id: string; authorId: string }>,
): Map<string, string> {
  return new Map(posts.map((post) => [post.id, post.authorId]));
}

function diversify(
  entries: Array<{ postId: string; score: number }>,
  authorOf: Map<string, string>,
): Array<{ postId: string; score: number }> {
  const pool = [...entries];
  const ordered: Array<{ postId: string; score: number }> = [];
  while (pool.length) {
    let chosenIndex = 0;
    for (let index = 0; index < pool.length; index += 1) {
      const candidate = pool[index]!;
      const author = authorOf.get(candidate.postId);
      const lastAuthors = ordered
        .slice(-3)
        .map((entry) => authorOf.get(entry.postId));
      if (!author || !lastAuthors.includes(author)) {
        chosenIndex = index;
        break;
      }
    }
    const [next] = pool.splice(chosenIndex, 1);
    if (next) ordered.push(next);
  }
  return ordered;
}
