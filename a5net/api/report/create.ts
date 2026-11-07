import Profiles from '../../tables/profiles.table'
import Posts from '../../tables/posts.table'
import Comments from '../../tables/comments.table'
import Reports from '../../tables/reports.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'

export const reportCreateRoute = app.post('/')
  .body(s => ({
    targetType: s.enum(['post', 'comment', 'profile'] as const),
    targetId: s.string(),
    reason: s.enum(['spam', 'abuse', 'offtopic', 'other'] as const),
    note: s.string().max(400).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const reporter = membership.profile
      const rate = await consumeRate(ctx, 'report:create', reporter.id, 10, 24 * 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }

      if (req.body.targetType === 'post') {
        const post = await Posts.findById(ctx, req.body.targetId)
        if (!post || post.visibility !== 'visible') return { ok: false as const, error: 'Пост не найден.' }
      } else if (req.body.targetType === 'comment') {
        const comment = await Comments.findById(ctx, req.body.targetId)
        if (!comment || comment.visibility !== 'visible') return { ok: false as const, error: 'Комментарий не найден.' }
      } else {
        const profile = await Profiles.findById(ctx, req.body.targetId)
        if (!profile) return { ok: false as const, error: 'Профиль не найден.' }
        if (profile.id === reporter.id) return { ok: false as const, error: 'На себя жаловаться не нужно.' }
      }

      await Reports.create(ctx, {
        targetType: req.body.targetType,
        targetId: req.body.targetId,
        reason: req.body.reason,
        note: req.body.note?.trim().slice(0, 400) || '',
        reporterId: reporter.id,
        status: 'open',
      })
      return { ok: true as const }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
