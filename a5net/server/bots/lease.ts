import { getSetting, setSetting } from '../settings'
import { randomToken } from '../crypto'

const LEASE_KEY = 'tickLease'
const LEASE_MS = 5 * 60 * 1000

interface TickLease {
  owner: string
  expiresAt: number
}

export async function acquireTickLease(ctx: app.Ctx): Promise<string | null> {
  const current = await getSetting<TickLease>(ctx, LEASE_KEY, { owner: '', expiresAt: 0 })
  if (current.expiresAt > Date.now()) return null

  const token = randomToken(16)
  await setSetting(ctx, LEASE_KEY, { owner: token, expiresAt: Date.now() + LEASE_MS })
  const confirm = await getSetting<TickLease>(ctx, LEASE_KEY, { owner: '', expiresAt: 0 })
  return confirm.owner === token ? token : null
}

export async function releaseTickLease(ctx: app.Ctx, token: string): Promise<void> {
  const current = await getSetting<TickLease>(ctx, LEASE_KEY, { owner: '', expiresAt: 0 })
  if (current.owner !== token) return
  await setSetting(ctx, LEASE_KEY, { owner: '', expiresAt: 0 })
}

export async function getTickLease(ctx: app.Ctx): Promise<TickLease> {
  return getSetting<TickLease>(ctx, LEASE_KEY, { owner: '', expiresAt: 0 })
}
