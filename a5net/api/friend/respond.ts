import { memberErrorCode, requireMember } from '../../server/access'
import { acceptFriendship } from '../../server/social'

export const friendRespondRoute = app.post('/')
  .body(s => ({ profileId: s.string(), accept: s.boolean() }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      if (!req.body.accept) return { ok: true as const, accepted: false }
      const accepted = await acceptFriendship(ctx, membership.profile.id, req.body.profileId)
      if (!accepted) return { ok: false as const, error: 'Заявка не найдена.' }
      return { ok: true as const, accepted: true }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
