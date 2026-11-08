import Notifications from '../tables/notifications.table'
import Profiles from '../tables/profiles.table'
import type { NotificationsData } from '../shared/types'
import { timeAgo } from '../shared/format'
import { fallbackAuthor, getAuthorMap, toAuthorCard } from './social'

export async function createNotification(
  ctx: app.Ctx,
  params: {
    recipientId: string
    actorId: string
    type: 'like' | 'comment' | 'reply' | 'mention' | 'friend_request' | 'friend_accept' | 'subscriber' | 'system'
    text: string
    postId?: string
    commentId?: string
  },
): Promise<void> {
  if (params.recipientId === params.actorId) return
  await Notifications.create(ctx, {
    recipientId: params.recipientId,
    actorId: params.actorId,
    type: params.type,
    text: params.text.slice(0, 300),
    postId: params.postId,
    commentId: params.commentId,
    read: false,
  })
}

export async function getNotificationsData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<NotificationsData> {
  const rows = await Notifications.findAll(ctx, {
    where: { recipientId: viewer.id },
    limit: 80,
    order: [{ createdAt: 'desc' }, { id: 'asc' }],
  })
  const actors = await getAuthorMap(ctx, rows.map(row => row.actorId))
  const now = Date.now()
  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    items: rows.map(row => {
      const created = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
      return {
        id: row.id,
        type: row.type,
        text: row.text,
        ago: timeAgo(created.toISOString(), now),
        read: row.read,
        actor: actors.get(row.actorId) ?? fallbackAuthor(row.actorId),
        postId: row.postId ?? null,
        commentId: row.commentId ?? null,
      }
    }),
    unread: rows.filter(row => !row.read).length,
    now: new Date(now).toISOString(),
  }
}

export async function markNotificationsRead(ctx: app.Ctx, profileId: string): Promise<void> {
  const rows = await Notifications.findAll(ctx, { where: { recipientId: profileId, read: false }, limit: 200 })
  for (const row of rows) await Notifications.update(ctx, { id: row.id, read: true })
}

export async function unreadNotifications(ctx: app.Ctx, profileId: string): Promise<number> {
  return Notifications.countBy(ctx, { recipientId: profileId, read: false })
}
