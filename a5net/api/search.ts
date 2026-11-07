import Profiles from '../tables/profiles.table'
import Posts from '../tables/posts.table'
import Reactions from '../tables/reactions.table'
import { memberErrorCode, requireMember } from '../server/access'
import { getAuthorMap, toAuthorCard } from '../server/social'
import { toPostCard } from '../server/post-data'
import { canonicalHandle } from '../server/profile-settings'

export const searchRoute = app.get('/')
  .query(s => ({ q: s.string().max(80) }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const raw = req.query.q.trim().toLowerCase()
      if (raw.length < 2) return { ok: true as const, profiles: [], posts: [] }
      const canonical = canonicalHandle(raw)

      const [profiles, posts] = await Promise.all([
        Profiles.findAll(ctx, { limit: 400 }),
        Posts.findAll(ctx, { where: { visibility: 'visible' }, limit: 240, order: [{ publishedAt: 'desc' }] }),
      ])

      const matchedProfiles = profiles
        .filter(profile =>
          profile.name.toLowerCase().includes(raw) ||
          profile.handle.toLowerCase().includes(raw) ||
          (canonical.length > 2 && canonicalHandle(profile.handle).includes(canonical)),
        )
        .slice(0, 8)
        .map(toAuthorCard)

      const matchedPosts = posts
        .filter(post =>
          post.title.toLowerCase().includes(raw) ||
          post.body.toLowerCase().includes(raw) ||
          post.topics.some(topic => topic.toLowerCase().includes(raw)),
        )
        .slice(0, 8)
      const authorMap = await getAuthorMap(ctx, matchedPosts.map(post => post.authorId))
      const now = Date.now()
      const reactions = matchedPosts.length
        ? await Reactions.findAll(ctx, {
          where: { postId: matchedPosts.map(post => post.id), profileId: membership.profile.id },
          limit: matchedPosts.length,
        })
        : []
      const reactionMap = new Map(reactions.map(row => [row.postId, row.value as 'like' | 'dislike']))

      return {
        ok: true as const,
        profiles: matchedProfiles,
        posts: matchedPosts.map(post =>
          toPostCard(
            post,
            authorMap.get(post.authorId) ?? toAuthorCard(membership.profile),
            reactionMap.get(post.id) ?? null,
            now,
          ),
        ),
      }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error), profiles: [], posts: [] }
    }
  })
