import { getOriginalUrl } from '@app/storage'
import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'
import { submitSubscriberTransfer } from '../../server/subscribers'

const PLATFORMS = ['telegram', 'youtube', 'tiktok', 'vk', 'other'] as const

export const subscriberSubmitRoute = app.post('/')
  .body(s => ({
    platform: s.enum(PLATFORMS),
    channelUrl: s.string().min(5).max(300),
    claimedCount: s.number().min(0).max(100_000_000),
    note: s.string().max(300).optional(),
    screenshotHash: s.string().max(300).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      if (!/^https?:\/\/\S+$/i.test(req.body.channelUrl.trim())) {
        return { ok: false as const, error: 'Нужна полная ссылка на канал (http/https).' }
      }
      const rate = await consumeRate(ctx, 'subscriber:submit', membership.profile.id, 3, 24 * 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const screenshotUrl = req.body.screenshotHash ? getOriginalUrl(ctx, req.body.screenshotHash) : undefined
      const transfer = await submitSubscriberTransfer(ctx, membership.profile, {
        platform: req.body.platform,
        channelUrl: req.body.channelUrl,
        claimedCount: req.body.claimedCount,
        screenshotUrl,
        note: req.body.note,
      })
      return { ok: true as const, id: transfer.id }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
