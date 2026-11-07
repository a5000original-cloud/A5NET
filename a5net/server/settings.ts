import type { FleetSettings, LlmSettings, ProviderInfo } from '../shared/types'
import Settings from '../tables/settings.table'

export const FLEET_KEY = 'fleet'
export const LLM_KEY = 'llm'
export const SEED_KEY = 'seed'

export const DEFAULT_FLEET: FleetSettings = {
  enabled: false,
  aggressiveness: 0.45,
  intervalMin: 3,
  intervalMax: 15,
  maxBotsPerTick: 3,
}

export type ProviderId = 'openrouter' | 'gemini' | 'groq'

interface ProviderConfig {
  apiKey: string
  model: string
}

export interface LlmConfig {
  order: ProviderId[]
  providers: Record<ProviderId, ProviderConfig>
  lastProvider: string
}

export const PROVIDER_DEFAULTS: Record<ProviderId, ProviderConfig> = {
  openrouter: { apiKey: '', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  gemini: { apiKey: '', model: 'gemini-2.0-flash' },
  groq: { apiKey: '', model: 'llama-3.3-70b-versatile' },
}

export const PROVIDER_HINTS: Record<ProviderId, string> = {
  openrouter: 'openrouter.ai/keys — бесплатные модели, лимит в сутки',
  gemini: 'aistudio.google.com/apikey — щедрый бесплатный тир',
  groq: 'console.groq.com/keys — быстрый Llama/Mistral',
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openrouter: 'OpenRouter',
  gemini: 'Google AI Studio',
  groq: 'Groq',
}

export const DEFAULT_LLM: LlmConfig = {
  order: ['openrouter', 'gemini', 'groq'],
  providers: {
    openrouter: { ...PROVIDER_DEFAULTS.openrouter },
    gemini: { ...PROVIDER_DEFAULTS.gemini },
    groq: { ...PROVIDER_DEFAULTS.groq },
  },
  lastProvider: '',
}

export async function getSetting<T>(ctx: app.Ctx, key: string, fallback: T): Promise<T> {
  const rows = await Settings.findAll(ctx, { where: { key }, limit: 1 })
  const row = rows[0]
  if (!row) return fallback
  try {
    return JSON.parse(row.value) as T
  } catch {
    return fallback
  }
}

export async function setSetting(ctx: app.Ctx, key: string, value: unknown, isSecret = false): Promise<void> {
  const existing = await Settings.findAll(ctx, { where: { key }, limit: 1 })
  const row = existing[0]
  const raw = JSON.stringify(value)
  if (row) {
    await Settings.update(ctx, { id: row.id, value: raw, isSecret })
  } else {
    await Settings.create(ctx, { key, value: raw, isSecret })
  }
}

export async function getFleet(ctx: app.Ctx): Promise<FleetSettings> {
  const stored = await getSetting<Partial<FleetSettings>>(ctx, FLEET_KEY, {})
  return { ...DEFAULT_FLEET, ...stored }
}

export async function saveFleet(ctx: app.Ctx, patch: Partial<FleetSettings>): Promise<FleetSettings> {
  const current = await getFleet(ctx)
  const next: FleetSettings = {
    enabled: patch.enabled ?? current.enabled,
    aggressiveness: clamp01(patch.aggressiveness ?? current.aggressiveness),
    intervalMin: Math.max(1, Math.min(60, Math.round(patch.intervalMin ?? current.intervalMin))),
    intervalMax: Math.max(2, Math.min(120, Math.round(patch.intervalMax ?? current.intervalMax))),
    maxBotsPerTick: Math.max(1, Math.min(8, Math.round(patch.maxBotsPerTick ?? current.maxBotsPerTick))),
  }
  if (next.intervalMax < next.intervalMin) next.intervalMax = next.intervalMin + 2
  await setSetting(ctx, FLEET_KEY, next)
  return next
}

export async function getLlmConfig(ctx: app.Ctx): Promise<LlmConfig> {
  const stored = await getSetting<Partial<LlmConfig>>(ctx, LLM_KEY, {})
  const providers = { ...DEFAULT_LLM.providers }
  for (const id of ['openrouter', 'gemini', 'groq'] as ProviderId[]) {
    const saved = stored.providers?.[id]
    providers[id] = {
      apiKey: saved?.apiKey ?? providers[id].apiKey,
      model: saved?.model?.trim() || providers[id].model,
    }
  }
  const order = Array.isArray(stored.order) && stored.order.length
    ? stored.order.filter((id): id is ProviderId => id === 'openrouter' || id === 'gemini' || id === 'groq')
    : DEFAULT_LLM.order
  return { order, providers, lastProvider: stored.lastProvider ?? '' }
}

export async function saveLlmConfig(ctx: app.Ctx, config: LlmConfig): Promise<void> {
  await setSetting(ctx, LLM_KEY, config, true)
}

export function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 8) return '••••'
  return `${key.slice(0, 4)}…${key.slice(-4)}`
}

export function publicLlm(config: LlmConfig): LlmSettings {
  const providers: ProviderInfo[] = (['openrouter', 'gemini', 'groq'] as ProviderId[]).map(id => ({
    id,
    label: PROVIDER_LABELS[id],
    model: config.providers[id].model,
    configured: Boolean(config.providers[id].apiKey),
    hint: PROVIDER_HINTS[id],
  }))
  return { order: config.order, providers, lastProvider: config.lastProvider }
}

export async function markLastProvider(ctx: app.Ctx, provider: string): Promise<void> {
  const config = await getLlmConfig(ctx)
  if (config.lastProvider === provider) return
  config.lastProvider = provider
  await saveLlmConfig(ctx, config)
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export const LLM_HEALTH_KEY = 'llmHealth'

export interface ProviderHealth {
  failures: number
  blockedUntil: number
}

export type LlmHealth = Partial<Record<ProviderId, ProviderHealth>>

export async function getLlmHealth(ctx: app.Ctx): Promise<LlmHealth> {
  return getSetting<LlmHealth>(ctx, LLM_HEALTH_KEY, {})
}

export async function markProviderFailure(ctx: app.Ctx, provider: ProviderId): Promise<void> {
  const health = await getLlmHealth(ctx)
  const current = health[provider] ?? { failures: 0, blockedUntil: 0 }
  const failures = current.failures + 1
  health[provider] = {
    failures: failures >= 3 ? 0 : failures,
    blockedUntil: failures >= 3 ? Date.now() + 5 * 60 * 1000 : current.blockedUntil,
  }
  await setSetting(ctx, LLM_HEALTH_KEY, health)
}

export async function markProviderSuccess(ctx: app.Ctx, provider: ProviderId): Promise<void> {
  const health = await getLlmHealth(ctx)
  const current = health[provider]
  if (!current || (!current.failures && !current.blockedUntil)) return
  health[provider] = { failures: 0, blockedUntil: 0 }
  await setSetting(ctx, LLM_HEALTH_KEY, health)
}
