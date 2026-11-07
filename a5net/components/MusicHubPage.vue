<template>
  <div class="a5-music-theme min-h-screen">
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="music" />

    <main class="a5-shell pb-44 pt-8">
      <section class="relative overflow-hidden rounded-3xl border border-line/80 bg-panel/50 p-6 sm:p-10">
        <div class="absolute inset-0 opacity-70" style="background: radial-gradient(70% 90% at 80% 20%, rgba(183,166,255,0.2), transparent 60%), radial-gradient(60% 80% at 10% 90%, rgba(143,216,210,0.14), transparent 60%)"></div>
        <div class="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p class="a5-mono text-violet/80">A5 AUDIO · без алгоритма</p>
            <h1 class="a5-display mt-4 text-4xl font-medium leading-[1.02] sm:text-6xl">Слушай,<br />пока живёшь.</h1>
            <p class="mt-4 max-w-lg text-sm leading-relaxed text-bone/70">
              Треки участников, полевые записи и найденное в чужих архивах. Одна очередь, без рекламы и без «рекомендованного вам».
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" class="a5-btn-primary" @click="radio">
                <svg width="12" height="14" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
                Включить A5 Radio
              </button>
              <button v-if="featured" type="button" class="a5-btn" @click="play(featured.id)">
                Слушать артефакт
              </button>
            </div>
            <div class="mt-8 flex flex-wrap gap-6 border-t border-line/60 pt-5">
              <div>
                <p class="a5-display text-2xl">{{ data.stats.tracks }}</p>
                <p class="a5-mono text-[8px] text-moss">треков</p>
              </div>
              <div>
                <p class="a5-display text-2xl">{{ data.stats.artists }}</p>
                <p class="a5-mono text-[8px] text-moss">артистов</p>
              </div>
              <div>
                <p class="a5-display text-2xl">{{ data.stats.hours }}</p>
                <p class="a5-mono text-[8px] text-moss">часов звука</p>
              </div>
            </div>
          </div>

          <div v-if="featured" class="relative mx-auto w-full max-w-[340px]">
            <div class="absolute -left-4 top-6 h-full w-full rounded-3xl border border-white/10 bg-white/[0.03]"></div>
            <div class="relative overflow-hidden rounded-3xl border border-white/15 bg-black/40 p-3 shadow-lift">
              <div class="relative aspect-square overflow-hidden rounded-2xl" :style="{ background: coverBackground(featured.hue) }">
                <img v-if="featured.coverUrl" :src="featured.coverUrl" alt="" class="h-full w-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div class="absolute inset-x-4 bottom-4">
                  <p class="a5-mono text-[8px] text-white/60">артефакт дня · audio</p>
                  <p class="mt-1 truncate text-lg font-medium text-white">{{ featured.title }}</p>
                  <p class="truncate text-[11px] text-white/60">{{ featured.artist }}</p>
                </div>
                <div class="absolute left-4 top-4 flex items-end gap-[3px]">
                  <span v-for="bar in 12" :key="bar" class="a5-eq-bar w-[3px] bg-violet/80" :style="{ height: 6 + ((bar * 7) % 24) + 'px', animationDelay: bar * 70 + 'ms' }"></span>
                </div>
              </div>
              <div class="flex items-center justify-between px-2 pb-1 pt-3">
                <span class="a5-mono text-[8px] text-moss">{{ formatLongDuration(featured.duration) }}</span>
                <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full bg-violet text-ink" aria-label="Играть артефакт" @click="play(featured.id)">
                  <svg width="12" height="14" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="a5-display text-xl">Полки</p>
        <input v-model="query" class="a5-input max-w-xs !py-2.5" placeholder="Трек, артист, настроение" />
      </div>

      <section v-for="shelf in visibleShelves" :key="shelf.id" class="mt-7">
        <div class="mb-3 flex items-end justify-between">
          <div>
            <h2 class="a5-display text-lg">{{ shelf.title }}</h2>
            <p class="text-[11px] text-moss/70">{{ shelf.subtitle }}</p>
          </div>
          <button type="button" class="a5-btn-ghost text-[11px]" @click="playShelf(shelf)">Играть полку</button>
        </div>
        <div class="a5-scroll flex gap-3 overflow-x-auto pb-3">
          <button
            v-for="track in shelfTracks(shelf)"
            :key="track.id"
            type="button"
            class="group w-[190px] shrink-0 text-left"
            @click="play(track.id, shelf.ids)"
          >
            <div class="relative aspect-square overflow-hidden rounded-2xl border border-line/70" :style="{ background: coverBackground(track.hue) }">
              <img v-if="track.coverUrl" :src="track.coverUrl" alt="" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <span class="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-lime opacity-0 backdrop-blur transition group-hover:opacity-100">
                <svg width="11" height="13" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
              </span>
              <span class="absolute bottom-2 left-2 font-mono text-[9px] text-white/70">{{ formatLongDuration(track.duration) }}</span>
            </div>
            <p class="mt-2 truncate text-[12px] font-medium text-bone group-hover:text-violet">{{ track.title }}</p>
            <p class="truncate text-[10px] text-moss/60">{{ track.artist }}</p>
          </button>
        </div>
      </section>

      <section class="mt-10">
        <div class="mb-3 flex items-end justify-between">
          <h2 class="a5-display text-xl">Все треки</h2>
          <span class="a5-mono text-[9px] text-moss/50">{{ filtered.length }}</span>
        </div>
        <div class="overflow-hidden rounded-2xl border border-line/80">
          <button
            v-for="(track, index) in filtered"
            :key="track.id"
            type="button"
            class="flex w-full items-center gap-3 border-b border-line/40 px-3 py-2.5 text-left transition last:border-0 hover:bg-panel2/70 sm:px-4"
            @click="play(track.id)"
          >
            <span class="w-5 shrink-0 font-mono text-[10px] text-moss/40">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="h-9 w-9 shrink-0 overflow-hidden rounded-lg" :style="{ background: coverBackground(track.hue) }">
              <img v-if="track.coverUrl" :src="track.coverUrl" alt="" loading="lazy" class="h-full w-full object-cover" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[12px] text-bone">{{ track.title }}</span>
              <span class="block truncate text-[10px] text-moss/60">{{ track.artist }}</span>
            </span>
            <span class="hidden font-mono text-[10px] text-moss/40 sm:block">{{ formatCount(track.views) }} прослуш.</span>
            <span class="font-mono text-[10px] text-moss/50">{{ formatLongDuration(track.duration) }}</span>
          </button>
        </div>
      </section>
    </main>

    <MusicPlayer ref="player" :tracks="data.tracks" :initial-id="data.featuredId" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MusicHubData, MusicShelf, MusicTrack } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import MusicPlayer from './MusicPlayer.vue'
import { coverBackground, formatCount } from '../shared/format'
import { formatLongDuration } from '../shared/upload'

const props = defineProps<{ data: MusicHubData }>()

const player = ref<InstanceType<typeof MusicPlayer> | null>(null)
const query = ref('')

const featured = computed(() => props.data.tracks.find(track => track.id === props.data.featuredId) ?? props.data.tracks[0] ?? null)

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return props.data.tracks
  return props.data.tracks.filter(track =>
    track.title.toLowerCase().includes(needle) ||
    track.artist.toLowerCase().includes(needle) ||
    track.topics.some(topic => topic.label.toLowerCase().includes(needle)),
  )
})

const visibleShelves = computed(() => props.data.shelves)

function shelfTracks(shelf: MusicShelf): MusicTrack[] {
  return shelf.ids
    .map(id => props.data.tracks.find(track => track.id === id))
    .filter((track): track is MusicTrack => Boolean(track))
}

function play(id: string, queue?: string[]) {
  void player.value?.playTrack(id, queue)
}

function playShelf(shelf: MusicShelf) {
  const first = shelf.ids[0]
  if (first) play(first, shelf.ids)
}

function radio() {
  void player.value?.playRadio()
}
</script>
