import Communities from '../tables/communities.table'
import Profiles from '../tables/profiles.table'
import Posts from '../tables/posts.table'
import type { CommunitiesData } from '../shared/types'
import { rootTopic } from './taxonomy'
import { toAuthorCard } from './social'

export async function getCommunitiesData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<CommunitiesData> {
  const rows = await Communities.findAll(ctx, { limit: 30, order: [{ createdAt: 'asc' }] })
  const profiles = await Profiles.findAll(ctx, { limit: 500 })
  const posts = await Posts.findAll(ctx, { where: { visibility: 'visible' }, limit: 300, order: [{ publishedAt: 'desc' }] })
  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    items: rows.map(row => {
      const interested = profiles.filter(profile => profile.interests.some(id => rootTopic(id).id === row.topicId)).length
      const members = new Set([...row.memberIds, row.creatorId])
      const related = posts.filter(post => post.topics.some(id => rootTopic(id).id === row.topicId))
      const latest = related[0]
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        topicId: row.topicId,
        coverHue: row.coverHue,
        members: Math.max(members.size, interested),
        posts: related.length,
        latestTitle: latest?.title ?? null,
        latestPostId: latest?.id ?? null,
        joined: members.has(viewer.id),
      }
    }),
    now: new Date().toISOString(),
  }
}

export async function toggleCommunity(
  ctx: app.Ctx,
  communityId: string,
  profileId: string,
): Promise<boolean> {
  const row = await Communities.findById(ctx, communityId)
  if (!row) return false
  const members = new Set(row.memberIds)
  if (members.has(profileId)) members.delete(profileId)
  else members.add(profileId)
  await Communities.update(ctx, { id: row.id, memberIds: [...members] })
  return true
}
