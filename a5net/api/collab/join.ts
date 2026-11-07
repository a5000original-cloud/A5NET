import { requireSameOrigin } from '../../server/http-guard'
import Collabs from '../../tables/collabs.table'
import { memberErrorCode, requireMember } from '../../server/access'
import { addEdge } from '../../server/social'

export const collabJoinRoute = app.post('/')
  .body(s => ({ id: s.string() }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const viewer = membership.profile
      const collab = await Collabs.findById(ctx, req.body.id)
      if (!collab) return { ok: false as const, error: 'Коллаборация не найдена.' }
      if (collab.participantIds.includes(viewer.id) || collab.initiatorId === viewer.id) {
        return { ok: true as const, joined: true, participants: collab.participantIds.length }
      }
      const participants = [...collab.participantIds, viewer.id]
      await Collabs.update(ctx, {
        id: collab.id,
        participantIds: participants,
        status: participants.length >= 2 ? 'active' : 'open',
      })
      await addEdge(ctx, { fromId: viewer.id, toId: collab.initiatorId, kind: 'collab' })
      return { ok: true as const, joined: true, participants: participants.length }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
