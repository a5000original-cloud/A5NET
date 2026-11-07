import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireOwner } from '../../server/access'
import {
  getFleet,
  getLlmConfig,
  publicLlm,
  saveFleet,
  saveLlmConfig,
  type ProviderId,
} from '../../server/settings'
import { runFleetTick, startFleet, stopFleet, scheduleTick, waitAllBots } from '../../server/bots/fleet'
import { growFleet } from '../../server/bots/grow'
import { seedA5Net } from '../../server/seed'

export const controlUpdateRoute = app.post('/')
  .body(s => ({
    action: s.enum(['tick', 'seed', 'start', 'stop', 'wait_all', 'grow'] as const).optional(),
    aggressiveness: s.number().min(0).max(1).optional(),
    intervalMin: s.number().int().min(1).max(60).optional(),
    intervalMax: s.number().int().min(2).max(120).optional(),
    maxBotsPerTick: s.number().int().min(1).max(8).optional(),
    provider: s.enum(['openrouter', 'gemini', 'groq'] as const).optional(),
    apiKey: s.string().max(300).optional(),
    model: s.string().max(120).optional(),
    clearKey: s.boolean().optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      await requireOwner(ctx)
      let message = ''

      if (req.body.action === 'seed') {
        const report = await seedA5Net(ctx)
        message = report.skipped
          ? 'Флот уже посеян. Принудительный сид не запускаю, чтобы не дублировать данные.'
          : `Создано: ${report.bots} ботов, ${report.posts} постов, ${report.comments} комментариев, ${report.friendships} дружб.`
      }

      if (req.body.action === 'start') {
        await startFleet(ctx, {
          aggressiveness: req.body.aggressiveness,
          intervalMin: req.body.intervalMin,
          intervalMax: req.body.intervalMax,
          maxBotsPerTick: req.body.maxBotsPerTick,
        })
        message = 'Флот запущен. Первый цикл начнётся в ближайшую минуту.'
      }

      if (req.body.action === 'stop') {
        await stopFleet(ctx)
        message = 'Флот остановлен. Текущая цепочка задач завершится без новых действий.'
      }

      if (req.body.action === 'wait_all') {
        const count = await waitAllBots(ctx)
        message = `Экстренный WAIT: ${count} ботам назначена пауза на 2 часа.`
      }

      if (req.body.action === 'grow') {
        const created = await growFleet(ctx, 10)
        message = `Флот вырос: +${created.length} ботов. Теперь у них есть свои вкусы и паузы.`
      }

      if (req.body.action === 'tick') {
        const results = await runFleetTick(ctx, true)
        message = results.length
          ? `Прогнал цикл: ${results.map(result => `${result.name} — ${result.action.toLowerCase()}`).join(', ')}.`
          : 'Никто из ботов не был готов к действию. Проверь циркадные ритмы и паузы.'
      }

      const patch = {
        aggressiveness: req.body.aggressiveness,
        intervalMin: req.body.intervalMin,
        intervalMax: req.body.intervalMax,
        maxBotsPerTick: req.body.maxBotsPerTick,
      }
      const hasPatch = Object.values(patch).some(value => value !== undefined)
      if (hasPatch && req.body.action !== 'start' && req.body.action !== 'stop') {
        await saveFleet(ctx, patch)
        message = message || 'Настройки флота сохранены.'
      }

      if (req.body.provider) {
        const config = await getLlmConfig(ctx)
        const provider: ProviderId = req.body.provider
        if (req.body.clearKey) {
          config.providers[provider].apiKey = ''
        } else if (req.body.apiKey && !req.body.apiKey.includes('…')) {
          config.providers[provider].apiKey = req.body.apiKey.trim()
        }
        if (req.body.model?.trim()) config.providers[provider].model = req.body.model.trim()
        await saveLlmConfig(ctx, config)
        message = message || `Провайдер ${provider} обновлён.`
      }

      const [fleet, llmConfig] = await Promise.all([getFleet(ctx), getLlmConfig(ctx)])
      return {
        ok: true as const,
        message,
        fleet,
        llm: publicLlm(llmConfig),
      }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })

void scheduleTick
