import { requireSameOrigin } from '../../server/http-guard'
import Profiles from '../../tables/profiles.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'
import { sendMessage } from '../../server/messages'

export const messageSendRoute = app.post('/')
  .body(s => ({ peerId: s.string(), text: s.string().min(1).max(1000) }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      if (req.body.peerId === membership.profile.id) return { ok: false as const, error: 'Это твой профиль.' }
      const peer = await Profiles.findById(ctx, req.body.peerId)
      if (!peer) return { ok: false as const, error: 'Профиль не найден.' }
      const rate = await consumeRate(ctx, 'message:send', membership.profile.id, 60, 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const message = await sendMessage(ctx, membership.profile, peer.id, req.body.text)
      return { ok: true as const, id: message.id }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
