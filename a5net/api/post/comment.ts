import Posts from '../../tables/posts.table'
import Comments from '../../tables/comments.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { addEdge, toAuthorCard } from '../../server/social'
import { refreshHype } from '../../server/hype'
import { timeAgo } from '../../shared/format'

export const postCommentRoute = app.post('/')
  .body(s => ({ id: s.string(), text: s.string().min(1).max(600) }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const viewer = membership.profile
      const post = await Posts.findById(ctx, req.body.id)
      if (!post) return { ok: false as const, error: 'Пост не найден.' }
      const text = req.body.text.trim()
      if (text.length < 2) return { ok: false as const, error: 'Слишком короткий комментарий.' }

      const comment = await Comments.create(ctx, {
        postId: post.id,
        authorId: viewer.id,
        text: text.slice(0, 600),
        likes: 0,
        publishedAt: new Date(),
      })
      await Posts.update(ctx, { id: post.id, commentsCount: post.commentsCount + 1 })
      await addEdge(ctx, { fromId: viewer.id, toId: post.authorId, kind: 'comment', postId: post.id })
      await refreshHype(ctx, post.id)

      return {
        ok: true as const,
        commentsCount: post.commentsCount + 1,
        comment: {
          id: comment.id,
          text: comment.text,
          likes: 0,
          createdAt: new Date().toISOString(),
          ago: timeAgo(new Date().toISOString(), Date.now()),
          author: toAuthorCard(viewer),
          isMine: true,
        },
      }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
