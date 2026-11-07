<template>
  <section class="a5-card flex h-[68vh] min-h-[460px] flex-col overflow-hidden">
    <div class="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-5">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-sm font-bold text-ink">A5</span>
        <div>
          <p class="text-sm font-medium text-bone">A5000_Менеджер</p>
          <p class="a5-mono text-[9px] uppercase tracking-[0.16em] text-moss">бот-помощник · правила A5NET</p>
        </div>
      </div>
      <span class="a5-pill !text-moss/80 !border-line">
        <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
        на связи
      </span>
    </div>

    <div ref="scroller" class="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
      <div v-if="!messages.length" class="mx-auto max-w-xl rounded-2xl border border-line/80 bg-panel2/50 p-5">
        <p class="text-sm leading-relaxed text-bone">
          Здравствуйте! Я бот-помощник A5NET. Отвечаю по делу: вход и аккаунт, инвайты, профиль,
          публикации, комментарии, подписки, друзья, коллаборации, жалобы и ошибки.
        </p>
        <p class="mt-3 text-sm leading-relaxed text-moss">
          Опишите, что случилось, — и я дам следующий шаг. Если ответа нет, подскажу, как связаться с A5000 лично.
        </p>
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[86%] rounded-2xl border px-4 py-3 sm:max-w-[78%]"
          :class="message.role === 'user'
            ? 'border-lime/25 bg-lime/10'
            : 'border-line/80 bg-panel2/60'"
        >
          <p class="a5-mono mb-1 text-[9px] uppercase tracking-[0.14em] text-moss/60">
            {{ message.role === 'user' ? 'вы' : 'A5000_Менеджер' }}
            <span v-if="formatTime(message.createdAt)"> · {{ formatTime(message.createdAt) }}</span>
          </p>
          <p class="whitespace-pre-wrap text-sm leading-relaxed text-bone">{{ message.text }}</p>
        </div>
      </div>

      <div v-if="suggestions.length && !sending" class="flex flex-wrap gap-2 pt-1">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          class="rounded-full border border-line bg-panel2/70 px-3 py-2 text-left text-xs text-moss transition hover:border-lime/40 hover:text-lime"
          @click="ask(suggestion)"
        >{{ suggestion }}</button>
      </div>
    </div>

    <div v-if="error" class="border-t border-line/70 bg-panel2/40 px-4 py-2.5 sm:px-5">
      <p class="text-[11px] leading-relaxed text-ember/80">{{ error }}</p>
    </div>

    <form class="border-t border-line/70 p-3 sm:p-4" @submit.prevent="submit()">
      <div class="flex items-end gap-2">
        <textarea
          v-model="draft"
          rows="2"
          class="a5-input min-h-[48px] flex-1 resize-none"
          placeholder="Напишите вопрос по A5NET…"
          maxlength="2000"
          :disabled="sending"
          @keydown.enter.exact.prevent="submit()"
        ></textarea>
        <button
          type="submit"
          class="a5-btn-primary h-12 shrink-0 !px-5"
          :disabled="!draft.trim() || sending"
        >{{ sending ? '…' : 'Отправить' }}</button>
      </div>
      <p class="a5-mono mt-2 text-[9px] uppercase tracking-[0.12em] text-moss/50">
        Enter — отправить · Shift+Enter — новая строка
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { managerMessageRoute } from '../api/manager/message'
import type { ManagerMessageView } from '../shared/types'

const props = defineProps<{ initialMessages: ManagerMessageView[]; initialSuggestions: string[] }>()

const messages = ref<ManagerMessageView[]>([...props.initialMessages])
const suggestions = ref<string[]>([...props.initialSuggestions])
const draft = ref('')
const sending = ref(false)
const error = ref('')
const scroller = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  const element = scroller.value
  if (element) element.scrollTop = element.scrollHeight
}

async function submit(override?: string) {
  const text = (override ?? draft.value).trim()
  if (!text || sending.value) return

  sending.value = true
  error.value = ''
  const localId = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
  messages.value.push({
    id: localId,
    role: 'user',
    text,
    intent: null,
    createdAt: new Date().toISOString(),
  })
  draft.value = ''
  suggestions.value = []
  await scrollToBottom()

  try {
    const result = await managerMessageRoute.run(ctx, { text })
    if (!result.ok) {
      error.value = result.error
      messages.value = messages.value.filter(message => message.id !== localId)
      draft.value = text
      return
    }
    messages.value.push({
      id: `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: 'bot',
      text: result.reply.text,
      intent: result.reply.intent,
      createdAt: result.reply.createdAt,
    })
    suggestions.value = result.reply.suggestions
  } catch {
    error.value = 'Бот не ответил. Попробуйте отправить вопрос ещё раз.'
    messages.value = messages.value.filter(message => message.id !== localId)
    draft.value = text
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

async function ask(suggestion: string) {
  await submit(suggestion)
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

watch(
  () => messages.value.length,
  () => { void scrollToBottom() },
  { flush: 'post' },
)

onMounted(() => { void scrollToBottom() })
</script>
