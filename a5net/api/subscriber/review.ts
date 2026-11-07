import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireOwner } from '../../server/access'
import { reviewSubscriberTransfer } from '../../server/subscribers'

export const subscriberReviewRoute = app.post('/')
  .body(s => ({
    id: s.string(),
    action: s.enum(['approve', 'reject'] as const),
    count: s.number().min(0).max(100_000_000).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireOwner(ctx)
      const result = await reviewSubscriberTransfer(
        ctx,
        req.body.id,
        req.body.action,
        req.body.count,
        membership.profile.id,
      )
      if (!result.ok) return { ok: false as const, error: result.error ?? 'Не удалось обработать заявку.' }
      return { ok: true as const, count: result.count ?? 0 }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
