import { getOriginalUrl, getDurationFromHash } from '@app/storage'
import Profiles from '../../tables/profiles.table'
import Posts from '../../tables/posts.table'
import { memberErrorCode, requireMember } from '../../server/access'

export const postCreateRoute = app.post('/')
  .body(s => ({
    kind: s.enum(['text', 'video', 'music'] as const),
    title: s.string().min(1).max(140),
    body: s.string().min(1).max(600),
    topics: s.array(s.string()).min(1).max(3),
    mediaHash: s.string().optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const author = membership.profile
      const hash = req.body.mediaHash?.trim() || undefined
      const mediaUrl = hash ? getOriginalUrl(ctx, hash) : undefined
      const duration = hash ? getDurationFromHash(hash) ?? 0 : 0
      const post = await Posts.create(ctx, {
        authorId: author.id,
        kind: req.body.kind,
        title: req.body.title.trim(),
        body: req.body.body.trim(),
        topics: req.body.topics,
        mediaUrl,
        coverHue: (author.avatarHue + 18) % 360,
        durationSec: Math.round(duration),
        hypeScore: 4,
        likes: 0,
        dislikes: 0,
        commentsCount: 0,
        views: 0,
        watchSeconds: 0,
        publishedAt: new Date(),
      })
      await Profiles.update(ctx, { id: author.id, postsCount: author.postsCount + 1 })
      return { ok: true as const, id: post.id }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
