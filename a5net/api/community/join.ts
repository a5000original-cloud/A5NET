import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireMember } from '../../server/access'
import { toggleCommunity } from '../../server/communities'

export const communityJoinRoute = app.post('/')
  .body(s => ({ id: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const ok = await toggleCommunity(ctx, req.body.id, membership.profile.id)
      return ok ? { ok: true as const } : { ok: false as const, error: 'Сообщество не найдено.' }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
