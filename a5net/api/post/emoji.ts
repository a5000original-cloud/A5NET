import { requireSameOrigin } from '../../server/http-guard'
import Posts from '../../tables/posts.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'
import { toggleEmoji } from '../../server/emoji'

const EMOJI = ['fire', 'heart', 'lol', 'wow', 'sad', 'respect'] as const

export const postEmojiRoute = app.post('/')
  .body(s => ({ id: s.string(), emoji: s.enum(EMOJI) }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const rate = await consumeRate(ctx, 'post:emoji', membership.profile.id, 240, 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const post = await Posts.findById(ctx, req.body.id)
      if (!post) return { ok: false as const, error: 'Пост не найден.' }
      const result = await toggleEmoji(ctx, post.id, membership.profile.id, req.body.emoji)
      return { ok: true as const, ...result }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
