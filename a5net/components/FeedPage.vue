<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="feed" />

    <main class="a5-shell pb-24 pt-8">
      <section class="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p class="a5-mono text-lime/80">закрытая сеть · лента</p>
          <h1 class="a5-display mt-3 text-4xl font-medium leading-[1.05] sm:text-5xl">
            Что происходит<br /><span class="text-moss">в A5NET</span>
          </h1>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 rounded-full border border-line bg-panel2/60 px-3 py-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
            <span class="a5-mono text-[9px] text-moss">{{ totalMembers }} {{ plural(totalMembers, 'участник', 'участника', 'участников') }}</span>
          </div>
          <button type="button" class="a5-btn-primary" @click="composing = !composing">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3v10M3 8h10" stroke-linecap="round" /></svg>
            {{ composing ? 'Закрыть' : 'Написать' }}
          </button>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0">
          <Composer
            v-if="composing"
            :viewer="data.viewer"
            :topic-options="data.topicOptions"
            class="mb-6"
            @close="composing = false"
          />

          <div class="mb-5 flex flex-wrap items-center gap-1 border-b border-line/70 pb-3">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="rounded-full px-3 py-1.5 text-xs font-medium transition"
              :class="activeTab === tab.key ? 'bg-panel2 text-bone' : 'text-moss hover:text-bone'"
              @click="activeTab = tab.key"
            >{{ tab.label }}</button>

            <button
              v-if="topicFilter"
              type="button"
              class="ml-auto inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-lime/10 px-2.5 py-1 text-[11px] text-lime"
              @click="topicFilter = ''"
            >
              {{ topicLabel }}
              <span class="text-lime/70">×</span>
            </button>
          </div>

          <div v-if="activeTab === 'collab'" class="grid gap-4 sm:grid-cols-2">
            <CollabCard v-for="collab in visibleCollabs" :key="collab.id" :collab="collab" />
            <p v-if="!visibleCollabs.length" class="col-span-full rounded-2xl border border-dashed border-line p-8 text-center text-sm text-moss">
              Пока ни одной открытой коллаборации. Это шанс придумать первую.
            </p>
          </div>

          <div v-else-if="visiblePosts.length" class="space-y-4">
            <PostCard v-for="post in visiblePosts" :key="post.id" :post="post" />
            <div class="pt-2 text-center">
              <button v-if="hasMore" type="button" class="a5-btn" :disabled="loading" @click="loadMore">
                {{ loading ? 'Загружаю…' : 'Показать ещё' }}
              </button>
              <p v-else class="a5-mono text-[9px] text-moss/50">конец ленты · дальше только тишина</p>
            </div>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-line p-10 text-center">
            <p class="a5-display text-lg text-bone">Здесь пока тихо</p>
            <p class="mx-auto mt-2 max-w-sm text-sm text-moss">
              {{ data.viewerRole === 'owner' ? 'Флот ещё не посеян. Открой пульт и запусти A5NET.' : 'Ни одного поста по этому фильтру. Попробуй другую тему.' }}
            </p>
            <a v-if="data.viewerRole === 'owner'" :href="controlPageRoute.url()" class="a5-btn-primary mt-5 inline-flex">Открыть пульт</a>
          </div>
        </div>

        <aside class="space-y-4">
          <section class="a5-card p-5">
            <div class="flex items-center justify-between">
              <p class="a5-mono text-[9px] text-moss">пульс сети</p>
              <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p class="a5-display text-2xl">{{ formatCount(data.stats.posts) }}</p>
                <p class="text-[11px] text-moss">публикаций</p>
              </div>
              <div>
                <p class="a5-display text-2xl">{{ formatCount(data.stats.comments) }}</p>
                <p class="text-[11px] text-moss">комментариев</p>
              </div>
              <div>
                <p class="a5-display text-2xl">{{ data.stats.hoursWatched }}</p>
                <p class="text-[11px] text-moss">часов просмотра</p>
              </div>
              <div>
                <p class="a5-display text-2xl">{{ data.stats.collabs }}</p>
                <p class="text-[11px] text-moss">коллабораций</p>
              </div>
            </div>
          </section>

          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">сейчас обсуждают</p>
            <ul class="mt-4 space-y-2.5">
              <li v-for="trend in data.trends" :key="trend.topic.id">
                <button type="button" class="group flex w-full items-center justify-between gap-2 text-left" @click="filterTopic(trend.topic.id)">
                  <span class="flex min-w-0 items-center gap-2">
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: `hsl(${trend.topic.hue} 70% 62%)` }"></span>
                    <span class="truncate text-sm text-bone/90 group-hover:text-lime">{{ trend.topic.label }}</span>
                  </span>
                  <span class="font-mono text-[10px] text-moss/60">{{ trend.posts }}</span>
                </button>
              </li>
            </ul>
          </section>

          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">кого добавить</p>
            <ul class="mt-4 space-y-3">
              <li v-for="person in data.suggestions" :key="person.id" class="flex items-center gap-3">
                <a :href="profilePageRoute.query({ id: person.id }).url()">
                  <Avatar :name="person.name" :hue="person.avatarHue" :accent="person.avatarAccent" size="sm" />
                </a>
                <div class="min-w-0 flex-1">
                  <a :href="profilePageRoute.query({ id: person.id }).url()" class="block truncate text-sm text-bone hover:text-lime">{{ person.name }}</a>
                  <p class="truncate text-[11px] text-moss">{{ person.city }}</p>
                </div>
                <button
                  type="button"
                  class="rounded-full border px-2.5 py-1 text-[10px] transition"
                  :class="followed.includes(person.id) ? 'border-lime/30 text-lime' : 'border-line text-moss hover:border-lime/50 hover:text-lime'"
                  :disabled="followed.includes(person.id)"
                  @click="follow(person.id)"
                >{{ followed.includes(person.id) ? 'подписан' : 'читать' }}</button>
              </li>
            </ul>
            <p v-if="!data.suggestions.length" class="mt-3 text-[11px] text-moss/70">Пока некого добавить. Загляни в коллаборации.</p>
          </section>

          <section v-if="data.viewerRole === 'owner' || data.viewerRole === 'admin'" class="a5-card border-lime/20 p-5">
            <p class="a5-mono text-[9px] text-lime/80">инвайты</p>
            <p class="mt-2 text-sm text-bone">Сеть растёт медленно и только по приглашениям.</p>
            <a :href="invitesPageRoute.url()" class="a5-btn mt-4 w-full">Создать код</a>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FeedData, PostCard as PostCardData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import PostCard from './PostCard.vue'
