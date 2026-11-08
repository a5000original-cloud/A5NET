import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireMember } from '../../server/access'
import { respondFriendRequest } from '../../server/friends'

export const friendRespondRoute = app.post('/')
  .body(s => ({ profileId: s.string(), accept: s.boolean() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const accepted = await respondFriendRequest(ctx, membership.profile, req.body.profileId, req.body.accept)
      if (!accepted) return { ok: false as const, error: 'Заявка не найдена.' }
      return { ok: true as const, accepted: req.body.accept }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
