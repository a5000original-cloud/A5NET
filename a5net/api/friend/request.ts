import { requireSameOrigin } from '../../server/http-guard'
import Profiles from '../../tables/profiles.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'
import { requestFriendship } from '../../server/social'

export const friendRequestRoute = app.post('/')
  .body(s => ({ profileId: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const viewer = membership.profile
      const rate = await consumeRate(ctx, 'friend:request', viewer.id, 20, 24 * 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const target = await Profiles.findById(ctx, req.body.profileId)
      if (!target) return { ok: false as const, error: 'Профиль не найден.' }
      const result = await requestFriendship(ctx, viewer.id, target.id)
      if (result === 'self') return { ok: false as const, error: 'Это твой профиль.' }
      return { ok: true as const, status: result }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
