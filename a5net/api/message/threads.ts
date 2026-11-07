import { memberErrorCode, requireMember } from '../../server/access'
import { getInboxData } from '../../server/messages'

export const messageThreadsRoute = app.get('/')
  .query(s => ({ peer: s.string().max(80).optional() }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const data = await getInboxData(ctx, membership.profile, membership.role, req.query.peer)
      return { ok: true as const, data }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error), data: null }
    }
  })
