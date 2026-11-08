import EmojiReactions from '../tables/emoji-reactions.table'

export interface EmojiSummary {
  counts: Map<string, Record<string, number>>
  viewer: Map<string, string>
}

export async function getEmojiSummary(
  ctx: app.Ctx,
  postIds: string[],
  viewerId: string,
): Promise<EmojiSummary> {
  const counts = new Map<string, Record<string, number>>()
  const viewer = new Map<string, string>()
  if (!postIds.length) return { counts, viewer }
  const rows = await EmojiReactions.findAll(ctx, { where: { postId: postIds }, limit: 800 })
  for (const row of rows) {
    const entry = counts.get(row.postId) ?? {}
    entry[row.emoji] = (entry[row.emoji] ?? 0) + 1
    counts.set(row.postId, entry)
    if (row.profileId === viewerId) viewer.set(row.postId, row.emoji)
  }
  return { counts, viewer }
}

export async function toggleEmoji(
  ctx: app.Ctx,
  postId: string,
  profileId: string,
  emoji: string,
): Promise<{ viewerEmoji: string | null; counts: Record<string, number> }> {
  const existing = await EmojiReactions.findOneBy(ctx, { postId, profileId })
  if (existing?.emoji === emoji) {
    await EmojiReactions.delete(ctx, existing.id)
  } else if (existing) {
    await EmojiReactions.update(ctx, { id: existing.id, emoji: emoji as 'fire' })
  } else {
    await EmojiReactions.create(ctx, { postId, profileId, emoji: emoji as 'fire' })
  }
  const summary = await getEmojiSummary(ctx, [postId], profileId)
  return {
    viewerEmoji: summary.viewer.get(postId) ?? null,
    counts: summary.counts.get(postId) ?? {},
  }
}
