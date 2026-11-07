import Profiles from '../tables/profiles.table'
import Edges from '../tables/edges.table'
import Friendships from '../tables/friendships.table'
import type { AuthorCard } from '../shared/types'
import { initials } from '../shared/format'

export interface ViewerSocial {
  friendIds: Set<string>
  followingIds: Set<string>
  pendingOut: Set<string>
  pendingIn: Set<string>
}

export function toAuthorCard(profile: typeof Profiles.T): AuthorCard {
  return {
    id: profile.id,
    handle: profile.handle,
    name: profile.name,
    city: profile.city,
    kind: profile.kind,
    avatarHue: profile.avatarHue,
    avatarAccent: profile.avatarAccent,
    initials: initials(profile.name),
    voiceTone: profile.voiceTone,
  }
}

export async function getAuthorMap(ctx: app.Ctx, ids: string[]): Promise<Map<string, AuthorCard>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map()
  const rows = await Profiles.findAll(ctx, { where: { id: unique }, limit: Math.min(unique.length, 500) })
  return new Map(rows.map(row => [row.id, toAuthorCard(row)]))
}

export function fallbackAuthor(id: string): AuthorCard {
  return {
    id,
    handle: 'a5net',
    name: 'Участник A5NET',
    city: '',
    kind: 'human',
    avatarHue: 120,
    avatarAccent: 160,
    initials: 'A5',
    voiceTone: 'deadpan',
  }
}

export async function getViewerSocial(ctx: app.Ctx, profileId: string): Promise<ViewerSocial> {
  const [friendships, follows, outgoing, incoming] = await Promise.all([
    Friendships.findAll(ctx, {
      where: { $or: [{ aId: profileId }, { bId: profileId }], status: 'accepted' },
      limit: 500,
    }),
    Edges.findAll(ctx, { where: { fromId: profileId, kind: 'follow' }, limit: 500 }),
    Friendships.findAll(ctx, { where: { requestedBy: profileId, status: 'pending' }, limit: 500 }),
    Friendships.findAll(ctx, { where: { status: 'pending' }, limit: 500 }),
  ])

  const friendIds = new Set<string>()
  for (const row of friendships) {
    if (row.aId === profileId) friendIds.add(row.bId)
    if (row.bId === profileId) friendIds.add(row.aId)
  }
  const followingIds = new Set(follows.map(row => row.toId))
  const pendingOut = new Set(outgoing.map(row => (row.aId === profileId ? row.bId : row.aId)))
  const pendingIn = new Set(
    incoming
      .filter(row => row.aId === profileId || row.bId === profileId)
      .map(row => (row.aId === profileId ? row.bId : row.aId))
      .filter(id => !pendingOut.has(id)),
  )
  return { friendIds, followingIds, pendingOut, pendingIn }
}

export async function addEdge(
  ctx: app.Ctx,
  params: { fromId: string; toId: string; kind: 'follow' | 'like' | 'dislike' | 'comment' | 'friend_request' | 'collab' | 'topic'; postId?: string; weight?: number },
): Promise<void> {
  const existing = await Edges.findOneBy(ctx, {
    fromId: params.fromId,
    toId: params.toId,
    kind: params.kind,
  })
  const weight = params.weight ?? 1
  if (existing) {
    await Edges.update(ctx, { id: existing.id, weight: existing.weight + weight })
    return
  }
  await Edges.create(ctx, {
    fromId: params.fromId,
    toId: params.toId,
    kind: params.kind,
    postId: params.postId,
    weight,
  })
}

export function pairKey(a: string, b: string): { aId: string; bId: string } {
  return a < b ? { aId: a, bId: b } : { aId: b, bId: a }
}

export async function findFriendship(ctx: app.Ctx, a: string, b: string): Promise<typeof Friendships.T | null> {
  const pair = pairKey(a, b)
  return Friendships.findOneBy(ctx, { aId: pair.aId, bId: pair.bId })
}

export async function requestFriendship(ctx: app.Ctx, fromId: string, toId: string): Promise<'created' | 'exists' | 'self'> {
  if (fromId === toId) return 'self'
  const existing = await findFriendship(ctx, fromId, toId)
  if (existing) return 'exists'
  const pair = pairKey(fromId, toId)
  await Friendships.create(ctx, {
    aId: pair.aId,
    bId: pair.bId,
    status: 'pending',
    requestedBy: fromId,
  })
  await addEdge(ctx, { fromId, toId, kind: 'friend_request' })
  return 'created'
}

export async function acceptFriendship(ctx: app.Ctx, profileId: string, otherId: string): Promise<boolean> {
  const existing = await findFriendship(ctx, profileId, otherId)
  if (!existing || existing.status === 'accepted') return false
  if (existing.requestedBy === profileId) return false
  await Friendships.update(ctx, { id: existing.id, status: 'accepted' })
  await bumpCounters(ctx, profileId, otherId)
  return true
}

async function bumpCounters(ctx: app.Ctx, aId: string, bId: string): Promise<void> {
  for (const id of [aId, bId]) {
    const profile = await Profiles.findById(ctx, id)
    if (profile) {
      await Profiles.update(ctx, { id, friendsCount: profile.friendsCount + 1 })
    }
  }
}
