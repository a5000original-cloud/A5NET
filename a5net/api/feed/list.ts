import { getFeedData } from '../../server/feed'
import { memberErrorCode, requireMember } from '../../server/access'

export const feedListRoute = app.get('/')
  .query(s => ({ offset: s.number().int().min(0).optional() }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const data = await getFeedData(ctx, membership.profile, membership.role, req.query.offset ?? 0)
      return { ok: true as const, data }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
