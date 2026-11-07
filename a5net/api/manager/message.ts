import { memberErrorCode, requireMember } from '../../server/access'
import { requireSameOrigin } from '../../server/http-guard'
import { answerManagerMessage } from '../../server/manager-bot'
import { appendManagerMessage, loadManagerHistory } from '../../server/manager-data'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'

export const managerMessageRoute = app.post('/')
  .body(s => ({ text: s.string().max(2000) }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }

      const membership = await requireMember(ctx)
      if (!ctx.user) return { ok: false as const, error: 'Нужен вход в аккаунт.' }

      const userId = ctx.user.id
      const text = req.body.text.trim()
      if (!text) return { ok: false as const, error: 'Напишите вопрос.' }

      const rate = await consumeRate(ctx, 'manager:message', userId, 30, 5 * 60 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }

      const history = await loadManagerHistory(ctx, userId, 24)
      const reply = answerManagerMessage({ text, history })

      await appendManagerMessage(ctx, {
        userId,
        profileId: membership.profile.id,
        role: 'user',
        text,
        intent: reply.intent,
      })
      const saved = await appendManagerMessage(ctx, {
        userId,
        profileId: membership.profile.id,
        role: 'bot',
        text: reply.text,
        intent: reply.intent,
      })

      return {
        ok: true as const,
        reply: { ...reply, createdAt: saved.createdAt },
      }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
