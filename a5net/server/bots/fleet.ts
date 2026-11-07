import Profiles from '../../tables/profiles.table'
import type { FleetSettings } from '../../shared/types'
import { getFleet, saveFleet } from '../settings'
import { botTickJob } from '../../jobs/bot-tick'
import { runBotCycle, type CycleResult } from './cycle'

export async function pickDueBots(ctx: app.Ctx, max: number): Promise<Array<typeof Profiles.T>> {
  const bots = await Profiles.findAll(ctx, {
    where: { kind: 'bot', enabled: true },
    limit: 120,
    order: [{ createdAt: 'asc' }],
  })
  const now = Date.now()
  return bots
    .filter(bot => !bot.nextActionAt || bot.nextActionAt.getTime() <= now)
    .sort((a, b) => {
      const at = a.nextActionAt ? a.nextActionAt.getTime() : 0
      const bt = b.nextActionAt ? b.nextActionAt.getTime() : 0
      return at - bt
    })
    .slice(0, max)
}

export async function runFleetTick(ctx: app.Ctx, force = false): Promise<CycleResult[]> {
  const fleet = await getFleet(ctx)
  if (!fleet.enabled && !force) return []
  const due = await pickDueBots(ctx, fleet.maxBotsPerTick)
  const results: CycleResult[] = []
  for (const bot of due) {
    try {
      const result = await runBotCycle(ctx, bot, fleet)
      if (result) results.push(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown'
      ctx.log(`A5NET cycle failed for ${bot.handle}: ${message}`)
    }
  }
  return results
}

export async function startFleet(ctx: app.Ctx, settings?: Partial<FleetSettings>): Promise<FleetSettings> {
  const fleet = await saveFleet(ctx, { ...settings, enabled: true })
  await botTickJob.scheduleJobAsap(ctx)
  return fleet
}

export async function stopFleet(ctx: app.Ctx): Promise<FleetSettings> {
  return saveFleet(ctx, { enabled: false })
}

export async function scheduleTick(ctx: app.Ctx): Promise<void> {
  await botTickJob.scheduleJobAsap(ctx)
}
