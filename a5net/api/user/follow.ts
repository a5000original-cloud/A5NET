import { requireSameOrigin } from '../../server/http-guard'
import Profiles from '../../tables/profiles.table'
import Edges from '../../tables/edges.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { addEdge } from '../../server/social'

export const userFollowRoute = app.post('/')
  .body(s => ({ profileId: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const viewer = membership.profile
      const target = await Profiles.findById(ctx, req.body.profileId)
      if (!target) return { ok: false as const, error: 'Профиль не найден.' }
      if (target.id === viewer.id) return { ok: false as const, error: 'Нельзя подписаться на себя.' }

      const existing = await Edges.findOneBy(ctx, { fromId: viewer.id, toId: target.id, kind: 'follow' })
      if (existing) {
        await Edges.delete(ctx, existing.id)
        await Profiles.update(ctx, {
          id: target.id,
          followersCount: Math.max(0, target.followersCount - 1),
        })
        await Profiles.update(ctx, {
          id: viewer.id,
          followingCount: Math.max(0, viewer.followingCount - 1),
        })
        return { ok: true as const, following: false, followersCount: Math.max(0, target.followersCount - 1) }
      }

      await addEdge(ctx, { fromId: viewer.id, toId: target.id, kind: 'follow' })
      await Profiles.update(ctx, { id: target.id, followersCount: target.followersCount + 1 })
      await Profiles.update(ctx, { id: viewer.id, followingCount: viewer.followingCount + 1 })
      return { ok: true as const, following: true, followersCount: target.followersCount + 1 }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
