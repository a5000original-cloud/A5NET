import Posts from '../../tables/posts.table'
import ModerationActions from '../../tables/moderation-actions.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { requireSameOrigin } from '../../server/http-guard'

export const postDeleteRoute = app.post('/')
  .body(s => ({ id: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }

      const membership = await requireMember(ctx)
      const canModerate = membership.role === 'owner' || membership.role === 'admin' || Boolean(ctx.user?.is('Staff'))
      if (!canModerate) return { ok: false as const, error: 'Скрывать посты могут только администраторы.' }

      const post = await Posts.findById(ctx, req.body.id)
      if (!post) return { ok: false as const, error: 'Пост не найден.' }
      if (post.visibility === 'hidden') return { ok: true as const }

      await Posts.update(ctx, { id: post.id, visibility: 'hidden' })
      await ModerationActions.create(ctx, {
        targetType: 'post',
        targetId: post.id,
        action: 'hide',
        moderatorId: membership.profile.id,
        reason: 'Скрыто вручную',
      })
      return { ok: true as const }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
