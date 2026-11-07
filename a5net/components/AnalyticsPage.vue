<template>
  <div>
    <SiteHeader :viewer="data.profile" role="member" active="profile" />

    <main class="a5-shell pb-28 pt-8">
      <a :href="profilePageRoute.query({ id: data.profile.id }).url()" class="a5-btn-ghost !px-0 text-xs">← К профилю</a>

      <div class="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p class="a5-mono text-lime/80">досье · статистика</p>
          <h1 class="a5-display mt-2 text-4xl font-medium">{{ data.profile.name }}</h1>
          <p class="mt-1 text-[11px] text-moss">@{{ data.profile.handle }} · только владелец профиля видит эти цифры</p>
        </div>
        <div class="flex gap-6">
          <div>
            <p class="a5-display text-2xl">{{ data.hitRate }}%</p>
            <p class="a5-mono text-[8px] text-moss">попаданий</p>
          </div>
          <div>
            <p class="a5-display text-2xl">{{ formatCount(data.totals.followers) }}</p>
            <p class="a5-mono text-[8px] text-moss">подписчиков</p>
          </div>
        </div>
      </div>

      <section class="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div v-for="metric in metrics" :key="metric.label" class="a5-card p-4">
          <p class="a5-mono text-[8px] text-moss">{{ metric.label }}</p>
          <p class="a5-display mt-2 text-2xl">{{ metric.value }}</p>
        </div>
      </section>

      <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-5">
          <section class="a5-card p-5">
            <div class="flex items-center justify-between">
              <p class="a5-mono text-[9px] text-moss">просмотры · 7 дней</p>
              <span class="a5-mono text-[9px] text-moss/50">по событиям досмотра</span>
            </div>
            <div class="mt-5 flex h-32 items-end gap-2">
              <div v-for="day in data.daily" :key="day.label" class="flex flex-1 flex-col items-center gap-2">
                <div class="w-full rounded-t bg-lime/70" :style="{ height: Math.max(2, (day.views / maxDaily) * 100) + '%' }"></div>
                <span class="font-mono text-[9px] text-moss/50">{{ day.label }}</span>
              </div>
            </div>
          </section>

          <section class="a5-card overflow-hidden">
            <div class="flex items-center justify-between border-b border-line/70 px-5 py-4">
              <p class="a5-mono text-[9px] text-moss">публикации · попадание в тренд</p>
              <span class="a5-mono text-[9px] text-moss/50">{{ data.posts.length }}</span>
            </div>
            <div v-if="data.posts.length" class="divide-y divide-line/40">
              <a
                v-for="post in data.posts"
                :key="post.id"
                :href="post.kind === 'video' ? watchPageRoute.query({ id: post.id }).url() : postPageRoute.query({ id: post.id }).url()"
                class="flex items-center gap-3 px-4 py-3 transition hover:bg-panel2/60"
              >
                <span class="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line bg-coal">
                  <img v-if="cover(post)" :src="cover(post)" alt="" loading="lazy" class="h-full w-full object-cover" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[12px] text-bone">{{ post.title }}</span>
                  <span class="block text-[10px] text-moss/50">{{ post.ago }} · {{ formatCount(post.views) }} просмотров</span>
                </span>
                <span class="font-mono text-[10px] text-moss/50">{{ formatCount(post.likes) }} ♥</span>
                <span
                  class="rounded-full border px-2 py-0.5 text-[9px]"
                  :class="post.trend === 'hit' ? 'border-lime/30 text-lime' : post.trend === 'miss' ? 'border-ember/30 text-ember' : 'border-line text-moss/60'"
                >{{ post.trend === 'hit' ? 'попал' : post.trend === 'miss' ? 'мимо' : 'ровно' }}</span>
              </a>
            </div>
            <p v-else class="p-8 text-center text-[11px] text-moss/60">Пока нет публикаций для статистики.</p>
          </section>
        </div>

        <aside class="space-y-5">
          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">кто смотрит</p>
            <ul v-if="data.audience.length" class="mt-4 space-y-3">
              <li v-for="item in data.audience" :key="item.author.id" class="flex items-center gap-3">
                <Avatar :name="item.author.name" :hue="item.author.avatarHue" :accent="item.author.avatarAccent" :src="item.author.avatarUrl" size="xs" />
                <a :href="profilePageRoute.query({ id: item.author.id }).url()" class="min-w-0 flex-1 truncate text-[11px] text-bone hover:text-lime">{{ item.author.name }}</a>
                <span class="font-mono text-[9px] text-moss/50">{{ item.views }}</span>
              </li>
            </ul>
            <p v-else class="mt-3 text-[11px] text-moss/60">Пока никто не досмотрел до конца.</p>
          </section>

          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">твои темы</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="topic in data.topTopics" :key="topic.id" class="a5-chip">{{ topic.label }}</span>
            </div>
            <p class="mt-4 text-[10px] leading-relaxed text-moss/50">Попадание считается по просмотрам относительно медианы твоих постов. Это не приговор — это карта.</p>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnalyticsPostRow, ProfileAnalyticsData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import Avatar from './Avatar.vue'
import { formatCount } from '../shared/format'
import { profilePageRoute } from '../profile'
import { postPageRoute } from '../post'
import { watchPageRoute } from '../watch'

const props = defineProps<{ data: ProfileAnalyticsData }>()

const maxDaily = computed(() => Math.max(1, ...props.data.daily.map(day => day.views)))

const metrics = computed(() => [
  { label: 'просмотры', value: formatCount(props.data.totals.views) },
  { label: 'лайки', value: formatCount(props.data.totals.likes) },
  { label: 'комментарии', value: formatCount(props.data.totals.comments) },
  { label: 'часы досмотра', value: props.data.totals.watchHours },
  { label: 'публикации', value: props.data.totals.posts },
  { label: 'подписчики', value: formatCount(props.data.totals.followers) },
])

function cover(post: AnalyticsPostRow): string {
  if (post.coverUrl) return post.coverUrl
  return ''
}
</script>
