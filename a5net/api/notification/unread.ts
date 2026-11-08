import { memberErrorCode, requireMember } from '../../server/access'
import { unreadNotifications } from '../../server/notifications'

export const notificationUnreadRoute = app.get('/')
  .handle(async ctx => {
    try {
      const membership = await requireMember(ctx)
      return { ok: true as const, count: await unreadNotifications(ctx, membership.profile.id) }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error), count: 0 }
    }
  })
