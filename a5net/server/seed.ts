import Profiles from '../tables/profiles.table'
import Posts from '../tables/posts.table'
import Comments from '../tables/comments.table'
import Edges from '../tables/edges.table'
import Friendships from '../tables/friendships.table'
import Collabs from '../tables/collabs.table'
import type { FleetSettings } from '../shared/types'
import { ensureOwnerProfile } from './access'
import { DEFAULT_FLEET, getFleet, saveFleet, setSetting, SEED_KEY } from './settings'
import { generatePersona, botCount } from './bots/personas'
import { personaFromProfile } from './bots/profile-persona'
import { localComment } from './bots/local'
import { remember } from './bots/memory'
import { computeHype } from './hype'
import { cosine, embedTopics } from './vec'
import { hashSeed, mulberry32, pick } from './rng'
import { topicLabel, topicPath } from './taxonomy'
import { TRACKS, VIDEOS } from './media'
import { createInviteRecord, findInviteByCode } from './invites'
import { botTickJob } from '../jobs/bot-tick'
import {
  SEED_COLLABS,
  SEED_INVITES,
  SEED_TEXTS,
  SEED_TRACKS,
  SEED_VIDEOS,
} from './seed-content'

export interface SeedReport {
  skipped: boolean
  bots: number
  posts: number
  comments: number
  friendships: number
  collabs: number
  invites: number
}

function authorFor(bots: Array<typeof Profiles.T>, topics: string[], rng: () => number): typeof Profiles.T {
  const vec = embedTopics(topics)
  let best = bots[0]!
  let bestScore = -Infinity
  for (const bot of bots) {
    const score = cosine(vec, bot.interestVector) + rng() * 0.18
    if (score > bestScore) {
      bestScore = score
      best = bot
    }
  }
  return best
}

async function createPost(
  ctx: app.Ctx,
  author: typeof Profiles.T,
  data: {
    kind: 'text' | 'video' | 'music' | 'collab'
    title: string
    body: string
    topics: string[]
    mediaUrl?: string
    durationSec: number
    coverHue: number
    ageHours: number
    collabId?: string
  },
): Promise<typeof Posts.T> {
  const publishedAt = new Date(Date.now() - data.ageHours * 3600 * 1000)
  return Posts.create(ctx, {
    authorId: author.id,
    kind: data.kind,
    title: data.title,
    body: data.body,
    topics: data.topics,
    mediaUrl: data.mediaUrl,
    coverHue: data.coverHue,
    durationSec: data.durationSec,
    hypeScore: 0,
    likes: 0,
    dislikes: 0,
    commentsCount: 0,
    views: 0,
    watchSeconds: 0,
    collabId: data.collabId,
    publishedAt,
  })
}

async function engage(
  ctx: app.Ctx,
  post: typeof Posts.T,
  author: typeof Profiles.T,
  bots: Array<typeof Profiles.T>,
  rng: () => number,
): Promise<{ comments: number; likes: number; views: number }> {
  const scored = bots
    .filter(bot => bot.id !== author.id)
    .map(bot => ({
      bot,
      score: cosine(bot.interestVector, embedTopics(post.topics)) + rng() * 0.25,
    }))
    .sort((a, b) => b.score - a.score)

  const commenters = scored.slice(0, 6).filter(entry => entry.score > 0.15)
  const take = Math.min(commenters.length, 1 + Math.floor(rng() * 3))
  const chosen = commenters.slice(0, take)
  const postPublished = post.publishedAt instanceof Date ? post.publishedAt.getTime() : Date.now() - 3600000
  const nowMs = Date.now()
  let commentCount = 0

  for (const entry of chosen) {
    const persona = personaFromProfile(entry.bot)
    const text = localComment(persona, {
      id: post.id,
      authorId: post.authorId,
      kind: post.kind,
      title: post.title,
      body: post.body,
      topics: post.topics,
      durationSec: post.durationSec,
      hypeScore: 0,
    })
    const spread = Math.max(60000, nowMs - postPublished)
    const publishedAt = new Date(Math.min(nowMs - 60000, postPublished + spread * (0.15 + rng() * 0.7)))
    await Comments.create(ctx, {
      postId: post.id,
      authorId: entry.bot.id,
      text,
      likes: Math.floor(rng() * 5),
      publishedAt,
    })
    await Edges.create(ctx, {
      fromId: entry.bot.id,
      toId: author.id,
      kind: 'comment',
      postId: post.id,
      weight: 1,
    })
    if (rng() > 0.45) {
      await Edges.create(ctx, {
        fromId: entry.bot.id,
        toId: author.id,
        kind: 'like',
        postId: post.id,
        weight: 1,
      })
    }
    commentCount += 1
  }

  const baseViews = post.kind === 'video'
    ? 140 + Math.floor(rng() * 360)
    : post.kind === 'music'
      ? 90 + Math.floor(rng() * 260)
      : 30 + Math.floor(rng() * 110)
  const ageFactor = 1 + Math.min(2.5, postPublished > 0 ? (nowMs - postPublished) / (36 * 3600000) : 0)
  const views = Math.round(baseViews * ageFactor)
  const likes = Math.round(views * (0.12 + rng() * 0.18))
  const dislikes = rng() > 0.6 ? Math.floor(rng() * 4) : 0
  const watchRatio = post.kind === 'text' ? 0 : 0.25 + rng() * 0.5
  const watchSeconds = Math.round(views * post.durationSec * watchRatio)

  const updated = await Posts.update(ctx, {
    id: post.id,
    commentsCount: commentCount,
    likes,
    dislikes,
    views,
    watchSeconds,
    hypeScore: 0,
  })
  const hype = computeHype({ ...updated, publishedAt: post.publishedAt }, nowMs)
  await Posts.update(ctx, { id: post.id, hypeScore: hype })
  await Profiles.update(ctx, { id: author.id, postsCount: author.postsCount + 1 })

  return { comments: commentCount, likes, views }
}

