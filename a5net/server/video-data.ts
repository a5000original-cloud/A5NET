import Profiles from '../tables/profiles.table'
import Watches from '../tables/watches.table'
import type { PostCard, TopicRef, VideoHubData, WatchData } from '../shared/types'
import { listPosts } from './post-data'
import { getViewerSocial, toAuthorCard } from './social'
import { loadPostPage } from './post-page'
import { topicById } from './taxonomy'

export async function getVideoHubData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<VideoHubData> {
  const [page, social, watches] = await Promise.all([
    listPosts(ctx, { viewerId: viewer.id, kind: 'video', limit: 60 }),
    getViewerSocial(ctx, viewer.id),
    Watches.findAll(ctx, { where: { profileId: viewer.id }, limit: 40, order: [{ createdAt: 'desc' }] }),
  ])
  const videos = page.items
  const featured = [...videos].sort((a, b) => b.hypeScore - a.hypeScore)[0] ?? null

  const watched = new Map<string, number>()
  for (const watch of watches) {
    if (!watched.has(watch.postId)) watched.set(watch.postId, watch.seconds)
  }
  const byId = new Map(videos.map(video => [video.id, video]))
  const continueWatching = [...watched.entries()]
    .map(([id, seconds]) => {
      const post = byId.get(id)
      if (!post) return null
      return { post, progress: post.durationSec ? Math.min(1, seconds / post.durationSec) : 0 }
    })
    .filter((item): item is { post: PostCard; progress: number } => Boolean(item) && (item?.progress ?? 0) < 0.95)
    .slice(0, 6)

  const subscriptions = videos.filter(video => social.followingIds.has(video.author.id)).slice(0, 8)
  const topicCounts = new Map<string, { topic: TopicRef; count: number }>()
  for (const video of videos) {
    for (const topic of video.topics) {
      const current = topicCounts.get(topic.id) ?? { topic, count: 0 }
      current.count += 1
      topicCounts.set(topic.id, current)
    }
  }
  const topics = [...topicCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 9)
    .map(entry => entry.topic)

  const hoursWatched = videos.reduce((sum, video) => sum + video.views * video.durationSec, 0) / 3600
  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    videos,
    featured,
    continueWatching,
    subscriptions,
    topics,
    stats: {
      videos: videos.length,
      hoursWatched: Math.round(hoursWatched * 10) / 10,
      creators: new Set(videos.map(video => video.author.id)).size,
    },
    now: new Date().toISOString(),
  }
}

export async function getWatchData(
  ctx: app.Ctx,
  postId: string,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<WatchData | null> {
  const page = await loadPostPage(ctx, postId, viewer, role)
  if (!page || page.post.kind !== 'video') return null
  const related = await listPosts(ctx, { viewerId: viewer.id, kind: 'video', limit: 18 })
  const topicSet = new Set(page.post.topics.map(topic => topic.id))
  const relatedVideos = related.items
    .filter(video => video.id !== postId)
    .sort((first, second) => {
      const aOverlap = first.topics.filter(topic => topicSet.has(topic.id)).length
      const bOverlap = second.topics.filter(topic => topicSet.has(topic.id)).length
      return bOverlap - aOverlap || second.hypeScore - first.hypeScore
    })
    .slice(0, 10)
  return { ...page, relatedVideos }
}

export function topicRef(id: string): TopicRef {
  const topic = topicById(id)
  return { id: topic.id, label: topic.label, hue: topic.hue }
}
