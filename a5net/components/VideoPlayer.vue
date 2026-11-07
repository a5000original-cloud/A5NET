<template>
  <div ref="shell" class="group relative overflow-hidden rounded-2xl border border-line/80 bg-black">
    <video
      ref="video"
      :src="src"
      :poster="poster"
      class="aspect-video w-full cursor-pointer object-cover"
      preload="none"
      playsinline
      @click="toggle"
      @dblclick="fullscreen"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTime"
      @loadedmetadata="onMeta"
    ></video>

    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10"></div>
    <A5Stamp :size="26" tone="light" class="absolute bottom-16 right-4 opacity-40 mix-blend-screen" />

    <button
      v-if="!playing"
      type="button"
      class="absolute inset-0 flex items-center justify-center"
      :aria-label="'Смотреть ' + title"
      @click="toggle"
    >
      <span class="flex h-16 w-16 items-center justify-center rounded-full border border-ember/50 bg-ink/70 text-ember backdrop-blur transition group-hover:scale-105 group-hover:border-ember">
        <svg width="20" height="22" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
      </span>
    </button>

    <div class="absolute inset-x-0 bottom-0 p-3 transition-opacity duration-200 sm:opacity-0 sm:delay-200 sm:group-hover:opacity-100">
      <div class="relative mb-2 h-[2px] w-full cursor-pointer rounded-full bg-white/20" @click="seek">
        <div class="h-full rounded-full bg-ember transition-[width]" :style="{ width: progress * 100 + '%' }"></div>
        <span class="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember" :style="{ left: progress * 100 + '%' }"></span>
      </div>
      <div class="flex items-center justify-between gap-2 text-[10px] text-white/80">
        <span class="a5-mono hidden truncate sm:block">{{ title }}</span>
        <span class="font-mono">{{ formatLongDuration(position) }} / {{ formatLongDuration(total || duration) }}</span>
        <div class="ml-auto flex items-center gap-1">
          <button type="button" class="rounded px-1.5 py-0.5 font-mono text-[10px] hover:bg-white/15 hover:text-ember" :aria-label="'Скорость ' + speed" @click.stop="cycleSpeed">{{ speed }}×</button>
          <button type="button" class="hidden h-7 w-7 items-center justify-center rounded hover:bg-white/15 hover:text-ember sm:flex" aria-label="Картинка в картинке" @click.stop="pictureInPicture">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="3" width="12" height="10" rx="1.5" /><rect x="8" y="8" width="5" height="4" rx="1" /></svg>
          </button>
          <button type="button" class="flex h-7 w-7 items-center justify-center rounded hover:bg-white/15 hover:text-ember" aria-label="На весь экран" @click.stop="fullscreen">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 2H2v4M10 2h4v4M2 10v4h4M14 10v4h-4" stroke-linecap="round" /></svg>
          </button>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur transition hover:text-ember"
      :aria-label="muted ? 'Включить звук' : 'Выключить звук'"
      @click.stop="toggleMute"
    >
      <svg v-if="!muted" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 5.5a3.5 3.5 0 010 5" stroke-linecap="round" /></svg>
      <svg v-else width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6v4h2.5L8 13V3L4.5 6H2z" /><path d="M10.5 6l3 4M13.5 6l-3 4" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { postWatchRoute } from '../api/post/watch'
import { formatLongDuration } from '../shared/upload'
import A5Stamp from './A5Stamp.vue'

const props = defineProps<{ src: string; title: string; duration: number; postId: string; coverUrl?: string | null }>()

const shell = ref<HTMLDivElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const muted = ref(false)
const speed = ref(1)
const position = ref(0)
const total = ref(0)
let listened = 0
let reported = false

const poster = computed(() => props.coverUrl || (props.src.includes('/get/') ? `${props.src.replace('/get/', '/thumbnail/')}/s/1280x` : undefined))
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

function cycleSpeed() {
  const options = [1, 1.25, 1.5, 2, 0.75]
  speed.value = options[(options.indexOf(speed.value) + 1) % options.length] ?? 1
  if (video.value) video.value.playbackRate = speed.value
}

function seek(event: MouseEvent) {
  const element = video.value
  const target = event.currentTarget as HTMLElement | null
  if (!element || !target || !total.value) return
  const rect = target.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  element.currentTime = ratio * total.value
  position.value = element.currentTime
}

async function pictureInPicture() {
  const element = video.value
  if (!element || !document.pictureInPictureEnabled) return
  try {
    if (document.pictureInPictureElement) await document.exitPictureInPicture()
    else await element.requestPictureInPicture()
  } catch {
    // browser can refuse PiP for this source
  }
}

async function fullscreen() {
  const element = shell.value
  if (!element) return
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await element.requestFullscreen()
  } catch {
    // ignore fullscreen refusal
  }
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
