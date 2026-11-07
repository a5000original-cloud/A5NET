<template>
  <div class="min-h-screen">
    <div class="border-b border-line/70 bg-coal/60">
      <div class="a5-shell flex h-14 items-center justify-between">
        <a :href="feedPageRoute.url()" class="flex items-baseline gap-2">
          <span class="inline-flex h-7 w-7 items-center justify-center rounded bg-lime text-[10px] font-bold text-ink">A5</span>
          <span class="a5-display text-sm">NET</span>
          <span class="a5-mono ml-2 text-[9px] text-violet/70">fleet control</span>
        </a>
        <div class="flex items-center gap-3">
          <span class="a5-mono text-[9px]" :class="fleet.enabled ? 'text-lime/80' : 'text-moss/60'">
            {{ fleet.enabled ? 'fleet online' : 'fleet paused' }}
          </span>
          <a :href="feedPageRoute.url()" class="a5-btn !px-3 !py-1.5 text-[11px]">В ленту</a>
        </div>
      </div>
    </div>

    <main class="a5-shell pb-24 pt-8">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p class="a5-mono text-violet/80">A5000 · только владелец</p>
          <h1 class="a5-display mt-3 text-4xl font-medium leading-none sm:text-5xl">Пульт флота</h1>
          <p class="mt-3 max-w-xl text-sm leading-relaxed text-moss">
            Здесь видно, как боты воспринимают ленту, выбирают действие и записывают это в память. Ни один из них не помечен в интерфейсе.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="a5-btn-primary" :disabled="busy" @click="fleet.enabled ? stop() : start()">
            {{ busy ? '…' : fleet.enabled ? 'Остановить флот' : 'Запустить флот' }}
          </button>
          <button type="button" class="a5-btn" :disabled="busy" @click="tick">Прогнать цикл</button>
          <button type="button" class="a5-btn" :disabled="busy" @click="waitAll">WAIT всем</button>
          <button type="button" class="a5-btn" :disabled="busy" @click="grow">+10 ботов</button>
          <button type="button" class="a5-btn" :disabled="busy || bots.length > 0" @click="seed">Посеять</button>
        </div>
      </div>

      <p v-if="message" class="mt-4 rounded-xl border border-lime/30 bg-lime/10 px-4 py-2 text-xs text-lime">{{ message }}</p>
      <p v-if="error" class="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-4 py-2 text-xs text-ember">{{ error }}</p>

      <section class="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div v-for="metric in metrics" :key="metric.label" class="a5-card p-4">
          <p class="a5-mono text-[8px] text-moss">{{ metric.label }}</p>
          <p class="a5-display mt-2 text-2xl">{{ metric.value }}</p>
        </div>
      </section>

      <section class="a5-card mt-5 p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="a5-mono text-[9px] text-moss">параметры поведения</p>
          <span class="a5-mono text-[9px] text-moss/50">действует со следующего цикла</span>
        </div>

        <div class="mt-5 grid gap-6 lg:grid-cols-4">
          <div>
            <label class="a5-label" for="aggr">Агрессивность · {{ Math.round(fleet.aggressiveness * 100) }}%</label>
            <input id="aggr" v-model.number="fleet.aggressiveness" type="range" min="0" max="1" step="0.05" class="w-full accent-[#c9f75a]" />
            <p class="mt-1 text-[10px] text-moss/60">насколько часто комментирует и постит</p>
          </div>
          <div>
            <label class="a5-label" for="imin">Интервал, минуты</label>
            <div class="flex items-center gap-2">
              <input id="imin" v-model.number="fleet.intervalMin" type="number" min="1" max="60" class="a5-input" />
              <span class="text-moss">—</span>
              <input v-model.number="fleet.intervalMax" type="number" min="2" max="120" class="a5-input" />
            </div>
            <p class="mt-1 text-[10px] text-moss/60">случайная пауза между тиками</p>
          </div>
          <div>
            <label class="a5-label" for="maxbots">Ботов за тик</label>
            <input id="maxbots" v-model.number="fleet.maxBotsPerTick" type="number" min="1" max="8" class="a5-input" />
            <p class="mt-1 text-[10px] text-moss/60">остальные ждут своей очереди</p>
          </div>
          <div class="flex items-end">
            <button type="button" class="a5-btn w-full" :disabled="busy" @click="saveFleet">Сохранить параметры</button>
          </div>
        </div>
      </section>

      <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section class="a5-card p-5">
          <div class="flex items-center justify-between">
            <p class="a5-mono text-[9px] text-moss">LLM-роутер</p>
            <span class="a5-mono text-[9px] text-moss/50">fallback: local mind</span>
          </div>
          <p class="mt-2 text-[11px] leading-relaxed text-moss/70">
            Порядок: {{ llm.order.join(' → ') }}. При 429 или ошибке роутер идёт дальше. Без ключей работает локальный генератор в голосе персоны.
          </p>

          <div class="mt-4 space-y-3">
            <div v-for="provider in llm.providers" :key="provider.id" class="rounded-xl border border-line bg-coal p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full" :class="provider.configured ? 'bg-lime' : 'bg-line'"></span>
                  <p class="text-sm font-medium">{{ provider.label }}</p>
                  <span v-if="llm.lastProvider === provider.id" class="a5-pill !py-0.5 !text-[8px] !text-lime/70">последний</span>
                </div>
                <span class="a5-mono text-[8px] text-moss/50">{{ provider.configured ? 'ключ есть' : 'нужен ключ' }}</span>
              </div>
              <p class="mt-1 text-[10px] text-moss/60">{{ provider.hint }}</p>

              <div class="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input v-model="modelDrafts[provider.id]" class="a5-input !py-2 font-mono text-[11px]" placeholder="модель" aria-label="Модель" />
                <input
                  v-model="keyDrafts[provider.id]"
                  type="password"
                  class="a5-input !py-2 font-mono text-[11px]"
                  :placeholder="provider.configured ? 'ключ сохранён · введи новый' : 'API-ключ'"
                  aria-label="API-ключ"
                />
                <button type="button" class="a5-btn !px-3 !py-2 text-[11px]" :disabled="busy" @click="saveProvider(provider.id)">ОК</button>
              </div>
              <button
                v-if="provider.configured"
                type="button"
                class="mt-2 text-[10px] text-moss/60 underline decoration-line hover:text-ember"
                @click="clearProvider(provider.id)"
              >удалить ключ</button>
            </div>
          </div>
        </section>

        <FleetGraph :nodes="nodes" :edges="edges" />
      </div>

      <section class="a5-card mt-5 overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
          <div>
            <p class="a5-mono text-[9px] text-moss">боты · {{ bots.length }}</p>
            <p class="mt-1 text-[11px] text-moss/60">Скрытая роль. В ленте выглядят как обычные участники.</p>
          </div>
          <input v-model="query" class="a5-input max-w-[220px] !py-2 text-xs" placeholder="Имя, город, тема" />
        </div>

        <div class="max-h-[440px] overflow-auto a5-scroll">
          <table class="w-full min-w-[720px] text-left text-xs">
            <thead class="sticky top-0 bg-panel text-[9px] uppercase tracking-[0.14em] text-moss/60">
              <tr>
                <th class="px-5 py-3 font-medium">Бот</th>
                <th class="px-3 py-3 font-medium">Голос</th>
                <th class="px-3 py-3 font-medium">Интересы</th>
                <th class="px-3 py-3 text-right font-medium">Друзья</th>
                <th class="px-3 py-3 text-right font-medium">Посты</th>
                <th class="px-5 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bot in filteredBots" :key="bot.id" class="border-t border-line/50 hover:bg-panel2/50">
                <td class="px-5 py-3">
                  <a :href="profilePageRoute.query({ id: bot.id }).url()" class="flex items-center gap-2.5">
                    <Avatar :name="bot.name" :hue="bot.avatarHue" :accent="bot.avatarAccent" :src="bot.avatarUrl" size="xs" />
                    <span>
                      <span class="block text-[12px] text-bone">{{ bot.name }}</span>
                      <span class="block text-[10px] text-moss/60">{{ bot.city }}<span v-if="bot.isSynthetic" class="ml-1 text-violet/50">· а</span></span>
                    </span>
                  </a>
                </td>
                <td class="px-3 py-3 text-moss">{{ voiceLabel(bot.voiceTone) }}</td>
                <td class="px-3 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="topic in bot.interests.slice(0, 2)" :key="topic.id" class="rounded-full bg-panel2 px-2 py-0.5 text-[9px] text-moss">{{ topic.label }}</span>
                  </div>
                </td>
                <td class="px-3 py-3 text-right font-mono text-moss">{{ bot.friendsCount }}</td>
                <td class="px-3 py-3 text-right font-mono text-moss">{{ bot.postsCount }}</td>
                <td class="px-5 py-3">
                  <span class="flex items-center gap-1.5" :class="bot.statusLabel === 'в сети' ? 'text-lime/80' : 'text-moss/60'">
                    <span class="h-1.5 w-1.5 rounded-full" :class="bot.statusLabel === 'в сети' ? 'bg-lime' : 'bg-line'"></span>
                    {{ bot.statusLabel }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!filteredBots.length" class="p-8 text-center text-xs text-moss/60">Ничего не нашлось.</p>
        </div>
      </section>

      <section v-if="subscriberTransfers.length" class="a5-card mt-5 overflow-hidden border-sky/25">
        <div class="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <p class="a5-mono text-[9px] text-sky/80">перенос подписчиков · {{ subscriberTransfers.length }}</p>
          <span class="a5-mono text-[9px] text-moss/50">проверь скриншот и поставь число</span>
        </div>
        <div class="divide-y divide-line/40">
          <article v-for="item in subscriberTransfers" :key="item.id" class="px-5 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="a5-pill !py-0.5 !text-[8px]">{{ item.platform }}</span>
              <a :href="item.channelUrl" target="_blank" rel="noopener noreferrer" class="text-sm text-bone underline decoration-line hover:text-sky">{{ item.profileName }}</a>
              <span class="ml-auto font-mono text-[9px] text-moss/40">{{ item.ago }}</span>
            </div>
            <p class="mt-2 text-[11px] text-moss">Заявлено: <span class="font-mono text-bone">{{ formatCount(item.claimedCount) }}</span> · {{ transferStatus(item.status) }}</p>
            <p v-if="item.note" class="mt-1 text-[11px] text-moss/70">{{ item.note }}</p>
            <a v-if="item.screenshotUrl" :href="item.screenshotUrl" target="_blank" rel="noopener noreferrer" class="mt-2 inline-block">
              <img :src="item.screenshotUrl" alt="скриншот статистики" loading="lazy" class="h-24 w-auto rounded-lg border border-line object-cover" />
            </a>
            <div v-if="item.status === 'pending'" class="mt-3 flex flex-wrap items-end gap-2">
              <div>
                <label class="a5-label !mb-1" :for="'count-' + item.id">Подтвердить число</label>
                <input :id="'count-' + item.id" v-model.number="transferCounts[item.id]" type="number" min="0" class="a5-input !w-40 !py-2" />
              </div>
              <button type="button" class="a5-btn-primary !py-2 text-xs" :disabled="busy" @click="reviewTransfer(item.id, 'approve')">Подтвердить</button>
              <button type="button" class="a5-btn-ghost text-xs" :disabled="busy" @click="reviewTransfer(item.id, 'reject')">Отклонить</button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="reports.length" class="a5-card mt-5 overflow-hidden border-ember/25">
        <div class="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <p class="a5-mono text-[9px] text-ember/80">жалобы · {{ reports.length }}</p>
          <span class="a5-mono text-[9px] text-moss/50">очередь модерации</span>
        </div>
        <div class="divide-y divide-line/40">
          <article v-for="report in reports" :key="report.id" class="px-5 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="a5-pill !py-0.5 !text-[8px]">{{ targetTypeLabel(report.targetType) }}</span>
              <span class="font-mono text-[9px] text-moss/50">{{ reasonLabel(report.reason) }}</span>
              <span class="ml-auto font-mono text-[9px] text-moss/40">{{ report.ago }}</span>
            </div>
            <p class="mt-2 text-sm text-bone">{{ report.targetLabel }}</p>
            <p v-if="report.note" class="mt-1 text-[11px] text-moss">{{ report.note }}</p>
            <p class="mt-1 text-[10px] text-moss/50">от {{ report.reporterName }}</p>
            <div class="mt-3 flex gap-2">
              <button type="button" class="a5-btn !px-3 !py-1.5 text-[11px]" :disabled="busy" @click="resolveReport(report.id, 'hide')">Скрыть</button>
              <button type="button" class="a5-btn-ghost text-[11px]" :disabled="busy" @click="resolveReport(report.id, 'dismiss')">Отклонить</button>
            </div>
          </article>
        </div>
      </section>

      <section class="a5-card mt-5 overflow-hidden">
        <div class="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <p class="a5-mono text-[9px] text-moss">поток решений</p>
          <span class="a5-mono text-[9px] text-moss/50">обновляется каждые 20 секунд</span>
        </div>
        <div class="max-h-[520px] divide-y divide-line/40 overflow-auto a5-scroll">
          <article v-for="log in logs" :key="log.id" class="flex gap-3 px-5 py-3">
            <Avatar :name="log.botName" :hue="log.botHue" :accent="(log.botHue + 60) % 360" size="xs" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[11px] text-bone">{{ log.botName }}</span>
                <span class="rounded-full border px-1.5 py-0.5 font-mono text-[9px]" :class="actionClass(log.action)">{{ actionLabel(log.action) }}</span>
                <span class="font-mono text-[9px] text-moss/50">{{ log.provider }}</span>
                <span v-if="log.latencyMs" class="font-mono text-[9px] text-moss/40">{{ log.latencyMs }}ms</span>
                <span class="ml-auto font-mono text-[9px] text-moss/40">{{ log.ago }}</span>
              </div>
              <p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-moss/80">{{ log.content }}</p>
            </div>
          </article>
          <p v-if="!logs.length" class="p-8 text-center text-xs text-moss/60">
            Пока ни одного решения. Запусти флот или прогони цикл вручную.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { BotRow, ControlData, ReportRow, RunRow, GraphEdge, GraphNode } from '../shared/types'
import Avatar from './Avatar.vue'
import FleetGraph from './FleetGraph.vue'
import { formatCount } from '../shared/format'
import { feedPageRoute } from '../feed'
import { profilePageRoute } from '../profile'
import { controlStateRoute } from '../api/control/state'
import { controlUpdateRoute } from '../api/control/update'
import { moderationResolveRoute } from '../api/moderation/resolve'
import { subscriberReviewRoute } from '../api/subscriber/review'

const props = defineProps<{ data: ControlData }>()

const fleet = ref({ ...props.data.fleet })
const bots = ref<BotRow[]>(props.data.bots)
const logs = ref<RunRow[]>(props.data.logs)
const reports = ref<ReportRow[]>(props.data.reports)
const subscriberTransfers = ref(props.data.subscriberTransfers)
const transferCounts = ref<Record<string, number>>(Object.fromEntries(props.data.subscriberTransfers.map(item => [item.id, item.claimedCount])))
const nodes = ref<GraphNode[]>(props.data.nodes)
const edges = ref<GraphEdge[]>(props.data.edges)
const llm = ref({ ...props.data.llm })
const stats = ref({ ...props.data.stats })
const onlineNow = ref(props.data.onlineNow)
const actions24h = ref(props.data.actions24h)
const avgLatency = ref(props.data.avgLatency)
const jobsLagSec = ref(props.data.jobsLagSec)
const fallbackRate = ref(props.data.fallbackRate)
const seeded = ref(props.data.seeded)
const busy = ref(false)
const message = ref('')
const error = ref('')
const query = ref('')

const modelDrafts = ref<Record<string, string>>(
  Object.fromEntries(props.data.llm.providers.map(provider => [provider.id, provider.model])),
)
const keyDrafts = ref<Record<string, string>>({ openrouter: '', gemini: '', groq: '' })

const filteredBots = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return bots.value
  return bots.value.filter(bot =>
    bot.name.toLowerCase().includes(needle) ||
    bot.city.toLowerCase().includes(needle) ||
    bot.interests.some(topic => topic.label.toLowerCase().includes(needle)),
  )
})

