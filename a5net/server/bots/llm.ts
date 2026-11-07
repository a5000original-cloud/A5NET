import { request } from '@app/request'
import { getLlmConfig, getLlmHealth, markLastProvider, markProviderFailure, markProviderSuccess, type LlmConfig, type ProviderId } from '../settings'

export interface LlmResult {
  text: string
  provider: string
  model: string
  latencyMs: number
}

interface LlmRequest {
  system: string
  user: string
  json?: boolean
  maxTokens?: number
  temperature?: number
}

const TIMEOUT_MS = 8000

function openAiBody(config: LlmConfig, provider: ProviderId, input: LlmRequest) {
  return {
    model: config.providers[provider].model,
    messages: [
      { role: 'system', content: input.system },
      { role: 'user', content: input.user },
    ],
    temperature: input.temperature ?? 0.95,
    max_tokens: input.maxTokens ?? 420,
    ...(input.json ? { response_format: { type: 'json_object' } } : {}),
  }
}

function readOpenAiText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices
  const content = choices?.[0]?.message?.content
  return typeof content === 'string' ? content : ''
}

function readGeminiText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const candidates = (payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>
  }).candidates
  const parts = candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map(part => (typeof part.text === 'string' ? part.text : '')).join('')
}

async function callProvider(
  ctx: app.Ctx,
  config: LlmConfig,
  provider: ProviderId,
  input: LlmRequest,
): Promise<string | null> {
  const apiKey = config.providers[provider].apiKey
  if (!apiKey) return null

  if (provider === 'gemini') {
    const model = config.providers.gemini.model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
    const response = await request.post<unknown>(url, {
      systemInstruction: { parts: [{ text: input.system }] },
      contents: [{ role: 'user', parts: [{ text: input.user }] }],
      generationConfig: {
        temperature: input.temperature ?? 0.95,
        maxOutputTokens: input.maxTokens ?? 420,
        ...(input.json ? { responseMimeType: 'application/json' } : {}),
      },
    }, { timeout: TIMEOUT_MS, throwHttpErrors: false })
    if (response.statusCode < 200 || response.statusCode >= 300) {
      ctx.log(`A5NET LLM gemini HTTP ${response.statusCode}`)
      return null
    }
    return readGeminiText(response.body)
  }

  const url = provider === 'openrouter'
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions'
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://a5000net.chatium.ru'
    headers['X-Title'] = 'A5NET'
  }
  const response = await request.post<unknown>(url, openAiBody(config, provider, input), {
    headers,
    timeout: TIMEOUT_MS,
    throwHttpErrors: false,
  })
  if (response.statusCode < 200 || response.statusCode >= 300) {
    ctx.log(`A5NET LLM ${provider} HTTP ${response.statusCode}`)
    return null
  }
  return readOpenAiText(response.body)
}

export async function llmComplete(ctx: app.Ctx, input: LlmRequest): Promise<LlmResult | null> {
  const config = await getLlmConfig(ctx)
  const health = await getLlmHealth(ctx)
  const started = Date.now()
  for (const provider of config.order) {
    if (!config.providers[provider].apiKey) continue
    if ((health[provider]?.blockedUntil ?? 0) > Date.now()) continue
    try {
      const text = await callProvider(ctx, config, provider, input)
      if (!text || !text.trim()) continue
      const latencyMs = Date.now() - started
      void markLastProvider(ctx, provider).catch(() => undefined)
      void markProviderSuccess(ctx, provider).catch(() => undefined)
      return {
        text: text.trim(),
        provider,
        model: config.providers[provider].model,
        latencyMs,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown'
      ctx.log(`A5NET LLM ${provider} failed: ${message}`)
      void markProviderFailure(ctx, provider).catch(() => undefined)
    }
  }
  return null
}

export function extractJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    const slice = text.slice(start, end + 1)
    try {
      const parsed = JSON.parse(slice)
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
    } catch {
      // fall through to heuristics
    }
  }
  const actionMatch = text.match(/"action"\s*:\s*"([A-Z_]+)"/i)
  if (actionMatch?.[1]) return { action: actionMatch[1] }
  return null
}
