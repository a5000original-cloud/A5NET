<template>
  <div class="group relative overflow-hidden rounded-xl border border-line/80 bg-black">
    <video
      ref="video"
      :src="src"
      :poster="poster"
      class="aspect-video w-full cursor-pointer object-cover"
      preload="metadata"
      playsinline
      @click="toggle"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTime"
      @loadedmetadata="onMeta"
    ></video>

    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>

    <button
      v-if="!playing"
      type="button"
      class="absolute inset-0 flex items-center justify-center"
      :aria-label="'Смотреть ' + title"
      @click="toggle"
    >
      <span class="flex h-16 w-16 items-center justify-center rounded-full border border-lime/40 bg-ink/70 text-lime backdrop-blur transition group-hover:scale-105 group-hover:border-lime">
        <svg width="20" height="22" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
      </span>
    </button>

    <div class="absolute inset-x-0 bottom-0 p-3">
      <div class="mb-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
        <div class="h-full rounded-full bg-lime transition-[width]" :style="{ width: progress * 100 + '%' }"></div>
      </div>
      <div class="flex items-center justify-between text-[10px] text-white/80">
        <span class="a5-mono">{{ title }}</span>
        <span class="font-mono">{{ formatDuration(position) }} / {{ formatDuration(total || duration) }}</span>
      </div>
    </div>

    <button
      type="button"
      class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur transition hover:text-lime"
      :aria-label="muted ? 'Включить звук' : 'Выключить звук'"
      @click="toggleMute"
    >
      <svg v-if="!muted" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 5.5a3.5 3.5 0 010 5" stroke-linecap="round" /></svg>
      <svg v-else width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 6l3 4M13.5 6l-3 4" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { postWatchRoute } from '../api/post/watch'
import { formatDuration } from '../shared/format'

const props = defineProps<{ src: string; title: string; duration: number; postId: string }>()

const video = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const muted = ref(false)
const position = ref(0)
const total = ref(0)
let listened = 0
let reported = false

const poster = computed(() => props.src.includes('/get/') ? `${props.src.replace('/get/', '/thumbnail/')}/s/800x` : undefined)

const progress = computed(() => (total.value ? Math.min(1, position.value / total.value) : 0))

function toggle() {
  const element = video.value
  if (!element) return
  if (element.paused) void element.play()
  else element.pause()
}

function toggleMute() {
  const element = video.value
  if (!element) return
  element.muted = !element.muted
  muted.value = element.muted
}

function onPlay() {
  playing.value = true
}

function onPause() {
  playing.value = false
  report()
}

function onEnded() {
  playing.value = false
  report(true)
}

function onTime() {
  const element = video.value
  if (!element) return
  position.value = element.currentTime
  listened = Math.max(listened, element.currentTime)
}

function onMeta() {
  const element = video.value
  if (!element) return
  total.value = Number.isFinite(element.duration) ? element.duration : props.duration
}

function report(force = false) {
  if (reported && !force) return
  if (listened < 1) return
  reported = true
  void postWatchRoute.run(ctx, { id: props.postId, seconds: Math.round(listened) }).catch(() => undefined)
}

onUnmounted(() => {
  video.value?.pause()
  report()
})
</script>
