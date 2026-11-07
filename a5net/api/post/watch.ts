import Posts from '../../tables/posts.table'
import Watches from '../../tables/watches.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { refreshHype } from '../../server/hype'

export const postWatchRoute = app.post('/')
  .body(s => ({ id: s.string(), seconds: s.number().min(0).max(3600) }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const viewer = membership.profile
      const post = await Posts.findById(ctx, req.body.id)
      if (!post) return { ok: false as const, error: 'Пост не найден.' }
      const seconds = Math.round(req.body.seconds)
      const completed = seconds >= (post.durationSec || 1) * 0.9
      await Watches.create(ctx, {
        postId: post.id,
        profileId: viewer.id,
        seconds,
        completed,
      })
      await Posts.update(ctx, {
        id: post.id,
        views: post.views + 1,
        watchSeconds: post.watchSeconds + seconds,
      })
      await refreshHype(ctx, post.id)
      return { ok: true as const }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
