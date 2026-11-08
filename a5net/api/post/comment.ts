import { requireSameOrigin } from '../../server/http-guard'
import Posts from '../../tables/posts.table'
import Comments from '../../tables/comments.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'
import { addEdge, toAuthorCard } from '../../server/social'
import { refreshHype } from '../../server/hype'
import { timeAgo } from '../../shared/format'
import Profiles from '../../tables/profiles.table'
import { createNotification } from '../../server/notifications'

export const postCommentRoute = app.post('/')
  .body(s => ({ id: s.string(), text: s.string().min(1).max(600), parentId: s.string().optional() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const viewer = membership.profile
      const rate = await consumeRate(ctx, 'post:comment', viewer.id, 30, 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }
      const post = await Posts.findById(ctx, req.body.id)
      if (!post) return { ok: false as const, error: 'Пост не найден.' }
      const text = req.body.text.trim()
      if (text.length < 2) return { ok: false as const, error: 'Слишком короткий комментарий.' }

      let parent: typeof Comments.T | null = null
      if (req.body.parentId) {
        parent = await Comments.findById(ctx, req.body.parentId)
        if (!parent || parent.postId !== post.id) return { ok: false as const, error: 'Комментарий, на который ты отвечаешь, не найден.' }
      }
      const parentAuthor = parent ? await Profiles.findById(ctx, parent.authorId) : null

      const comment = await Comments.create(ctx, {
        postId: post.id,
        authorId: viewer.id,
        text: text.slice(0, 600),
        likes: 0,
        parentId: parent?.id,
        publishedAt: new Date(),
      })
      await Posts.update(ctx, { id: post.id, commentsCount: post.commentsCount + 1 })
      await addEdge(ctx, { fromId: viewer.id, toId: post.authorId, kind: 'comment', postId: post.id })
      await refreshHype(ctx, post.id)

      await createNotification(ctx, {
        recipientId: post.authorId,
        actorId: viewer.id,
        type: 'comment',
        postId: post.id,
        commentId: comment.id,
        text: `оставил(а) комментарий под «${post.title}»`,
      })
      if (parent && parent.authorId !== post.authorId) {
        await createNotification(ctx, {
          recipientId: parent.authorId,
          actorId: viewer.id,
          type: 'reply',
          postId: post.id,
          commentId: comment.id,
          text: `ответил(а) на твой комментарий${parentAuthor ? ` у ${parentAuthor.name}` : ''}`,
        })
      }

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
          parentId: parent?.id ?? null,
          replyToName: parentAuthor?.name ?? null,
        },
      }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
