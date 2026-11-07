import { memberErrorCode, requireMember } from '../../server/access'
import { listSubscriberTransfers } from '../../server/subscribers'

export const subscriberListRoute = app.get('/')
  .handle(async ctx => {
    try {
      const membership = await requireMember(ctx)
      const transfers = await listSubscriberTransfers(ctx, membership.profile.id)
      return { ok: true as const, transfers }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error), transfers: [] }
    }
  })