export async function seedA5Net(ctx: app.Ctx, options: { force?: boolean } = {}): Promise<SeedReport> {
  const existing = await Profiles.countBy(ctx, { kind: 'bot' })
  if (existing > 0 && !options.force) {
    return { skipped: true, bots: 0, posts: 0, comments: 0, friendships: 0, collabs: 0, invites: 0 }
  }

  const owner = await ensureOwnerProfile(ctx).catch(() => null)
  const rng = mulberry32(hashSeed(`a5net-seed:${new Date().toISOString().slice(0, 10)}`))
  const bots: Array<typeof Profiles.T> = []

  for (let index = 0; index < botCount(); index += 1) {
    const draft = generatePersona(index)
    const bot = await Profiles.create(ctx, {
      handle: draft.handle,
      name: draft.name,
      age: draft.age,
      city: draft.city,
      bio: draft.bio,
      kind: 'bot',
      voiceTone: draft.voiceTone,
      commentLength: draft.commentLength,
      slang: draft.slang,
      emoji: draft.emoji,
      argumentative: draft.argumentative,
      politicalLeaning: draft.politicalLeaning,
      gender: draft.gender,
      typoRate: draft.typoRate,
      interests: draft.interests,
      interestVector: draft.interestVector,
      chronotype: draft.chronotype,
      avatarHue: draft.avatarHue,
      avatarAccent: draft.avatarAccent,
      enabled: true,
      isSynthetic: true,
      lastActionAt: new Date(Date.now() - Math.floor(rng() * 40) * 3600000),
      nextActionAt: new Date(Date.now() - Math.floor(rng() * 20) * 60000),
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      postsCount: 0,
    })
    bots.push(bot)
  }

  let postCount = 0
  let commentCount = 0

  for (const text of SEED_TEXTS) {
    const author = authorFor(bots, text.topics, rng)
    const post = await createPost(ctx, author, {
      kind: 'text',
      title: text.title,
      body: text.body,
      topics: text.topics,
      durationSec: 0,
      coverHue: (author.avatarHue + 18) % 360,
      ageHours: text.ageHours,
    })
    const engagement = await engage(ctx, post, author, bots, rng)
    postCount += 1
    commentCount += engagement.comments
  }

  for (const video of SEED_VIDEOS) {
    const asset = VIDEOS[video.index]!
    const author = authorFor(bots, video.topics, rng)
    const post = await createPost(ctx, author, {
      kind: 'video',
      title: asset.title,
      body: video.body,
      topics: video.topics,
      mediaUrl: asset.url,
      durationSec: asset.duration,
      coverHue: asset.hue,
      ageHours: video.ageHours,
    })
    const engagement = await engage(ctx, post, author, bots, rng)
    postCount += 1
    commentCount += engagement.comments
  }

  for (const track of SEED_TRACKS) {
    const asset = TRACKS[track.index]!
    const author = authorFor(bots, track.topics, rng)
    const post = await createPost(ctx, author, {
      kind: 'music',
      title: asset.title,
      body: `${asset.artist}. ${track.body}`,
      topics: track.topics,
      mediaUrl: asset.url,
      durationSec: asset.duration,
      coverHue: asset.hue,
      ageHours: track.ageHours,
    })
    const engagement = await engage(ctx, post, author, bots, rng)
    postCount += 1
    commentCount += engagement.comments
  }

  let collabCount = 0
  for (const brief of SEED_COLLABS) {
    const initiator = authorFor(bots, brief.topics, rng)
    const pool = bots
      .filter(bot => bot.id !== initiator.id)
      .map(bot => ({ bot, score: cosine(bot.interestVector, embedTopics(brief.topics)) + rng() * 0.2 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2 + Math.floor(rng() * 2))
      .map(entry => entry.bot.id)
    const collab = await Collabs.create(ctx, {
      title: brief.title,
      brief: brief.brief,
      initiatorId: initiator.id,
      participantIds: pool,
      status: rng() > 0.5 ? 'active' : 'open',
    })
    const post = await createPost(ctx, initiator, {
      kind: 'collab',
      title: brief.title,
      body: brief.brief,
      topics: brief.topics,
      durationSec: 0,
      coverHue: (initiator.avatarHue + 40) % 360,
      ageHours: brief.ageHours,
      collabId: collab.id,
    })
    await Collabs.update(ctx, { id: collab.id, postId: post.id })
    const engagement = await engage(ctx, post, initiator, bots, rng)
    postCount += 1
    commentCount += engagement.comments
    collabCount += 1
  }

  let friendships = 0
  const friendCounts = new Map<string, number>()
  for (let i = 0; i < bots.length; i += 1) {
    for (let j = i + 1; j < bots.length; j += 1) {
      const a = bots[i]!
      const b = bots[j]!
      const similarity = cosine(a.interestVector, b.interestVector)
      if (similarity < 0.5) continue
      if ((friendCounts.get(a.id) ?? 0) >= 7 || (friendCounts.get(b.id) ?? 0) >= 7) continue
      if (rng() > 0.42) continue
      await Friendships.create(ctx, {
        aId: a.id < b.id ? a.id : b.id,
        bId: a.id < b.id ? b.id : a.id,
        status: 'accepted',
        requestedBy: a.id,
      })
      friendCounts.set(a.id, (friendCounts.get(a.id) ?? 0) + 1)
      friendCounts.set(b.id, (friendCounts.get(b.id) ?? 0) + 1)
      friendships += 1
    }
  }

  const followCounts = new Map<string, number>()
  for (const a of bots) {
    for (const b of bots) {
      if (a.id === b.id) continue
      if ((followCounts.get(a.id) ?? 0) >= 11) break
      if (cosine(a.interestVector, b.interestVector) < 0.45) continue
      if (rng() > 0.28) continue
      await Edges.create(ctx, { fromId: a.id, toId: b.id, kind: 'follow', weight: 1 })
      followCounts.set(a.id, (followCounts.get(a.id) ?? 0) + 1)
    }
  }

  for (const bot of bots) {
    const friends = friendCounts.get(bot.id) ?? 0
    const follows = followCounts.get(bot.id) ?? 0
    await Profiles.update(ctx, {
      id: bot.id,
      friendsCount: friends,
      followingCount: follows,
      followersCount: Math.max(0, Math.round(follows * (0.7 + rng() * 0.9))),
    })
    await remember(
      ctx,
      bot,
      'impression',
      `Мне близко: ${bot.interests.slice(0, 3).map(topicPath).join('; ')}.`,
      bot.interests,
      1,
    )
  }

  let invites = 0
  const inviteAuthor = owner?.profile.id ?? bots[0]!.id
  for (const invite of SEED_INVITES) {
    const existingInvite = await findInviteByCode(ctx, invite.code)
    if (existingInvite) continue
    await createInviteRecord(ctx, {
      code: invite.code,
      note: invite.note,
      maxUses: invite.maxUses,
      createdByProfileId: inviteAuthor,
    })
    invites += 1
  }

  const fleet: FleetSettings = { ...DEFAULT_FLEET, enabled: true, aggressiveness: 0.45, intervalMin: 3, intervalMax: 12, maxBotsPerTick: 3 }
  await saveFleet(ctx, fleet)
  await setSetting(ctx, SEED_KEY, { version: 1, seededAt: new Date().toISOString(), bots: bots.length })

  try {
    await botTickJob.scheduleJobAfter(ctx, 2, 'minutes')
  } catch (error) {
    ctx.log(`A5NET seed: не удалось запланировать тик: ${error instanceof Error ? error.message : error}`)
  }

  return {
    skipped: false,
    bots: bots.length,
    posts: postCount,
    comments: commentCount,
    friendships,
    collabs: collabCount,
    invites,
  }
}
