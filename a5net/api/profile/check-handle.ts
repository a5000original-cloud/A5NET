import { memberErrorCode, requireMember } from '../../server/access'
import { checkHandle } from '../../server/profile-settings'

export const profileCheckHandleRoute = app.get('/')
  .query(s => ({ handle: s.string().max(40) }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const result = await checkHandle(
        ctx,
        req.query.handle,
        membership.profile,
        Boolean(ctx.user?.is('Owner')),
      )
      return { ok: result.ok, handle: result.handle, error: result.error }
    } catch (error) {
      return { ok: false, handle: '', error: memberErrorCode(error) }
    }
  })
