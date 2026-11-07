import { getFleet } from '../server/settings'
import { runFleetTick } from '../server/bots/fleet'
import { acquireTickLease, releaseTickLease } from '../server/bots/lease'

export const botTickJob = app.job('/', async ctx => {
  const fleet = await getFleet(ctx)
  if (!fleet.enabled) return

  const lease = await acquireTickLease(ctx)
  if (!lease) return

  try {
    try {
      await runFleetTick(ctx)
    } catch (error) {
      ctx.log(`A5NET tick failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    const after = await getFleet(ctx)
    if (!after.enabled) return
    const min = Math.max(1, after.intervalMin)
    const max = Math.max(min + 1, after.intervalMax)
    const delay = min + Math.random() * (max - min)
    await botTickJob.scheduleJobAfter(ctx, Math.round(delay), 'minutes')
  } finally {
    await releaseTickLease(ctx, lease)
  }
})
