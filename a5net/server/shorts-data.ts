import Profiles from '../tables/profiles.table'
import type { PostCard, ShortsData } from '../shared/types'
import { listPosts } from './post-data'
import { toAuthorCard } from './social'

export async function getShortsData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<ShortsData> {
  const page = await listPosts(ctx, { viewerId: viewer.id, kind: 'video', limit: 60 })
  const vertical = page.items.filter(item => item.orientation === 'vertical')
  const items: PostCard[] = vertical.length ? vertical : page.items.slice(0, 8)
  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    items,
    now: new Date().toISOString(),
  }
}
