<template>
  <div class="fixed inset-x-0 bottom-14 z-40 border-t border-line/80 bg-ink/95 backdrop-blur-xl md:bottom-0">
    <div v-if="queueOpen" class="absolute bottom-full right-3 mb-2 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-panel shadow-lift">
      <div class="flex items-center justify-between border-b border-line/70 px-4 py-3">
        <p class="a5-mono text-[9px] text-moss">очередь · {{ queue.length }}</p>
        <button type="button" class="text-xs text-moss hover:text-bone" @click="queueOpen = false">Закрыть</button>
      </div>
      <div class="a5-scroll max-h-[320px] overflow-auto">
        <button
          v-for="(id, index) in queue"
          :key="id"
          type="button"
          class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-panel2"
          :class="id === currentId ? 'bg-panel2' : ''"
          @click="select(id)"
        >
          <span class="w-5 shrink-0 font-mono text-[10px] text-moss/50">{{ id === currentId ? '▶' : index + 1 }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-[12px]" :class="id === currentId ? 'text-lime' : 'text-bone'">{{ trackOf(id)?.title }}</span>
            <span class="block truncate text-[10px] text-moss/60">{{ trackOf(id)?.artist }}</span>
          </span>
          <span class="font-mono text-[9px] text-moss/40">{{ formatLongDuration(trackOf(id)?.duration ?? 0) }}</span>
        </button>
      </div>
    </div>

    <div class="mx-auto flex max-w-[1240px] items-center gap-3 px-3 py-2.5 sm:px-6">
      <button type="button" class="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line" :style="{ background: current ? coverBackground(current.hue) : undefined }" @click="queueOpen = !queueOpen">
        <img v-if="currentCover" :src="currentCover" alt="" class="h-full w-full object-cover" />
        <span v-if="playing" class="absolute inset-0 flex items-end justify-center gap-[2px] bg-black/30 pb-1">
          <span v-for="bar in 4" :key="bar" class="a5-eq-bar w-[2px] bg-lime" :style="{ height: 6 + bar * 3 + 'px', animationDelay: bar * 90 + 'ms' }"></span>
        </span>
      </button>

      <div class="min-w-0 w-[150px] sm:w-[220px]">
        <p class="truncate text-[12px] font-medium text-bone">{{ current?.title ?? 'A5 Radio' }}</p>
        <p class="truncate text-[10px] text-moss">{{ current?.artist ?? 'выбери трек' }}</p>
      </div>

      <div class="flex items-center gap-1">
        <button type="button" class="hidden h-8 w-8 items-center justify-center rounded-full text-moss hover:text-bone sm:flex" aria-label="Предыдущий" @click="prev">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zM13 2v12L6 8z" /></svg>
        </button>
        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full bg-lime text-ink transition hover:scale-105" :aria-label="playing ? 'Пауза' : 'Играть'" @click="toggle">
          <svg v-if="!playing" width="13" height="15" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
          <svg v-else width="11" height="13" viewBox="0 0 12 14" fill="currentColor"><rect x="1" y="1" width="3.2" height="12" rx="1" /><rect x="7.8" y="1" width="3.2" height="12" rx="1" /></svg>
        </button>
        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-moss hover:text-bone" aria-label="Следующий" @click="next">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10 2h2v12h-2zM3 2v12l7-6z" /></svg>
        </button>
      </div>

      <div class="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
        <span class="font-mono text-[9px] text-moss/60">{{ formatLongDuration(position) }}</span>
        <div class="relative h-[3px] flex-1 cursor-pointer rounded-full bg-line" @click="seek">
          <div class="h-full rounded-full bg-violet" :style="{ width: progress * 100 + '%' }"></div>
          <span class="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet" :style="{ left: progress * 100 + '%' }"></span>
        </div>
        <span class="font-mono text-[9px] text-moss/60">{{ formatLongDuration(duration || current?.duration || 0) }}</span>
      </div>

      <div class="ml-auto flex items-center gap-1">
        <button type="button" class="hidden h-8 w-8 items-center justify-center rounded-full text-moss hover:text-bone sm:flex" :aria-label="shuffle ? 'Выключить случайный порядок' : 'Случайный порядок'" @click="shuffle = !shuffle">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 4h3l6 8h3M14 12l-2-2M14 4h-3L8 8" stroke-linecap="round" /></svg>
        </button>
        <button type="button" class="hidden h-8 w-8 items-center justify-center rounded-full text-[10px] font-mono sm:flex" :class="repeat ? 'text-violet' : 'text-moss hover:text-bone'" aria-label="Повтор" @click="repeat = !repeat">1</button>
        <button type="button" class="hidden h-8 w-8 items-center justify-center rounded-full text-moss hover:text-bone md:flex" aria-label="Звук" @click="muted = !muted">
          <svg v-if="!muted" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 5.5a3.5 3.5 0 010 5" stroke-linecap="round" /></svg>
          <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 6l3 4M13.5 6l-3 4" stroke-linecap="round" /></svg>
        </button>
        <button type="button" class="flex h-8 items-center gap-1 rounded-full px-2 text-[10px] text-moss hover:text-bone" @click="queueOpen = !queueOpen">
          <span class="hidden sm:inline">очередь</span>
          <span class="font-mono">{{ queue.length }}</span>
        </button>
      </div>
    </div>

    <audio
      ref="audio"
      :src="current?.url"
      preload="none"
      @timeupdate="onTime"
      @loadedmetadata="onMeta"
      @play="playing = true"
      @pause="onPause"
      @ended="onEnded"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { MusicTrack } from '../shared/types'
import { coverBackground, formatCount } from '../shared/format'
import { formatLongDuration } from '../shared/upload'
import { postWatchRoute } from '../api/post/watch'

const props = defineProps<{ tracks: MusicTrack[]; initialId?: string | null }>()

const audio = ref<HTMLAudioElement | null>(null)
const currentId = ref<string | null>(props.initialId ?? props.tracks[0]?.id ?? null)
const queue = ref<string[]>(props.tracks.map(track => track.id))
const playing = ref(false)
const position = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const muted = ref(false)
const shuffle = ref(false)
const repeat = ref(false)
const queueOpen = ref(false)
let pendingPlay = false
let reported = false
let listened = 0

const current = computed(() => props.tracks.find(track => track.id === currentId.value) ?? null)
const currentCover = computed(() => current.value?.coverUrl ?? '')
const progress = computed(() => (duration.value ? Math.min(1, position.value / duration.value) : 0))

function trackOf(id: string): MusicTrack | undefined {
  return props.tracks.find(track => track.id === id)
}

function select(id: string, nextQueue?: string[]) {
  if (nextQueue?.length) queue.value = nextQueue
  currentId.value = id
  pendingPlay = true
  reported = false
  listened = 0
  position.value = 0
}

function toggle() {
  const element = audio.value
  if (!element) return
  if (!element.src && current.value) element.src = current.value.url
  if (element.paused) void element.play()
  else element.pause()
}

function next() {
  if (!queue.value.length) return
  const index = currentId.value ? queue.value.indexOf(currentId.value) : -1
  const nextIndex = shuffle.value
    ? Math.floor(Math.random() * queue.value.length)
    : (index + 1) % queue.value.length
  select(queue.value[nextIndex] ?? queue.value[0]!)
}

function prev() {
  if (!queue.value.length) return
  const index = currentId.value ? queue.value.indexOf(currentId.value) : 0
  select(queue.value[(index - 1 + queue.value.length) % queue.value.length]!)
}

function onTime() {
  const element = audio.value
  if (!element) return
  position.value = element.currentTime
  listened = Math.max(listened, element.currentTime)
}

function onMeta() {
  const element = audio.value
  if (!element) return
  duration.value = Number.isFinite(element.duration) ? element.duration : current.value?.duration ?? 0
}

function onPause() {
  playing.value = false
  report()
}

function onEnded() {
  if (repeat.value && audio.value) {
    audio.value.currentTime = 0
    void audio.value.play()
    return
  }
  next()
}

function report() {
  if (reported || !currentId.value || listened < 1) return
  reported = true
  void postWatchRoute.run(ctx, { id: currentId.value, seconds: Math.round(listened) }).catch(() => undefined)
}

function seek(event: MouseEvent) {
  const element = audio.value
  const target = event.currentTarget as HTMLElement | null
  if (!element || !target || !duration.value) return
  const rect = target.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  element.currentTime = ratio * duration.value
  position.value = element.currentTime
}

async function playTrack(id: string, nextQueue?: string[]) {
  select(id, nextQueue)
  await nextTick()
  const element = audio.value
  if (!element) return
  element.volume = volume.value
  try {
    await element.play()
  } catch {
    playing.value = false
  }
}

async function playRadio() {
  if (!props.tracks.length) return
  const shuffled = [...props.tracks].sort(() => Math.random() - 0.5).map(track => track.id)
  await playTrack(shuffled[0]!, shuffled)
}

watch(currentId, async () => {
  if (!pendingPlay) return
  pendingPlay = false
  await nextTick()
  const element = audio.value
  if (!element) return
  element.volume = volume.value
  element.muted = muted.value
  try {
    await element.play()
  } catch {
    playing.value = false
  }
})

watch(volume, value => {
  if (audio.value) audio.value.volume = value
  try {
    window.localStorage.setItem('a5-volume', String(value))
  } catch {
    // storage can be disabled
  }
})

watch(muted, value => {
  if (audio.value) audio.value.muted = value
})

onMounted(() => {
  const saved = Number(window.localStorage.getItem('a5-volume') ?? '')
  if (Number.isFinite(saved) && saved > 0 && saved <= 1) volume.value = saved
  if (audio.value) audio.value.volume = volume.value
})

defineExpose({ playTrack, playRadio, select })
</script>
