import ManagerMessages from '../tables/manager-messages.table'
import type { ManagerMessageView } from '../shared/types'

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString()
  }
  return ''
}

export async function loadManagerHistory(
  ctx: app.Ctx,
  userId: string,
  limit = 40,
): Promise<ManagerMessageView[]> {
  const rows = await ManagerMessages.findAll(ctx, {
    where: { userId },
    limit,
    order: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
  return rows.slice().reverse().map(row => ({
    id: row.id,
    role: row.role,
    text: row.text,
    intent: row.intent ?? null,
    createdAt: toIso(row.createdAt),
  }))
}

export async function appendManagerMessage(
  ctx: app.Ctx,
  params: {
    userId: string
    profileId: string
    role: 'user' | 'bot'
    text: string
    intent?: string | null
  },
): Promise<{ id: string; createdAt: string }> {
  const row = await ManagerMessages.create(ctx, {
    userId: params.userId,
    profileId: params.profileId,
    role: params.role,
    text: params.text,
    intent: params.intent ?? null,
  })
  return { id: row.id, createdAt: toIso(row.createdAt) || new Date().toISOString() }
}
