import { requireRealUser } from '@app/auth'
import { requireSameOrigin } from '../../server/http-guard'
import { enableOwnerPass } from '../../server/security'

export const securityEnableRoute = app.post('/')
  .body(s => ({ passphrase: s.string().min(6).max(120), confirm: s.string().min(6).max(120), email: s.string().max(120).optional(), phone: s.string().max(40).optional() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const user = requireRealUser(ctx)
      if (!user.is('Owner')) return { ok: false as const, error: 'Только для A5000.' }
      if (req.body.passphrase !== req.body.confirm) return { ok: false as const, error: 'Пароли не совпадают.' }
      const result = await enableOwnerPass(ctx, req.body.passphrase, req.body.email ?? '', req.body.phone ?? '')
      if (!result.ok) return { ok: false as const, error: result.error }
      return { ok: true as const, recoveryCodes: result.recoveryCodes }
    } catch {
      return { ok: false as const, error: 'Не удалось включить A5 Pass.' }
    }
  })
