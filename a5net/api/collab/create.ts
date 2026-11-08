import { requireSameOrigin } from '../../server/http-guard'
import Collabs from '../../tables/collabs.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'

export const collabCreateRoute = app.post('/')
  .body(s => ({
    title: s.string().min(3).max(90),
    brief: s.string().min(10).max(600),
    goal: s.string().min(3).max(160),
    goalFollowers: s.number().int().min(100).max(10_000_000),
    days: s.number().int().min(1).max(90),
    tasks: s.string().max(500).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const rate = await consumeRate(ctx, 'collab:create', membership.profile.id, 3, 24 * 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const tasks = (req.body.tasks ?? '')
        .split(/[,\n]/)
        .map(task => task.trim())
        .filter(Boolean)
        .slice(0, 6)
      const collab = await Collabs.create(ctx, {
        title: req.body.title.trim(),
        brief: req.body.brief.trim(),
        goal: req.body.goal.trim(),
        goalFollowers: req.body.goalFollowers,
        deadline: new Date(Date.now() + req.body.days * 86400000),
        tasks,
        initiatorId: membership.profile.id,
        participantIds: [],
        status: 'open',
      })
      return { ok: true as const, id: collab.id }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
