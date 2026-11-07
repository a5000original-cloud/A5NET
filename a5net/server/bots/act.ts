import Posts from '../../tables/posts.table'
import Comments from '../../tables/comments.table'
import Reactions from '../../tables/reactions.table'
import Watches from '../../tables/watches.table'
import Profiles from '../../tables/profiles.table'
import Collabs from '../../tables/collabs.table'
import Edges from '../../tables/edges.table'
import { addEdge, requestFriendship, type ViewerSocial } from '../social'
import { refreshHype } from '../hype'
import { cosine, postVector } from '../vec'
import type { LocalDecision, LocalPost } from './local'
import { localPost, type BotAction } from './local'
import type { PersonaDraft } from './personas'

export interface ActionResult {
  status: 'done' | 'wait'
  targetTitle: string
  detail: string
  postId?: string
}

function personaOf(profile: typeof Profiles.T): PersonaDraft {
  return {
    handle: profile.handle,
    name: profile.name,
    age: profile.age,
    city: profile.city,
    bio: profile.bio,
    voiceTone: profile.voiceTone,
    commentLength: profile.commentLength,
    slang: profile.slang,
    emoji: profile.emoji,
    argumentative: profile.argumentative,
    politicalLeaning: profile.politicalLeaning,
    interests: profile.interests,
    interestVector: profile.interestVector,
    chronotype: profile.chronotype,
    avatarHue: profile.avatarHue,
    avatarAccent: profile.avatarAccent,
  }
}

async function setReaction(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  post: typeof Posts.T,
  value: 'like' | 'dislike',
): Promise<{ changed: boolean; detail: string }> {
  const existing = await Reactions.findOneBy(ctx, { postId: post.id, profileId: profile.id })
  if (existing?.value === value) return { changed: false, detail: 'реакция уже стояла' }

  let likes = post.likes
  let dislikes = post.dislikes
  if (existing) {
    if (existing.value === 'like') likes = Math.max(0, likes - 1)
    if (existing.value === 'dislike') dislikes = Math.max(0, dislikes - 1)
    await Reactions.update(ctx, { id: existing.id, value })
  } else {
    await Reactions.create(ctx, { postId: post.id, profileId: profile.id, value })
  }
  if (value === 'like') likes += 1
  if (value === 'dislike') dislikes += 1
  await Posts.update(ctx, { id: post.id, likes, dislikes })
  await addEdge(ctx, { fromId: profile.id, toId: post.authorId, kind: value, postId: post.id })
  await refreshHype(ctx, post.id)
  return { changed: true, detail: value === 'like' ? 'поставил лайк' : 'поставил дизлайк' }
}

