<template>
  <div class="a5-video-theme min-h-screen">
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="video" />

    <main class="a5-shell pb-28 pt-5">
      <a :href="videoHubRoute.url()" class="a5-btn-ghost !px-0 text-xs">← Все видео</a>

      <div class="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div class="min-w-0">
          <VideoPlayer
            v-if="data.post.mediaUrl"
            :src="data.post.mediaUrl"
            :title="data.post.title"
            :duration="data.post.durationSec"
            :post-id="data.post.id"
            :cover-url="data.post.coverUrl"
          />

          <h1 class="a5-display mt-5 text-2xl font-medium leading-tight sm:text-3xl">{{ data.post.title }}</h1>

          <div class="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-moss">
            <span>{{ formatCount(data.post.views) }} просмотров</span>
            <span>·</span>
            <span>{{ data.post.ago }}</span>
            <span v-if="data.post.sizeBytes">· {{ formatBytes(data.post.sizeBytes) }}</span>
            <span v-if="data.post.mimeType" class="a5-pill !py-0.5 !text-[8px]">{{ data.post.mimeType.split('/')[1] }}</span>
          </div>

          <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-line/70 py-3">
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="flex items-center gap-2 rounded-full px-3 py-2 text-sm transition hover:bg-panel2"
                :class="reaction === 'like' ? 'text-ember' : 'text-moss hover:text-bone'"
                @click="react('like')"
              >
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 13.5s-5.5-3.2-5.5-7A3.2 3.2 0 018 4.2a3.2 3.2 0 015.5 2.3c0 3.8-5.5 7-5.5 7z" /></svg>
                {{ formatCount(likes) }}
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-full px-3 py-2 text-sm transition hover:bg-panel2"
                :class="reaction === 'dislike' ? 'text-sky' : 'text-moss hover:text-bone'"
                @click="react('dislike')"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 2.5s5.5 3.2 5.5 7A3.2 3.2 0 018 11.8a3.2 3.2 0 01-5.5-2.3c0-3.8 5.5-7 5.5-7z" /></svg>
                {{ formatCount(dislikes) }}
              </button>
              <button type="button" class="a5-btn-ghost text-xs" @click="share">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 8h4M8 2v4M8 10v4" stroke-linecap="round" /><path d="M3 6v7h10V6" stroke-linecap="round" /></svg>
                {{ shared ? 'Ссылка скопирована' : 'Поделиться' }}
              </button>
            </div>
            <a :href="postPageRoute.query({ id: data.post.id }).url()" class="a5-btn-ghost text-xs">Обсуждение в Потоке</a>
          </div>

          <section class="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line/80 bg-panel/60 p-4">
            <a :href="profilePageRoute.query({ id: data.author.id }).url()" class="flex min-w-0 items-center gap-3">
              <Avatar :name="data.author.name" :hue="data.author.avatarHue" :accent="data.author.avatarAccent" :src="data.author.avatarUrl" size="lg" />
              <span class="min-w-0">
                <span class="block truncate text-base font-medium text-bone">{{ data.author.name }}</span>
                <span class="block truncate text-[11px] text-moss">@{{ data.author.handle }} · {{ formatCount(data.author.followersCount) }} подписчиков</span>
                <span class="mt-0.5 block truncate text-[11px] text-moss/60">{{ data.author.tagline || data.author.city }}</span>
              </span>
            </a>
            <div class="flex gap-2">
              <span v-if="data.author.isSelf" class="a5-pill !text-[9px]">твой канал</span>
              <button v-else type="button" class="a5-btn !py-2 text-xs" @click="toggleFollow">
                {{ following ? 'Ты подписан' : 'Подписаться' }}
              </button>
              <a :href="profilePageRoute.query({ id: data.author.id }).url()" class="a5-btn-ghost text-xs">Канал</a>
            </div>
          </section>

          <section class="mt-4 rounded-2xl border border-line/70 bg-coal/60 p-4">
            <p class="text-sm leading-relaxed text-bone/80">{{ data.post.body }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="topic in data.post.topics" :key="topic.id" class="a5-chip">{{ topic.label }}</span>
            </div>
          </section>

          <CommentsBlock
            :post-id="data.post.id"
            :viewer="data.viewer"
            :initial-comments="data.comments"
            :count="data.post.commentsCount"
          />
        </div>

        <aside class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="a5-display text-lg">Следующее</h2>
            <span class="a5-mono text-[9px] text-moss/50">по теме</span>
          </div>
          <a
            v-for="video in data.relatedVideos"
            :key="video.id"
            :href="watchPageRoute.query({ id: video.id }).url()"
            class="group flex gap-3"
          >
            <div class="relative aspect-video w-[150px] shrink-0 overflow-hidden rounded-xl border border-line/70 bg-coal">
              <img
                v-if="posterOf(video)"
                :src="posterOf(video)"
                alt=""
                loading="lazy"
                class="h-full w-full object-cover transition group-hover:scale-105"
              />
              <div v-else class="h-full w-full" :style="{ background: coverBackground(video.coverHue) }"></div>
              <span class="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 font-mono text-[9px] text-white/80">{{ formatLongDuration(video.durationSec) }}</span>
            </div>
            <div class="min-w-0">
              <p class="line-clamp-2 text-[12px] font-medium leading-snug text-bone group-hover:text-ember">{{ video.title }}</p>
              <p class="mt-1 truncate text-[10px] text-moss">{{ video.author.name }}</p>
              <p class="text-[9px] text-moss/50">{{ formatCount(video.views) }} просм. · {{ video.ago }}</p>
            </div>
          </a>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReactionValue, WatchData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import Avatar from './Avatar.vue'
import VideoPlayer from './VideoPlayer.vue'
import CommentsBlock from './CommentsBlock.vue'
import { coverBackground, formatCount, mediaCover } from '../shared/format'
import { formatBytes, formatLongDuration } from '../shared/upload'
import { videoHubRoute } from '../video'
import { watchPageRoute } from '../watch'
import { postPageRoute } from '../post'
import { profilePageRoute } from '../profile'
import { postReactRoute } from '../api/post/react'
import { userFollowRoute } from '../api/user/follow'

const props = defineProps<{ data: WatchData }>()

const likes = ref(props.data.post.likes)
const dislikes = ref(props.data.post.dislikes)
const reaction = ref<ReactionValue | null>(props.data.post.viewerReaction)
const following = ref(props.data.author.isFollowing)
const shared = ref(false)

const author = computed(() => props.data.author)

function posterOf(video: { coverUrl: string | null; mediaUrl: string | null }): string {
  return mediaCover(video.coverUrl, video.mediaUrl)
}

async function react(value: 'like' | 'dislike') {
  const before = { likes: likes.value, dislikes: dislikes.value, reaction: reaction.value }
  if (reaction.value === value) {
    reaction.value = null
    if (value === 'like') likes.value = Math.max(0, likes.value - 1)
    else dislikes.value = Math.max(0, dislikes.value - 1)
  } else {
    if (reaction.value === 'like') likes.value = Math.max(0, likes.value - 1)
    if (reaction.value === 'dislike') dislikes.value = Math.max(0, dislikes.value - 1)
    reaction.value = value
    if (value === 'like') likes.value += 1
    else dislikes.value += 1
  }
  try {
    const result = await postReactRoute.run(ctx, { id: props.data.post.id, value })
    if (!result.ok) {
      likes.value = before.likes
      dislikes.value = before.dislikes
      reaction.value = before.reaction
      return
    }
    likes.value = result.likes
    dislikes.value = result.dislikes
    reaction.value = result.viewerReaction
  } catch {
    likes.value = before.likes
    dislikes.value = before.dislikes
    reaction.value = before.reaction
  }
}

async function toggleFollow() {
  const result = await userFollowRoute.run(ctx, { profileId: author.value.id }).catch(() => null)
  if (result?.ok) following.value = result.following
}

async function share() {
  const url = `${window.location.origin}${watchPageRoute.query({ id: props.data.post.id }).path()}`
  try {
    await navigator.clipboard.writeText(url)
    shared.value = true
    window.setTimeout(() => {
      shared.value = false
    }, 2200)
  } catch {
    shared.value = false
  }
}
</script>
