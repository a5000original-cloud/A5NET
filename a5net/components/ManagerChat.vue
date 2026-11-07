<template>
  <section class="a5-card flex h-[68vh] min-h-[460px] flex-col overflow-hidden">
    <div class="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-5">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-sm font-bold text-ink">A5</span>
        <div>
          <p class="text-sm font-medium text-bone">A5000_Менеджер</p>
          <p class="a5-mono text-[9px] uppercase tracking-[0.16em] text-moss">цифровой помощник · A5NET</p>
        </div>
      </div>
      <span class="a5-pill !text-moss/80 !border-line">
        <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
        онлайн
      </span>
    </div>

    <div ref="scroller" class="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
      <div v-if="loading && !messages.length" class="flex h-full items-center justify-center">
        <p class="a5-mono text-[10px] uppercase tracking-[0.16em] text-moss/70">подключаю помощника…</p>
      </div>

      <template v-else-if="!messages.length">
        <div class="mx-auto max-w-xl rounded-2xl border border-line/80 bg-panel2/50 p-5">
          <p class="text-sm leading-relaxed text-bone">
            Здравствуйте! Я цифровой помощник A5NET. Помогу с входом, инвайтами, профилем, публикациями
            и ошибками на площадке.
          </p>
          <p class="mt-3 text-sm leading-relaxed text-moss">
            Опишите, что случилось, — и я подскажу следующий шаг. Чем точнее детали, тем быстрее разберёмся.
          </p>
        </div>

        <div class="mx-auto flex max-w-xl flex-wrap gap-2 pt-1">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            class="rounded-full border border-line bg-panel2/70 px-3 py-2 text-left text-xs text-moss transition hover:border-lime/40 hover:text-lime disabled:opacity-40"
            :disabled="sending"
            @click="ask(suggestion)"
          >{{ suggestion }}</button>
        </div>
      </template>

      <template v-else>
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.createdBy === me ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[86%] rounded-2xl border px-4 py-3 sm:max-w-[78%]"
            :class="message.createdBy === me
              ? 'border-lime/25 bg-lime/10'
              : 'border-line/80 bg-panel2/60'"
            :style="message.pending ? { opacity: 0.65 } : undefined"
          >
            <p class="a5-mono mb-1 text-[9px] uppercase tracking-[0.14em] text-moss/60">
              {{ message.createdBy === me ? 'вы' : 'A5000_Менеджер' }}
              <span v-if="formatTime(message.createdAt)"> · {{ formatTime(message.createdAt) }}</span>
            </p>
            <p class="whitespace-pre-wrap text-sm leading-relaxed text-bone">{{ message.text || '' }}</p>
          </div>
        </div>
      </template>
    </div>

    <div v-if="error || agentLinked === false" class="border-t border-line/70 bg-panel2/40 px-4 py-2.5 sm:px-5">
      <p class="text-[11px] leading-relaxed text-amber-200/80">
        {{ error || 'Помощник временно недоступен. Обновите страницу через минуту.' }}
      </p>
    </div>

    <form class="border-t border-line/70 p-3 sm:p-4" @submit.prevent="submit">
      <div class="flex items-end gap-2">
        <textarea
          v-model="draft"
          rows="2"
          class="a5-input min-h-[48px] flex-1 resize-none"
          placeholder="Опишите, что случилось…"
          :disabled="loading || sending || agentLinked === false"
          @keydown.enter.exact.prevent="submit"
        ></textarea>
        <button
          type="submit"
          class="a5-btn-primary h-12 shrink-0 !px-5"
          :disabled="!draft.trim() || sending || loading || agentLinked === false"
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
import { useChatClient } from '@start/sdk/chatClient/vue'

const props = defineProps<{
  agentId: string
  agentToken: string
  transportKey: string
}>()

const { messages, me, loading, error, agentLinked, send } = useChatClient({
  transport: { key: props.transportKey, title: 'A5000 Менеджер' },
  chat: { externalId: 'a5000-manager' },
  agentId: props.agentId,
  agentToken: props.agentToken,
})

const draft = ref('')
const sending = ref(false)
const scroller = ref<HTMLElement | null>(null)

const suggestions = [
  'Не получается войти',
  'Не срабатывает инвайт',
  'Как опубликовать пост',
  'Нашёл ошибку на сайте',
]

async function scrollToBottom() {
  await nextTick()
  const el = scroller.value
  if (el) el.scrollTop = el.scrollHeight
}

async function submit() {
  const text = draft.value.trim()
  if (!text || sending.value || loading.value || agentLinked.value === false) return
  sending.value = true
  try {
    await send(text)
    draft.value = ''
    await scrollToBottom()
  } catch {
    // Текст ошибки показывает error из useChatClient.
  } finally {
    sending.value = false
  }
}

async function ask(text: string) {
  draft.value = text
  await submit()
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
