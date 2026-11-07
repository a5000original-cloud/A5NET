import Posts from '../../tables/posts.table'
import Comments from '../../tables/comments.table'
import Reactions from '../../tables/reactions.table'
import Profiles from '../../tables/profiles.table'
import { memberErrorCode, requireMember } from '../../server/access'

export const postDeleteRoute = app.post('/')
  .body(s => ({ id: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const canModerate = membership.role === 'owner' || membership.role === 'admin' || Boolean(ctx.user?.is('Staff'))
      if (!canModerate) return { ok: false as const, error: 'Удалять посты могут только администраторы.' }

      const post = await Posts.findById(ctx, req.body.id)
      if (!post) return { ok: false as const, error: 'Пост уже удалён.' }

      const comments = await Comments.findAll(ctx, { where: { postId: post.id }, limit: 200 })
      for (const comment of comments) await Comments.delete(ctx, comment.id)
      const reactions = await Reactions.findAll(ctx, { where: { postId: post.id }, limit: 200 })
      for (const reaction of reactions) await Reactions.delete(ctx, reaction.id)

      const author = await Profiles.findById(ctx, post.authorId)
      if (author) {
        await Profiles.update(ctx, { id: author.id, postsCount: Math.max(0, author.postsCount - 1) })
      }
      await Posts.delete(ctx, post.id)
      return { ok: true as const }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