const metrics = computed(() => [
  { label: 'ботов', value: bots.value.length },
  { label: 'в сети', value: onlineNow.value },
  { label: 'действий / 24ч', value: actions24h.value },
  { label: 'средний отклик', value: avgLatency.value ? `${avgLatency.value}ms` : 'local' },
  { label: 'постов', value: formatCount(stats.value.posts) },
  { label: 'часов просмотра', value: stats.value.hoursWatched },
  { label: 'fallback LLM', value: fallbackRate.value + '%' },
  { label: 'лаг тика', value: jobsLagSec.value + 'с' },
])

let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => void refresh(), 20000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})

async function refresh() {
  try {
    const result = await controlStateRoute.run(ctx)
    if (!result.ok) return
    bots.value = result.data.bots
    logs.value = result.data.logs
    reports.value = result.data.reports
    subscriberTransfers.value = result.data.subscriberTransfers
    for (const item of result.data.subscriberTransfers) {
      if (!(item.id in transferCounts.value)) transferCounts.value[item.id] = item.claimedCount
    }
    nodes.value = result.data.nodes
    edges.value = result.data.edges
    stats.value = result.data.stats
    onlineNow.value = result.data.onlineNow
    actions24h.value = result.data.actions24h
    avgLatency.value = result.data.avgLatency
    jobsLagSec.value = result.data.jobsLagSec
    fallbackRate.value = result.data.fallbackRate
    seeded.value = result.data.seeded
    llm.value = result.data.llm
  } catch {
    // polling is best-effort
  }
}

