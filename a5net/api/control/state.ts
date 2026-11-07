import { memberErrorCode, requireOwner } from '../../server/access'
import { getControlData } from '../../server/control-data'

export const controlStateRoute = app.get('/')
  .handle(async ctx => {
    try {
      const membership = await requireOwner(ctx)
      const data = await getControlData(ctx)
      return { ok: true as const, data, role: membership.role }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