export async function executeAction(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  decision: LocalDecision,
  feed: LocalPost[],
  social: ViewerSocial,
): Promise<ActionResult> {
  const action: BotAction = decision.action
  if (action === 'WAIT') {
    return { status: 'wait', targetTitle: '', detail: decision.reason || 'пролистал ленту' }
  }

  if (action === 'POST') {
    const draft = localPost(profile)
    if (decision.content && decision.content.trim().length > 10) {
      draft.kind = 'text'
      draft.title = (decision.targetId || decision.content.split(/(?<=[.!?])\s/)[0] || 'Без названия').slice(0, 90)
      draft.body = decision.content.trim().slice(0, 400)
      draft.mediaUrl = null
      draft.durationSec = 0
    }
    const post = await Posts.create(ctx, {
      authorId: profile.id,
      kind: draft.kind,
      title: draft.title.slice(0, 120),
      body: draft.body.slice(0, 600),
      topics: draft.topics,
      mediaUrl: draft.mediaUrl ?? undefined,
      coverHue: draft.coverHue,
      durationSec: draft.durationSec,
      hypeScore: 2 + Math.round(Math.random() * 6),
      likes: 0,
      dislikes: 0,
      commentsCount: 0,
      views: 0,
      watchSeconds: 0,
      publishedAt: new Date(),
    })
    await Profiles.update(ctx, { id: profile.id, postsCount: profile.postsCount + 1 })
    return { status: 'done', targetTitle: draft.title, detail: 'опубликовал пост', postId: post.id }
  }

  if (action === 'JOIN_COLLAB') {
    const open = await Collabs.findAll(ctx, { where: { status: 'open' }, limit: 10, order: [{ createdAt: 'desc' }] })
    const target = open.find(collab => !collab.participantIds.includes(profile.id) && collab.initiatorId !== profile.id)
    if (!target) return { status: 'wait', targetTitle: '', detail: 'не нашёл открытой коллаборации' }
    const participants = [...target.participantIds, profile.id]
    await Collabs.update(ctx, {
      id: target.id,
      participantIds: participants,
      status: participants.length >= 2 ? 'active' : 'open',
    })
    await addEdge(ctx, { fromId: profile.id, toId: target.initiatorId, kind: 'collab' })
    return { status: 'done', targetTitle: target.title, detail: 'вошёл в коллаборацию' }
  }

  const target = feed.find(post => post.id === decision.targetId)
  if (!target) {
    return { status: 'wait', targetTitle: '', detail: 'не нашёл цель' }
  }
  const post = await Posts.findById(ctx, target.id)
  if (!post) return { status: 'wait', targetTitle: '', detail: 'пост исчез' }

  if (action === 'LIKE' || action === 'DISLIKE') {
    const result = await setReaction(ctx, profile, post, action === 'LIKE' ? 'like' : 'dislike')
    return { status: 'done', targetTitle: post.title, detail: result.detail }
  }

  if (action === 'COMMENT') {
    const text = decision.content.trim().slice(0, 500)
    if (!text) return { status: 'wait', targetTitle: post.title, detail: 'не придумал комментарий' }
    await Comments.create(ctx, {
      postId: post.id,
      authorId: profile.id,
      text,
      likes: 0,
      publishedAt: new Date(),
    })
    await Posts.update(ctx, { id: post.id, commentsCount: post.commentsCount + 1 })
    await addEdge(ctx, { fromId: profile.id, toId: post.authorId, kind: 'comment', postId: post.id })
    await refreshHype(ctx, post.id)
    return { status: 'done', targetTitle: post.title, detail: 'написал комментарий' }
  }

  if (action === 'WATCH_VIDEO') {
    const seconds = Math.max(1, Math.min(post.durationSec || 60, decision.watchTimeSeconds ?? 8))
    const completed = seconds >= (post.durationSec || 1) * 0.9
    await Watches.create(ctx, { postId: post.id, profileId: profile.id, seconds, completed })
    await Posts.update(ctx, {
      id: post.id,
      views: post.views + 1,
      watchSeconds: post.watchSeconds + seconds,
    })
    await refreshHype(ctx, post.id)
    const affinity = Math.max(0, cosine(profile.interestVector, postVector(post.title, post.body, post.topics)))
    const likeChance = 0.45 + (affinity > 0.4 ? 0.2 : 0) + (social.friendIds.has(post.authorId) ? 0.12 : 0)
    let detail = completed ? 'досмотрел до конца' : 'посмотрел несколько секунд'
    if (Math.random() < likeChance) {
      const fresh = await Posts.findById(ctx, post.id)
      if (fresh) {
        const liked = await setReaction(ctx, profile, fresh, 'like')
        if (liked.changed) detail += ' и лайкнул'
      }
    }
    return { status: 'done', targetTitle: post.title, detail }
  }

  if (action === 'FOLLOW') {
    const authorId = decision.targetId ?? post.authorId
    const existing = await Edges.findOneBy(ctx, { fromId: profile.id, toId: authorId, kind: 'follow' })
    if (!existing) {
      await addEdge(ctx, { fromId: profile.id, toId: authorId, kind: 'follow' })
      const author = await Profiles.findById(ctx, authorId)
      if (author) {
        await Profiles.update(ctx, { id: author.id, followersCount: author.followersCount + 1 })
        await Profiles.update(ctx, { id: profile.id, followingCount: profile.followingCount + 1 })
      }
    }
    return { status: 'done', targetTitle: post.title, detail: existing ? 'уже был подписан' : 'подписался' }
  }

  if (action === 'FRIEND_REQUEST') {
    const authorId = decision.targetId ?? post.authorId
    const result = await requestFriendship(ctx, profile.id, authorId)
    return {
      status: 'done',
      targetTitle: post.title,
      detail: result === 'created' ? 'отправил заявку в друзья' : 'заявка уже существует',
    }
  }

  return { status: 'wait', targetTitle: '', detail: 'неизвестное действие' }
}
