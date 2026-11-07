<template>
  <a :href="watchPageRoute.query({ id: post.id }).url()" class="group block">
    <div class="relative aspect-video overflow-hidden rounded-2xl border border-line/80 bg-coal">
      <img v-if="poster" :src="poster" :alt="post.title" loading="lazy" decoding="async" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      <div v-else class="h-full w-full" :style="{ background: coverBackground(post.coverHue) }"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80"></div>
      <span class="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white/85">{{ formatLongDuration(post.durationSec) }}</span>
      <span class="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 a5-mono text-[8px] text-white/60 backdrop-blur">{{ kindLabel }}</span>
      <span class="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-lime/90 text-ink">
          <svg width="15" height="17" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z" /></svg>
        </span>
      </span>
      <div v-if="progress !== undefined" class="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
        <div class="h-full bg-ember" :style="{ width: Math.min(100, Math.max(0, progress * 100)) + '%' }"></div>
      </div>
    </div>
    <div class="mt-3 flex gap-3">
      <Avatar :name="post.author.name" :hue="post.author.avatarHue" :accent="post.author.avatarAccent" :src="post.author.avatarUrl" size="sm" class="mt-0.5" />
      <div class="min-w-0">
        <h3 class="line-clamp-2 text-sm font-medium leading-snug text-bone group-hover:text-ember">{{ post.title }}</h3>
        <p class="mt-1 truncate text-[11px] text-moss">{{ post.author.name }}</p>
        <p class="text-[10px] text-moss/60">{{ formatCount(post.views) }} просмотров · {{ post.ago }}</p>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PostCard } from '../shared/types'
import Avatar from './Avatar.vue'
import { coverBackground, formatCount, mediaCover } from '../shared/format'
import { formatLongDuration } from '../shared/upload'
import { watchPageRoute } from '../watch'

const props = defineProps<{ post: PostCard; progress?: number }>()

const poster = computed(() => mediaCover(props.post.coverUrl, props.post.mediaUrl))
const kindLabel = computed(() => (props.post.durationSec > 600 ? 'длинный метр' : props.post.kind === 'video' ? 'видеоэтюд' : 'видео'))
</script>
