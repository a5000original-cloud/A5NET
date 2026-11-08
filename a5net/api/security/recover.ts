import { requireRealUser } from '@app/auth'
import { requireSameOrigin } from '../../server/http-guard'
import { recoverOwnerPass } from '../../server/security'

export const securityRecoverRoute = app.post('/')
  .body(s => ({ code: s.string().min(4).max(40), label: s.string().max(80).optional() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const user = requireRealUser(ctx)
      if (!user.is('Owner')) return { ok: false as const, error: 'Только для A5000.' }
      const result = await recoverOwnerPass(ctx, req.body.code, req.body.label ?? 'Восстановленное устройство')
      if (!result.ok) return { ok: false as const, error: result.error }
      return { ok: true as const }
    } catch {
      return { ok: false as const, error: 'Код не сработал.' }
    }
  })
