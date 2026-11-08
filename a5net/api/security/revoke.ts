import { requireRealUser } from '@app/auth'
import { requireSameOrigin } from '../../server/http-guard'
import { revokeOwnerDevice } from '../../server/security'

export const securityRevokeRoute = app.post('/')
  .body(s => ({ id: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const user = requireRealUser(ctx)
      if (!user.is('Owner')) return { ok: false as const, error: 'Только для A5000.' }
      const ok = await revokeOwnerDevice(ctx, req.body.id)
      return ok ? { ok: true as const } : { ok: false as const, error: 'Устройство не найдено.' }
    } catch {
      return { ok: false as const, error: 'Не удалось отозвать устройство.' }
    }
  })
