import { getOriginalUrl } from '@app/storage'
import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'
import { submitSticker } from '../../server/stickers'

export const stickerUploadRoute = app.post('/')
  .body(s => ({ imageHash: s.string().max(300), title: s.string().max(60).optional() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const rate = await consumeRate(ctx, 'sticker:upload', membership.profile.id, 5, 24 * 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const sticker = await submitSticker(
        ctx,
        membership.profile,
        getOriginalUrl(ctx, req.body.imageHash),
        req.body.title ?? 'Наклейка',
      )
      return { ok: true as const, id: sticker.id }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