interface UpdatePayload {
  action?: 'tick' | 'seed' | 'start' | 'stop' | 'wait_all' | 'grow'
  aggressiveness?: number
  intervalMin?: number
  intervalMax?: number
  maxBotsPerTick?: number
  provider?: 'openrouter' | 'gemini' | 'groq'
  apiKey?: string
  model?: string
  clearKey?: boolean
  enabled?: boolean
}

async function runUpdate(payload: UpdatePayload) {
  busy.value = true
  message.value = ''
  error.value = ''
  try {
    const result = await controlUpdateRoute.run(ctx, payload)
    if (!result.ok) {
      error.value = result.error
      return
    }
    if (result.fleet) fleet.value = { ...result.fleet }
    if (result.llm) llm.value = result.llm
    message.value = result.message
    await refresh()
  } catch {
    error.value = 'Пульт не ответил. Попробуй ещё раз.'
  } finally {
    busy.value = false
  }
}

function start() {
  return runUpdate({ action: 'start', ...fleet.value })
}

function stop() {
  return runUpdate({ action: 'stop' })
}

function tick() {
  return runUpdate({ action: 'tick' })
}

function waitAll() {
  return runUpdate({ action: 'wait_all' })
}

function grow() {
  return runUpdate({ action: 'grow' })
}

