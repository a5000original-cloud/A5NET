import { requireSameOrigin } from '../../server/http-guard'
import { getOriginalUrl, getDurationFromHash } from '@app/storage'
import Profiles from '../../tables/profiles.table'
import Posts from '../../tables/posts.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'

function derivedCover(url: string | undefined): string | undefined {
  if (!url || !url.includes('/get/')) return undefined
  return `${url.replace('/get/', '/thumbnail/')}/s/1280x`
}

export const postCreateRoute = app.post('/')
  .body(s => ({
    kind: s.enum(['text', 'video', 'music', 'photo'] as const),
    title: s.string().min(1).max(140),
    body: s.string().min(1).max(600),
    topics: s.array(s.string()).min(1).max(3),
    mediaHash: s.string().optional(),
    coverHash: s.string().optional(),
    durationSec: s.number().min(0).max(24 * 3600).optional(),
    sizeBytes: s.number().min(0).max(50 * 1024 * 1024 * 1024).optional(),
    mimeType: s.string().max(120).optional(),
    album: s.string().max(80).optional(),
    orientation: s.enum(['horizontal', 'vertical'] as const).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const author = membership.profile
      const rate = await consumeRate(ctx, 'post:create', author.id, 10, 3600 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }

      const hash = req.body.mediaHash?.trim() || undefined
      const coverHash = req.body.coverHash?.trim() || undefined
      const mediaUrl = hash ? getOriginalUrl(ctx, hash) : undefined
      const duration = req.body.durationSec && req.body.durationSec > 0
        ? req.body.durationSec
        : hash ? getDurationFromHash(hash) ?? 0 : 0
      const coverUrl = coverHash ? getOriginalUrl(ctx, coverHash) : req.body.kind === 'photo' ? mediaUrl : derivedCover(mediaUrl)

      const post = await Posts.create(ctx, {
        authorId: author.id,
        kind: req.body.kind,
        title: req.body.title.trim(),
        body: req.body.body.trim(),
        topics: req.body.topics,
        mediaUrl,
        mediaHash: hash,
        coverUrl,
        mimeType: req.body.mimeType?.trim() || undefined,
        sizeBytes: req.body.sizeBytes ? Math.round(req.body.sizeBytes) : 0,
        mediaStatus: 'ready',
        source: hash ? 'upload' : 'link',
        album: req.body.album?.trim() || undefined,
        orientation: req.body.orientation ?? 'horizontal',
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
      return { ok: true as const, id: post.id, kind: post.kind }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
