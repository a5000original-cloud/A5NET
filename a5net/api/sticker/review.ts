import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireOwner } from '../../server/access'
import { reviewSticker } from '../../server/stickers'

export const stickerReviewRoute = app.post('/')
  .body(s => ({ id: s.string(), action: s.enum(['approve', 'reject'] as const) }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireOwner(ctx)
      const ok = await reviewSticker(ctx, req.body.id, req.body.action, membership.profile.id)
      return ok ? { ok: true as const } : { ok: false as const, error: 'Наклейка не найдена.' }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
