function headerValue(ctx: app.Ctx, name: string): string {
  const value = (ctx.req.headers ?? {})[name]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}

export function requireSameOrigin(ctx: app.Ctx): string | null {
  const source = headerValue(ctx, 'origin') || headerValue(ctx, 'referer')
  if (!source) return null
  try {
    const origin = new URL(source)
    const host = headerValue(ctx, 'host') || ctx.account.host
    if (!host) return null
    return origin.host === host ? null : 'Запрос отклонён: неверный источник.'
  } catch {
    return 'Запрос отклонён: неверный источник.'
  }
}
