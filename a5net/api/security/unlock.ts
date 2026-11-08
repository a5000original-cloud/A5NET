import { requireRealUser } from '@app/auth'
import { requireSameOrigin } from '../../server/http-guard'
import { unlockOwnerPass } from '../../server/security'

export const securityUnlockRoute = app.post('/')
  .body(s => ({ passphrase: s.string().min(1).max(120), label: s.string().max(80).optional() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const user = requireRealUser(ctx)
      if (!user.is('Owner')) return { ok: false as const, error: 'Только для A5000.' }
      const result = await unlockOwnerPass(ctx, req.body.passphrase, req.body.label ?? 'Новое устройство')
      if (!result.ok) return { ok: false as const, error: result.error }
      return { ok: true as const }
    } catch {
      return { ok: false as const, error: 'Не удалось проверить пароль.' }
    }
  })
