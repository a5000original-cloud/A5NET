import Invites from '../tables/invites.table'
import Profiles from '../tables/profiles.table'
import type { InvitesData } from '../shared/types'
import { timeAgo } from '../shared/format'
import { toAuthorCard } from './social'

export async function getInvitesData(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<InvitesData> {
  const rows = await Invites.findAll(ctx, { limit: 50, order: [{ createdAt: 'desc' }, { id: 'asc' }] })
  const canCreate = role === 'owner' || role === 'admin' || Boolean(ctx.user?.is('Staff'))
  const nowMs = Date.now()
  return {
    viewer: toAuthorCard(profile),
    viewerRole: role,
    canCreate,
    invites: rows.map(row => {
      const created = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
      return {
        id: row.id,
        code: row.code,
        note: row.note,
        maxUses: row.maxUses,
        uses: row.uses,
        active: row.active,
        createdAt: created.toISOString(),
        ago: timeAgo(created.toISOString(), nowMs),
        link: '',
      }
    }),
  }
}
