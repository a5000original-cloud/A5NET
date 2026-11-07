<template>
  <div class="group/audio relative overflow-hidden rounded-xl border border-line/80 bg-coal p-3" :class="compact ? '' : 'p-4'">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition hover:scale-105"
        :aria-label="playing ? 'Пауза' : 'Слушать'"
        @click="toggle"
      >
        <svg v-if="!playing" width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
        <svg v-else width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><rect x="1" y="1" width="3.2" height="12" rx="1" /><rect x="7.8" y="1" width="3.2" height="12" rx="1" /></svg>
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-bone">{{ title }}</p>
            <p v-if="artist" class="truncate text-[11px] text-moss">{{ artist }}</p>
          </div>
          <span class="a5-mono shrink-0 text-[9px] text-moss/80">{{ formatDuration(position) }} / {{ formatDuration(total) }}</span>
        </div>
        <div class="mt-2 flex h-7 items-end gap-[2px]" aria-hidden="true">
          <span
            v-for="(bar, index) in bars"
            :key="index"
            class="w-full rounded-sm transition-colors"
            :class="index / bars.length <= progress ? 'bg-lime/80' : 'bg-line'"
            :style="{ height: bar + '%' }"
          ></span>
        </div>
      </div>

      <button
        type="button"
        class="hidden h-8 w-8 items-center justify-center rounded-full text-moss transition hover:text-bone sm:flex"
        :aria-label="muted ? 'Включить звук' : 'Выключить звук'"
        @click="toggleMute"
      >
        <svg v-if="!muted" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 5.5a3.5 3.5 0 010 5" stroke-linecap="round" /><path d="M12.5 3.5a6 6 0 010 9" stroke-linecap="round" /></svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 6l3 4M13.5 6l-3 4" stroke-linecap="round" /></svg>
      </button>
    </div>

    <audio
      ref="audio"
      :src="src"
      preload="metadata"
      @timeupdate="onTime"
      @loadedmetadata="onMeta"
      @ended="onEnded"
      @pause="onPause"
      @play="onPlay"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { postWatchRoute } from '../api/post/watch'
import { formatDuration } from '../shared/format'

const props = withDefaults(defineProps<{
  src: string
  title: string
  artist?: string
  postId: string
  compact?: boolean
}>(), { compact: false })

const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const muted = ref(false)
const position = ref(0)
const total = ref(0)
let listened = 0
let reported = false

const bars = computed(() => {
  const seedText = `${props.title}${props.artist ?? ''}`
  const length = Math.max(1, seedText.length)
  return Array.from({ length: 56 }, (_, index) => {
    const code = seedText.charCodeAt(index % length)
    return 16 + ((code * 7 + index * 13) % 78)
  })
})

const progress = computed(() => (total.value ? Math.min(1, position.value / total.value) : 0))

function toggle() {
  const element = audio.value
  if (!element) return
  if (element.paused) void element.play()
  else element.pause()
}

function toggleMute() {
  const element = audio.value
  if (!element) return
  element.muted = !element.muted
  muted.value = element.muted
}

function onPlay() {
  playing.value = true
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
  total.value = Number.isFinite(element.duration) ? element.duration : 0
}

function onPause() {
  playing.value = false
  report()
}

function onEnded() {
  playing.value = false
  report(true)
}

function report(force = false) {
  if (reported && !force) return
  if (listened < 1) return
  reported = true
  void postWatchRoute.run(ctx, { id: props.postId, seconds: Math.round(listened) }).catch(() => undefined)
}

onUnmounted(() => {
  audio.value?.pause()
  report()
})
</script>
