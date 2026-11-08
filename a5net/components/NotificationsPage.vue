<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="notifications" />

    <main class="a5-shell pb-28 pt-8">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p class="a5-mono text-lime/80">связь · события</p>
          <h1 class="a5-display mt-2 text-4xl font-medium">Уведомления</h1>
        </div>
        <div class="flex gap-1.5">
          <button v-for="option in filters" :key="option.id" type="button" class="a5-chip" :class="filter === option.id ? 'a5-chip-active' : ''" @click="filter = option.id">{{ option.label }}</button>
        </div>
      </div>

      <section class="mt-7 overflow-hidden rounded-2xl border border-line/80">
        <article
          v-for="item in visible"
          :key="item.id"
          class="flex items-start gap-3 border-b border-line/40 px-4 py-4 last:border-0"
          :class="!item.read ? 'bg-panel2/40' : ''"
        >
          <a :href="profilePageRoute.query({ id: item.actor.id }).url()">
            <Avatar :name="item.actor.name" :hue="item.actor.avatarHue" :accent="item.actor.avatarAccent" :src="item.actor.avatarUrl" size="sm" />
          </a>
          <div class="min-w-0 flex-1">
            <p class="text-[12px] leading-relaxed text-bone">
              <a :href="profilePageRoute.query({ id: item.actor.id }).url()" class="font-medium hover:text-lime">{{ item.actor.name }}</a>
              <span class="text-moss"> {{ item.text }}</span>
            </p>
            <div class="mt-1 flex items-center gap-2">
              <span class="font-mono text-[9px] text-moss/40">{{ item.ago }}</span>
              <a v-if="linkFor(item)" :href="linkFor(item)" class="text-[10px] text-lime/70 underline decoration-line hover:text-lime">открыть</a>
            </div>
          </div>
          <span v-if="!item.read" class="mt-2 h-2 w-2 rounded-full bg-lime"></span>
        </article>
        <p v-if="!visible.length" class="p-10 text-center text-[11px] text-moss/60">Пока тихо. Здесь появятся ответы, лайки и заявки.</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { NotificationItem, NotificationsData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import Avatar from './Avatar.vue'
import { notificationReadRoute } from '../api/notification/read'
import { profilePageRoute } from '../profile'
import { postPageRoute } from '../post'
import { watchPageRoute } from '../watch'
import { friendsPageRoute } from '../friends'

const props = defineProps<{ data: NotificationsData }>()

const filter = ref<'all' | 'reply' | 'friends' | 'important'>('all')
const filters = [
  { id: 'all' as const, label: 'все' },
  { id: 'reply' as const, label: 'ответы' },
  { id: 'friends' as const, label: 'заявки' },
  { id: 'important' as const, label: 'важное' },
]

const visible = computed(() => {
  if (filter.value === 'all') return props.data.items
  if (filter.value === 'reply') return props.data.items.filter(item => item.type === 'reply' || item.type === 'comment')
  if (filter.value === 'friends') return props.data.items.filter(item => item.type === 'friend_request' || item.type === 'friend_accept')
  return props.data.items.filter(item => ['reply', 'mention', 'friend_request', 'subscriber'].includes(item.type))
})

function linkFor(item: NotificationItem): string {
  if (item.type === 'friend_request' || item.type === 'friend_accept') return friendsPageRoute.url()
  if (item.postId && item.commentId) return `${postPageRoute.query({ id: item.postId }).url()}#comments`
  if (item.postId) return postPageRoute.query({ id: item.postId }).url()
  return ''
}

onMounted(() => {
  void notificationReadRoute.run(ctx).catch(() => undefined)
})

void watchPageRoute
</script>
