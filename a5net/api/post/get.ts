import { memberErrorCode, requireMember } from '../../server/access'
import { loadPostPage } from '../../server/post-page'

export const postGetRoute = app.get('/')
  .query(s => ({ id: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const data = await loadPostPage(ctx, req.query.id, membership.profile, membership.role)
      if (!data) return { ok: false as const, error: 'Пост не найден.' }
      return { ok: true as const, data }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
