import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireMember } from '../../server/access'
import { markNotificationsRead } from '../../server/notifications'

export const notificationReadRoute = app.post('/')
  .handle(async ctx => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      await markNotificationsRead(ctx, membership.profile.id)
      return { ok: true as const }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
