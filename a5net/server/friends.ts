import Friendships from '../tables/friendships.table'
import Profiles from '../tables/profiles.table'
import Edges from '../tables/edges.table'
import type { AuthorCard, FriendsData } from '../shared/types'
import { timeAgo } from '../shared/format'
import { getAuthorMap, toAuthorCard } from './social'
import { createNotification } from './notifications'

export async function getFriendsData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<FriendsData> {
  const rows = await Friendships.findAll(ctx, {
    where: { $or: [{ aId: viewer.id }, { bId: viewer.id }] },
    limit: 300,
    order: [{ createdAt: 'desc' }],
  })
  const now = Date.now()
  const incomingIds: string[] = []
  const outgoingIds: string[] = []
  const friendIds: string[] = []
  for (const row of rows) {
    const other = row.aId === viewer.id ? row.bId : row.aId
    if (row.status === 'accepted') friendIds.push(other)
    else if (row.status === 'pending') {
      if (row.requestedBy === viewer.id) outgoingIds.push(other)
      else incomingIds.push(other)
    }
  }
  const allMap = await getAuthorMap(ctx, [...new Set([...incomingIds, ...outgoingIds, ...friendIds])])
  const ago = (id: string): string => {
    const row = rows.find(item => item.aId === id || item.bId === id)
    if (!row) return ''
    const created = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
    return timeAgo(created.toISOString(), now)
  }
  const mapped = (id: string): AuthorCard | null => allMap.get(id) ?? null
  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    incoming: incomingIds.map(id => mapped(id)).filter((item): item is AuthorCard => Boolean(item)).map(profile => ({ profile, direction: 'incoming', ago: ago(profile.id) })),
    outgoing: outgoingIds.map(id => mapped(id)).filter((item): item is AuthorCard => Boolean(item)).map(profile => ({ profile, direction: 'outgoing', ago: ago(profile.id) })),
    friends: friendIds.map(id => mapped(id)).filter((item): item is AuthorCard => Boolean(item)),
    now: new Date(now).toISOString(),
  }
}

export async function respondFriendRequest(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  otherId: string,
  accept: boolean,
): Promise<boolean> {
  const row = await Friendships.findOneBy(ctx, viewer.id < otherId
    ? { aId: viewer.id, bId: otherId }
    : { aId: otherId, bId: viewer.id })
  if (!row || row.status !== 'pending' || row.requestedBy === viewer.id) return false
  await Friendships.update(ctx, { id: row.id, status: accept ? 'accepted' : 'declined' })
  if (accept) {
    for (const id of [viewer.id, otherId]) {
      const profile = await Profiles.findById(ctx, id)
      if (profile) await Profiles.update(ctx, { id, friendsCount: profile.friendsCount + 1 })
    }
    await Edges.create(ctx, { fromId: viewer.id, toId: otherId, kind: 'friend_request', weight: 1 })
    await createNotification(ctx, {
      recipientId: otherId,
      actorId: viewer.id,
      type: 'friend_accept',
      text: 'принял(а) заявку в друзья',
    })
  }
  return true
}
