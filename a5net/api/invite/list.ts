import { memberErrorCode, requireMember } from '../../server/access'
import { getInvitesData } from '../../server/invite-data'

export const inviteListRoute = app.get('/')
  .handle(async ctx => {
    try {
      const membership = await requireMember(ctx)
      const data = await getInvitesData(ctx, membership.profile, membership.role)
      return { ok: true as const, data }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