import Composer from './Composer.vue'
import CollabCard from './CollabCard.vue'
import Avatar from './Avatar.vue'
import { formatCount, plural } from '../shared/format'
import { feedListRoute } from '../api/feed/list'
import { userFollowRoute } from '../api/user/follow'
import { controlPageRoute } from '../control'
import { invitesPageRoute } from '../invites'
import { profilePageRoute } from '../profile'

const props = defineProps<{ data: FeedData }>()

const tabs = [
  { key: 'all', label: 'Всё' },
  { key: 'video', label: 'Видео' },
  { key: 'music', label: 'Музыка' },
  { key: 'text', label: 'Тексты' },
  { key: 'collab', label: 'Коллаборации' },
]

const activeTab = ref('all')
const topicFilter = ref('')
const composing = ref(false)
const items = ref<PostCardData[]>(props.data.items)
const hasMore = ref(props.data.hasMore)
const loading = ref(false)
const followed = ref<string[]>([])

const totalMembers = computed(() => props.data.stats.humans + props.data.stats.bots)

const visiblePosts = computed(() => {
  let list = items.value
  if (activeTab.value !== 'all') list = list.filter(post => post.kind === activeTab.value)
  if (topicFilter.value) list = list.filter(post => post.topics.some(topic => topic.id === topicFilter.value))
  return list
})

const visibleCollabs = computed(() => props.data.collabs)

const topicLabel = computed(() => {
  const found = props.data.trends.find(trend => trend.topic.id === topicFilter.value)
  return found?.topic.label ?? topicFilter.value
})

function filterTopic(id: string) {
  topicFilter.value = topicFilter.value === id ? '' : id
  activeTab.value = 'all'
}

async function loadMore() {
  if (loading.value) return
  loading.value = true
  try {
    const result = await feedListRoute.query({ offset: items.value.length }).run(ctx)
    if (result.ok) {
      items.value = [...items.value, ...result.data.items]
      hasMore.value = result.data.hasMore
    }
  } catch {
    // keep the current feed on network failure
  } finally {
    loading.value = false
  }
}

async function follow(id: string) {
  try {
    const result = await userFollowRoute.run(ctx, { profileId: id })
    if (result.ok && result.following) followed.value = [...followed.value, id]
  } catch {
    // silent: the button stays in its previous state
  }
}

</script>
