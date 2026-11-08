import { requireRealUser } from '@app/auth'
import { requireSameOrigin } from '../../server/http-guard'
import { disableOwnerPass } from '../../server/security'

export const securityDisableRoute = app.post('/')
  .body(s => ({ passphrase: s.string().min(1).max(120) }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const user = requireRealUser(ctx)
      if (!user.is('Owner')) return { ok: false as const, error: 'Только для A5000.' }
      const result = await disableOwnerPass(ctx, req.body.passphrase)
      if (!result.ok) return { ok: false as const, error: result.error }
      return { ok: true as const }
    } catch {
      return { ok: false as const, error: 'Не удалось выключить A5 Pass.' }
    }
  })
