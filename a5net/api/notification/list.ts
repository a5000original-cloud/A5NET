import { memberErrorCode, requireMember } from '../../server/access'
import { getNotificationsData } from '../../server/notifications'

export const notificationListRoute = app.get('/')
  .handle(async ctx => {
    try {
      const membership = await requireMember(ctx)
      return { ok: true as const, data: await getNotificationsData(ctx, membership.profile, membership.role) }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error), data: null }
    }
  })
