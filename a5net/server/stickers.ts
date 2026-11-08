import Stickers from '../tables/stickers.table'
import Profiles from '../tables/profiles.table'
import type { StickerRow } from '../shared/types'
import { timeAgo } from '../shared/format'

export async function listStickers(
  ctx: app.Ctx,
  authorId?: string,
  status?: 'pending' | 'approved' | 'rejected',
): Promise<StickerRow[]> {
  const where: Record<string, unknown> = {}
  if (authorId) where.authorId = authorId
  if (status) where.status = status
  const rows = await Stickers.findAll(ctx, { where, limit: 100, order: [{ createdAt: 'desc' }] })
  const authors = await Profiles.findAll(ctx, { limit: 500 })
  const nameById = new Map(authors.map(profile => [profile.id, profile.name]))
  const now = Date.now()
  return rows.map(row => {
    const created = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
    return {
      id: row.id,
      title: row.title,
      imageUrl: row.imageUrl,
      status: row.status,
      authorName: nameById.get(row.authorId) ?? 'Неизвестный',
      ago: timeAgo(created.toISOString(), now),
    }
  })
}

export async function submitSticker(
  ctx: app.Ctx,
  author: typeof Profiles.T,
  imageUrl: string,
  title: string,
): Promise<typeof Stickers.T> {
  return Stickers.create(ctx, {
    authorId: author.id,
    title: title.trim().slice(0, 60) || 'Наклейка',
    imageUrl,
    status: 'pending',
  })
}

export async function reviewSticker(
  ctx: app.Ctx,
  stickerId: string,
  action: 'approve' | 'reject',
  reviewerId: string,
): Promise<boolean> {
  const row = await Stickers.findById(ctx, stickerId)
  if (!row || row.status !== 'pending') return false
  await Stickers.update(ctx, {
    id: row.id,
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
  })
  return true
}
