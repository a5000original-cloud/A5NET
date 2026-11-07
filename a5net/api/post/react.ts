import { requireSameOrigin } from '../../server/http-guard'
import Posts from '../../tables/posts.table'
import Reactions from '../../tables/reactions.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'
import { addEdge } from '../../server/social'
import { refreshHype } from '../../server/hype'

export const postReactRoute = app.post('/')
  .body(s => ({ id: s.string(), value: s.enum(['like', 'dislike'] as const) }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const viewer = membership.profile
      const rate = await consumeRate(ctx, 'post:react', viewer.id, 120, 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const post = await Posts.findById(ctx, req.body.id)
      if (!post) return { ok: false as const, error: 'Пост не найден.' }

      const existing = await Reactions.findOneBy(ctx, { postId: post.id, profileId: viewer.id })
      let likes = post.likes
      let dislikes = post.dislikes
      let next: 'like' | 'dislike' | null = req.body.value

      if (existing?.value === req.body.value) {
        next = null
        await Reactions.delete(ctx, existing.id)
        if (req.body.value === 'like') likes = Math.max(0, likes - 1)
        else dislikes = Math.max(0, dislikes - 1)
      } else {
        if (existing) {
          if (existing.value === 'like') likes = Math.max(0, likes - 1)
          else dislikes = Math.max(0, dislikes - 1)
          await Reactions.update(ctx, { id: existing.id, value: req.body.value })
        } else {
          await Reactions.create(ctx, { postId: post.id, profileId: viewer.id, value: req.body.value })
        }
        if (req.body.value === 'like') likes += 1
        else dislikes += 1
      }

      await Posts.update(ctx, { id: post.id, likes, dislikes })
      if (next) {
        await addEdge(ctx, {
          fromId: viewer.id,
          toId: post.authorId,
          kind: next === 'like' ? 'like' : 'dislike',
          postId: post.id,
        })
      }
      await refreshHype(ctx, post.id)
      return { ok: true as const, likes, dislikes, viewerReaction: next }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