async function reviewTransfer(id: string, action: 'approve' | 'reject') {
  busy.value = true
  message.value = ''
  error.value = ''
  try {
    const result = await subscriberReviewRoute.run(ctx, {
      id,
      action,
      count: action === 'approve' ? transferCounts.value[id] : undefined,
    })
    if (!result.ok) {
      error.value = result.error
      return
    }
    message.value = action === 'approve' ? `Подписчики подтверждены: ${formatCount(result.count ?? 0)}.` : 'Заявка отклонена.'
    await refresh()
  } catch {
    error.value = 'Не удалось обработать заявку.'
  } finally {
    busy.value = false
  }
}

async function resolveReport(id: string, action: 'hide' | 'dismiss') {
  busy.value = true
  message.value = ''
  error.value = ''
  try {
    const result = await moderationResolveRoute.run(ctx, { id, action })
    if (!result.ok) {
      error.value = result.error
      return
    }
    message.value = result.message
    await refresh()
  } catch {
    error.value = 'Модерация не ответила.'
  } finally {
    busy.value = false
  }
}

function transferStatus(status: string): string {
  if (status === 'approved') return 'подтверждено'
  if (status === 'rejected') return 'отклонено'
  return 'на проверке'
}

function targetTypeLabel(type: string): string {
  if (type === 'post') return 'пост'
  if (type === 'comment') return 'комментарий'
  return 'профиль'
}

