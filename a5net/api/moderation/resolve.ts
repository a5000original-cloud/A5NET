import Posts from '../../tables/posts.table'
import Comments from '../../tables/comments.table'
import Profiles from '../../tables/profiles.table'
import Reports from '../../tables/reports.table'
import ModerationActions from '../../tables/moderation-actions.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { requireSameOrigin } from '../../server/http-guard'

export const moderationResolveRoute = app.post('/')
  .body(s => ({
    id: s.string(),
    action: s.enum(['hide', 'restore', 'dismiss'] as const),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }

      const membership = await requireMember(ctx)
      const canModerate = membership.role === 'owner' || membership.role === 'admin' || Boolean(ctx.user?.is('Staff'))
      if (!canModerate) return { ok: false as const, error: 'Модерация доступна только администраторам.' }

      const report = await Reports.findById(ctx, req.body.id)
      if (!report) return { ok: false as const, error: 'Жалоба не найдена.' }

      if (req.body.action === 'dismiss') {
        await Reports.update(ctx, {
          id: report.id,
          status: 'dismissed',
          handledBy: membership.profile.id,
          resolution: 'Отклонено',
        })
        return { ok: true as const, message: 'Жалоба отклонена.' }
      }

      const hidden = req.body.action === 'hide'
      if (report.targetType === 'post') {
        await Posts.update(ctx, {
          id: report.targetId,
          visibility: hidden ? 'hidden' : 'visible',
        })
      } else if (report.targetType === 'comment') {
        const comment = await Comments.findById(ctx, report.targetId)
        if (comment) {
          await Comments.update(ctx, { id: comment.id, visibility: hidden ? 'hidden' : 'visible' })
          const post = await Posts.findById(ctx, comment.postId)
          if (post) {
            await Posts.update(ctx, {
              id: post.id,
              commentsCount: Math.max(0, post.commentsCount + (hidden ? -1 : 1)),
            })
          }
        }
      } else {
        if (report.targetId === membership.profile.id) {
          return { ok: false as const, error: 'Нельзя скрыть собственный профиль.' }
        }
        await Profiles.update(ctx, { id: report.targetId, enabled: !hidden })
      }

      await ModerationActions.create(ctx, {
        targetType: report.targetType,
        targetId: report.targetId,
        action: hidden ? 'hide' : 'restore',
        moderatorId: membership.profile.id,
        reason: report.reason,
      })
      await Reports.update(ctx, {
        id: report.id,
        status: 'resolved',
        handledBy: membership.profile.id,
        resolution: hidden ? 'Скрыто' : 'Восстановлено',
      })
      return { ok: true as const, message: hidden ? 'Объект скрыт.' : 'Объект восстановлен.' }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
