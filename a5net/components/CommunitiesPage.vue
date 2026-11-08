<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="communities" />

    <main class="a5-shell pb-28 pt-8">
      <p class="a5-mono text-lime/80">сеть · круги</p>
      <h1 class="a5-display mt-2 text-4xl font-medium">Сообщества</h1>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-moss">Не общий поток, а комнаты по интересам. Входи, читай, возвращайся. У каждого круга свой характер и свои люди.</p>

      <div class="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="item in items" :key="item.id" class="a5-card a5-card-hover overflow-hidden">
          <div class="relative h-24" :style="{ background: `linear-gradient(135deg, hsla(${item.coverHue}, 55%, 38%, 0.9), hsla(${item.coverHue + 40}, 55%, 18%, 0.95))` }">
            <div class="absolute inset-0 a5-grain opacity-40"></div>
            <p class="absolute bottom-3 left-4 a5-display text-xl text-white">{{ item.name }}</p>
            <span class="absolute right-3 top-3 a5-mono text-[8px] text-white/60">{{ item.posts }} постов</span>
          </div>
          <div class="p-4">
            <p class="line-clamp-2 text-[11px] leading-relaxed text-moss">{{ item.description }}</p>
            <div class="mt-3 flex items-center justify-between text-[9px] text-moss/50">
              <span>{{ item.members }} участников</span>
              <span>круг</span>
            </div>
            <a v-if="item.latestPostId" :href="postPageRoute.query({ id: item.latestPostId }).url()" class="mt-3 block truncate rounded-lg border border-line/60 px-2.5 py-2 text-[10px] text-bone/80 hover:border-lime/30">
              {{ item.latestTitle }}
            </a>
            <button type="button" class="mt-3 w-full rounded-full border px-3 py-2 text-[10px] transition" :class="item.joined ? 'border-lime/30 bg-lime/10 text-lime' : 'border-line text-moss hover:border-lime/40 hover:text-lime'" :disabled="busy" @click="join(item)">
              {{ item.joined ? 'Ты в круге' : 'Войти в круг' }}
            </button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CommunitiesData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import { communityJoinRoute } from '../api/community/join'
import { postPageRoute } from '../post'

const props = defineProps<{ data: CommunitiesData }>()
const items = ref(props.data.items.map(item => ({ ...item })))
const busy = ref(false)

async function join(item: typeof items.value[number]) {
  busy.value = true
  try {
    const result = await communityJoinRoute.run(ctx, { id: item.id })
    if (result.ok) {
      item.joined = !item.joined
      item.members += item.joined ? 1 : -1
    }
  } finally {
    busy.value = false
  }
}
</script>