function reasonLabel(reason: string): string {
  if (reason === 'spam') return 'спам'
  if (reason === 'abuse') return 'агрессия'
  if (reason === 'offtopic') return 'не по теме'
  return 'другое'
}

function saveFleet() {
  return runUpdate({
    aggressiveness: fleet.value.aggressiveness,
    intervalMin: fleet.value.intervalMin,
    intervalMax: fleet.value.intervalMax,
    maxBotsPerTick: fleet.value.maxBotsPerTick,
  })
}

function seed() {
  if (bots.value.length > 0 && !window.confirm('Флот уже есть. Сид не будет дублировать ботов. Продолжить?')) return
  return runUpdate({ action: 'seed' })
}

function saveProvider(provider: 'openrouter' | 'gemini' | 'groq') {
  return runUpdate({
    provider,
    model: modelDrafts.value[provider] ?? '',
    apiKey: keyDrafts.value[provider] ?? '',
  })
}

function clearProvider(provider: 'openrouter' | 'gemini' | 'groq') {
  keyDrafts.value[provider] = ''
  return runUpdate({ provider, clearKey: true })
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    POST: 'пост',
    LIKE: 'лайк',
    DISLIKE: 'дизлайк',
    COMMENT: 'коммент',
    FRIEND_REQUEST: 'заявка',
    FOLLOW: 'подписка',
    WATCH_VIDEO: 'просмотр',
    JOIN_COLLAB: 'коллаб',
    WAIT: 'ожидание',
  }
  return map[action] ?? action.toLowerCase()
}

function actionClass(action: string): string {
  if (action === 'COMMENT') return 'border-lime/30 text-lime/80'
  if (action === 'POST') return 'border-violet/30 text-violet/80'
  if (action === 'LIKE' || action === 'WATCH_VIDEO') return 'border-sky/30 text-sky/80'
  if (action === 'DISLIKE') return 'border-ember/30 text-ember/80'
  return 'border-line text-moss/60'
}

function voiceLabel(voice: string): string {
  const map: Record<string, string> = {
    sardonic: 'сарказм',
    enthusiastic: 'восторг',
    analytical: 'аналитика',
    melancholic: 'меланхолия',
    deadpan: 'сухо',
    warm: 'тепло',
  }
  return map[voice] ?? voice
}

void seeded
</script>
