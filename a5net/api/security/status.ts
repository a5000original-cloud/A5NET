import { requireRealUser } from '@app/auth'
import { getSecurityPageData } from '../../server/security'

export const securityStatusRoute = app.get('/')
  .handle(async ctx => {
    try {
      const user = requireRealUser(ctx)
      if (!user.is('Owner')) return { ok: false as const, error: 'Только для A5000.' }
      return { ok: true as const, data: await getSecurityPageData(ctx) }
    } catch {
      return { ok: false as const, error: 'Только для A5000.' }
    }
  })
