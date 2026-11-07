import Messages from '../tables/messages.table'
import Profiles from '../tables/profiles.table'
import type { ConversationSummary, InboxData, MessageItem } from '../shared/types'
import { timeAgo } from '../shared/format'
import { getAuthorMap, toAuthorCard } from './social'

export async function sendMessage(
  ctx: app.Ctx,
  from: typeof Profiles.T,
  toId: string,
  text: string,
): Promise<typeof Messages.T> {
  return Messages.create(ctx, {
    fromId: from.id,
    toId,
    text: text.trim().slice(0, 1000),
    read: false,
  })
}

export async function unreadCount(ctx: app.Ctx, profileId: string): Promise<number> {
  return Messages.countBy(ctx, { toId: profileId, read: false })
}

export async function listConversations(
  ctx: app.Ctx,
  profileId: string,
): Promise<ConversationSummary[]> {
  const rows = await Messages.findAll(ctx, {
    where: { $or: [{ fromId: profileId }, { toId: profileId }] },
    limit: 400,
    order: [{ createdAt: 'desc' }, { id: 'asc' }],
  })
  const grouped = new Map<string, { row: typeof Messages.T; unread: number; lastAt: number }>()
  for (const row of rows) {
    const peer = row.fromId === profileId ? row.toId : row.fromId
    const current = grouped.get(peer)
    const created = row.createdAt instanceof Date ? row.createdAt.getTime() : new Date(row.createdAt).getTime()
    if (!current) grouped.set(peer, { row, unread: row.toId === profileId && !row.read ? 1 : 0, lastAt: created })
    else if (row.toId === profileId && !row.read) current.unread += 1
  }
  const authors = await getAuthorMap(ctx, [...grouped.keys()])
  const now = Date.now()
  return [...grouped.entries()]
    .map(([peer, value]) => {
      const author = authors.get(peer)
      if (!author) return null
      const created = value.row.createdAt instanceof Date ? value.row.createdAt : new Date(value.row.createdAt)
      return {
        peer: author,
        lastText: value.row.text.slice(0, 120),
        ago: timeAgo(created.toISOString(), now),
        unread: value.unread,
      }
    })
    .filter((item): item is ConversationSummary => Boolean(item))
    .sort((a, b) => (grouped.get(b.peer.id)?.lastAt ?? 0) - (grouped.get(a.peer.id)?.lastAt ?? 0))
}

export async function getInboxData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
  peerId?: string,
): Promise<InboxData> {
  let conversations = await listConversations(ctx, viewer.id)
  const activePeerId = peerId || conversations[0]?.peer.id
  let messages: MessageItem[] = []
  let activePeer = conversations.find(item => item.peer.id === activePeerId)?.peer ?? null
  if (activePeerId) {
    if (!activePeer) {
      const profiles = await getAuthorMap(ctx, [activePeerId])
      activePeer = profiles.get(activePeerId) ?? null
    }
    const rows = await Messages.findAll(ctx, {
      where: { $or: [{ fromId: viewer.id, toId: activePeerId }, { fromId: activePeerId, toId: viewer.id }] },
      limit: 300,
      order: [{ createdAt: 'asc' }, { id: 'asc' }],
    })
    const authors = await getAuthorMap(ctx, [viewer.id, activePeerId])
    const now = Date.now()
    for (const row of rows) {
      if (row.toId === viewer.id && !row.read) await Messages.update(ctx, { id: row.id, read: true })
    }
    conversations = await listConversations(ctx, viewer.id)
    messages = rows.map(row => {
      const created = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
      return {
        id: row.id,
        text: row.text,
        isMine: row.fromId === viewer.id,
        ago: timeAgo(created.toISOString(), now),
        author: authors.get(row.fromId) ?? toAuthorCard(viewer),
      }
    })
  }
  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    conversations,
    activePeer,
    messages,
    now: new Date().toISOString(),
  }
}
