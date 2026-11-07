import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireMember } from '../../server/access'
import { createInviteRecord } from '../../server/invites'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'

export const inviteCreateRoute = app.post('/')
  .body(s => ({
    note: s.string().max(120).optional(),
    maxUses: s.number().int().min(1).max(25).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const canCreate = membership.role === 'owner' || membership.role === 'admin' || Boolean(ctx.user?.is('Staff'))
      if (!canCreate) return { ok: false as const, error: 'Инвайты создают только администраторы.' }

      const rate = await consumeRate(ctx, 'invite:create', membership.profile.id, 20, 24 * 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }

      const created = await createInviteRecord(ctx, {
        note: req.body.note?.trim() || 'Без комментария',
        maxUses: req.body.maxUses ?? 1,
        createdByProfileId: membership.profile.id,
      })
      return { ok: true as const, code: created.code, id: created.invite.id }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
