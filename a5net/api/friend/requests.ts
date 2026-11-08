import { memberErrorCode, requireMember } from '../../server/access'
import { getFriendsData } from '../../server/friends'

export const friendRequestsRoute = app.get('/')
  .handle(async ctx => {
    try {
      const membership = await requireMember(ctx)
      return { ok: true as const, data: await getFriendsData(ctx, membership.profile, membership.role) }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error), data: null }
    }
  })
