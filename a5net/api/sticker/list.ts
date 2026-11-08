import { memberErrorCode, requireMember } from '../../server/access'
import { listStickers } from '../../server/stickers'

export const stickerListRoute = app.get('/')
  .handle(async ctx => {
    try {
      const membership = await requireMember(ctx)
      const items = await listStickers(ctx, membership.profile.id)
      return { ok: true as const, items }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error), items: [] }
    }
  })
