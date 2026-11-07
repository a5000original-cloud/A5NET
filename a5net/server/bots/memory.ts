import Memories from '../../tables/memories.table'
import Profiles from '../../tables/profiles.table'
import { cosine, embedText } from '../vec'

export async function remember(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  kind: 'action' | 'impression' | 'reflection',
  text: string,
  topics: string[],
  importance = 1,
): Promise<void> {
  await Memories.create(ctx, {
    profileId: profile.id,
    kind,
    text: text.slice(0, 500),
    embedding: embedText(text, topics),
    importance,
  })
}

export async function recall(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  query: string,
  topics: string[],
  limit = 5,
): Promise<Array<{ text: string; similarity: number }>> {
  const rows = await Memories.findAll(ctx, {
    where: { profileId: profile.id },
    limit: 150,
    order: [{ createdAt: 'desc' }, { id: 'asc' }],
  })
  if (!rows.length) return []
  const queryVector = embedText(query, topics)
  return rows
    .map(row => ({ text: row.text, similarity: cosine(queryVector, row.embedding), importance: row.importance }))
    .filter(entry => entry.similarity > 0.08)
    .sort((a, b) => b.similarity * b.importance - a.similarity * a.importance)
    .slice(0, limit)
}

export function formatMemory(items: Array<{ text: string; similarity: number }>): string {
  if (!items.length) return ''
  return items.map(item => `- ${item.text}`).join('\n')
}
