import SubscriberTransfers from '../tables/subscriber-transfers.table'
import Profiles from '../tables/profiles.table'
import Edges from '../tables/edges.table'
import type { SubscriberTransferRow } from '../shared/types'
import { timeAgo } from '../shared/format'

const PLATFORM_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  vk: 'VK',
  other: 'другое',
}

export async function listSubscriberTransfers(
  ctx: app.Ctx,
  profileId?: string,
): Promise<SubscriberTransferRow[]> {
  const rows = profileId
    ? await SubscriberTransfers.findAll(ctx, { where: { profileId }, limit: 40, order: [{ createdAt: 'desc' }] })
    : await SubscriberTransfers.findAll(ctx, { limit: 80, order: [{ createdAt: 'desc' }] })
  const now = Date.now()
  const profiles = await Profiles.findAll(ctx, { limit: 500 })
  const nameById = new Map(profiles.map(profile => [profile.id, profile.name]))
  return rows.map(row => {
    const created = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)
    return {
      id: row.id,
      profileId: row.profileId,
      profileName: nameById.get(row.profileId) ?? 'Неизвестный',
      platform: PLATFORM_LABELS[row.platform] ?? row.platform,
      channelUrl: row.channelUrl,
      screenshotUrl: row.screenshotUrl ?? null,
      claimedCount: row.claimedCount,
      approvedCount: row.approvedCount,
      status: row.status,
      note: row.note,
      ago: timeAgo(created.toISOString(), now),
    }
  })
}

export async function submitSubscriberTransfer(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  input: {
    platform: 'telegram' | 'youtube' | 'tiktok' | 'vk' | 'other'
    channelUrl: string
    screenshotUrl?: string
    claimedCount: number
    note?: string
  },
): Promise<typeof SubscriberTransfers.T> {
  return SubscriberTransfers.create(ctx, {
    profileId: profile.id,
    platform: input.platform,
    channelUrl: input.channelUrl.trim().slice(0, 300),
    screenshotUrl: input.screenshotUrl,
    claimedCount: Math.max(0, Math.min(100_000_000, Math.round(input.claimedCount))),
    approvedCount: 0,
    status: 'pending',
    note: input.note?.trim().slice(0, 300) || '',
    submittedBy: profile.id,
  })
}

export async function applySubscriberCount(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  count: number,
  source: string,
): Promise<void> {
  const oldExternal = profile.externalSubscribers ?? 0
  const delta = count - oldExternal
  await Profiles.update(ctx, {
    id: profile.id,
    externalSubscribers: count,
    subscriberSource: source,
    subscriberUpdatedAt: new Date(),
    followersCount: Math.max(0, profile.followersCount + delta),
  })
  await ensureBotFollowers(ctx, profile.id, count)
}

async function ensureBotFollowers(ctx: app.Ctx, profileId: string, externalCount: number): Promise<void> {
  const bots = await Profiles.findAll(ctx, { where: { kind: 'bot', enabled: true }, limit: 120 })
  if (!bots.length) return
  const follows = await Edges.findAll(ctx, { where: { toId: profileId, kind: 'follow' }, limit: 500 })
  const following = new Set(follows.map(edge => edge.fromId))
  const target = Math.min(bots.length, Math.max(0, Math.round(externalCount / 500)))
  const candidates = bots.filter(bot => bot.id !== profileId && !following.has(bot.id))
  for (let index = 0; index < target - follows.length && candidates.length; index += 1) {
    const bot = candidates.shift()
    if (!bot) break
    await Edges.create(ctx, { fromId: bot.id, toId: profileId, kind: 'follow', weight: 1 })
    await Profiles.update(ctx, { id: bot.id, followingCount: bot.followingCount + 1 })
  }
  if (follows.length > target) {
    const extra = follows.slice(0, follows.length - target)
    for (const edge of extra) {
      if (!bots.some(bot => bot.id === edge.fromId)) continue
      await Edges.delete(ctx, edge.id)
      const bot = bots.find(item => item.id === edge.fromId)
      if (bot) await Profiles.update(ctx, { id: bot.id, followingCount: Math.max(0, bot.followingCount - 1) })
    }
  }
}

export async function reviewSubscriberTransfer(
  ctx: app.Ctx,
  transferId: string,
  action: 'approve' | 'reject',
  approvedCount: number | undefined,
  reviewerId: string,
): Promise<{ ok: boolean; error?: string; count?: number }> {
  const transfer = await SubscriberTransfers.findById(ctx, transferId)
  if (!transfer) return { ok: false, error: 'Заявка не найдена.' }
  if (transfer.status !== 'pending') return { ok: false, error: 'Заявка уже обработана.' }
  if (action === 'reject') {
    await SubscriberTransfers.update(ctx, {
      id: transfer.id,
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      note: transfer.note || 'Отклонено вручную',
    })
    return { ok: true }
  }
  const profile = await Profiles.findById(ctx, transfer.profileId)
  if (!profile) return { ok: false, error: 'Профиль не найден.' }
  const count = Math.max(0, Math.min(100_000_000, Math.round(approvedCount ?? transfer.claimedCount)))
  await applySubscriberCount(ctx, profile, count, transfer.platform)
  await SubscriberTransfers.update(ctx, {
    id: transfer.id,
    status: 'approved',
    approvedCount: count,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
  })
  return { ok: true, count }
}
