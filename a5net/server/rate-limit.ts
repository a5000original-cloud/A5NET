import RateLimits from '../tables/rate-limits.table'

export interface RateResult {
  ok: boolean
  retryAfterSec: number
}

export async function consumeRate(
  ctx: app.Ctx,
  bucket: string,
  identity: string,
  limit: number,
  windowMs: number,
): Promise<RateResult> {
  const key = `${bucket}:${identity}`
  const now = Date.now()
  const existing = await RateLimits.findOneBy(ctx, { key })
  if (!existing) {
    await RateLimits.create(ctx, { key, windowStart: new Date(now), count: 1 })
    return { ok: true, retryAfterSec: 0 }
  }

  const start = existing.windowStart instanceof Date ? existing.windowStart.getTime() : new Date(existing.windowStart).getTime()
  if (now - start >= windowMs) {
    await RateLimits.update(ctx, { id: existing.id, windowStart: new Date(now), count: 1 })
    return { ok: true, retryAfterSec: 0 }
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((start + windowMs - now) / 1000)) }
  }

  await RateLimits.update(ctx, { id: existing.id, count: existing.count + 1 })
  return { ok: true, retryAfterSec: 0 }
}

export function rateLimitMessage(result: RateResult): string {
  return `Слишком часто. Попробуй через ${result.retryAfterSec} сек.`
}
