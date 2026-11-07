import { ensureOwnerProfile, findMembership, type Membership } from './access'

export async function resolveMembership(ctx: app.Ctx): Promise<Membership | null> {
  return (await ensureOwnerProfile(ctx)) ?? (await findMembership(ctx))
}

export function queryString(ctx: app.Ctx, key: string): string {
  const query = ctx.req.query as Record<string, unknown> | undefined
  const value = query?.[key]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}
