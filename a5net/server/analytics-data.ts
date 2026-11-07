import Profiles from '../tables/profiles.table'
import Posts from '../tables/posts.table'
import Watches from '../tables/watches.table'
import type { AnalyticsDaily, AnalyticsPostRow, ProfileAnalyticsData, TopicRef } from '../shared/types'
import { timeAgo } from '../shared/format'
import { getAuthorMap, toAuthorCard } from './social'
import { topicById } from './taxonomy'

export async function getProfileAnalytics(
  ctx: app.Ctx,
  profileId: string,
): Promise<ProfileAnalyticsData | null> {
  const profile = await Profiles.findById(ctx, profileId)
  if (!profile) return null
  const posts = await Posts.findAll(ctx, {
    where: { authorId: profileId, visibility: 'visible' },
    limit: 100,
    order: [{ publishedAt: 'desc' }],
  })
  const postIds = posts.map(post => post.id)
  const watches = postIds.length
    ? await Watches.findAll(ctx, { where: { postId: postIds }, limit: 1000, order: [{ createdAt: 'desc' }] })
    : []

  const now = Date.now()
  const viewCounts = posts.map(post => Math.max(post.views, post.likes + post.dislikes))
  const sortedViews = [...viewCounts].sort((a, b) => a - b)
  const median = sortedViews[Math.floor(sortedViews.length / 2)] ?? 0

  const rows: AnalyticsPostRow[] = posts.map(post => {
    const views = Math.max(post.views, post.likes + post.dislikes)
    const trend = views >= Math.max(1, median * 1.5) ? 'hit' : views <= median * 0.5 ? 'miss' : 'steady'
    const created = post.publishedAt instanceof Date ? post.publishedAt : new Date(post.publishedAt)
    return {
      id: post.id,
      title: post.title,
      kind: post.kind,
      views,
      likes: post.likes,
      comments: post.commentsCount,
      watchHours: Math.round((post.watchSeconds / 3600) * 10) / 10,
      hype: post.hypeScore,
      coverUrl: post.coverUrl ?? null,
      ago: timeAgo(created.toISOString(), now),
      trend,
    }
  })

  const audienceCounts = new Map<string, number>()
  for (const watch of watches) {
    audienceCounts.set(watch.profileId, (audienceCounts.get(watch.profileId) ?? 0) + 1)
  }
  const audienceIds = [...audienceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0])
  const audienceMap = await getAuthorMap(ctx, audienceIds)
  const audience = audienceIds
    .map(id => {
      const author = audienceMap.get(id)
      return author ? { author, views: audienceCounts.get(id) ?? 0 } : null
    })
    .filter((item): item is { author: ReturnType<typeof toAuthorCard>; views: number } => Boolean(item))

  const daily: AnalyticsDaily[] = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(now - offset * 86400000)
    const key = day.toISOString().slice(0, 10)
    const label = day.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    const count = watches.filter(watch => {
      const created = watch.createdAt instanceof Date ? watch.createdAt : new Date(watch.createdAt)
      return created.toISOString().slice(0, 10) === key
    }).length
    daily.push({ label, views: count })
  }

  const topicCounts = new Map<string, number>()
  for (const post of posts) {
    for (const topic of post.topics) topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1)
  }
  const topTopics: TopicRef[] = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => {
      const topic = topicById(id)
      return { id: topic.id, label: topic.label, hue: topic.hue }
    })

  const hits = rows.filter(row => row.trend === 'hit').length
  return {
    profile: toAuthorCard(profile),
    totals: {
      views: viewCounts.reduce((sum, value) => sum + value, 0),
      likes: posts.reduce((sum, post) => sum + post.likes, 0),
      comments: posts.reduce((sum, post) => sum + post.commentsCount, 0),
      watchHours: Math.round((posts.reduce((sum, post) => sum + post.watchSeconds, 0) / 3600) * 10) / 10,
      followers: profile.followersCount,
      posts: posts.length,
    },
    posts: rows,
    audience,
    daily,
    topTopics,
    hitRate: rows.length ? Math.round((hits / rows.length) * 100) : 0,
    now: new Date(now).toISOString(),
  }
}
