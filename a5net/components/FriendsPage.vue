<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="friends" />

    <main class="a5-shell pb-28 pt-8">
      <p class="a5-mono text-lime/80">круг · заявки</p>
      <h1 class="a5-display mt-2 text-4xl font-medium">Круг</h1>
      <p class="mt-2 max-w-xl text-sm text-moss">Заявки приходят по совпадению вкусов и после переноса аудитории. Решай сам, кто войдёт в круг.</p>

      <div class="mt-7 grid gap-6 lg:grid-cols-2">
        <section class="a5-card p-5">
          <div class="flex items-center justify-between">
            <h2 class="a5-display text-lg">Входящие</h2>
            <span class="a5-mono text-[9px] text-moss/50">{{ data.incoming.length }}</span>
          </div>
          <div v-if="data.incoming.length" class="mt-4 space-y-3">
            <div v-for="item in data.incoming" :key="item.profile.id" class="flex items-center gap-3 rounded-xl border border-line/70 p-3">
              <Avatar :name="item.profile.name" :hue="item.profile.avatarHue" :accent="item.profile.avatarAccent" :src="item.profile.avatarUrl" size="sm" />
              <div class="min-w-0 flex-1">
                <a :href="profilePageRoute.query({ id: item.profile.id }).url()" class="block truncate text-[12px] text-bone hover:text-lime">{{ item.profile.name }}</a>
                <p class="text-[10px] text-moss/50">@{{ item.profile.handle }} · {{ item.ago }}</p>
              </div>
              <button type="button" class="a5-btn-primary !px-3 !py-1.5 text-[10px]" :disabled="busy" @click="respond(item.profile.id, true)">Принять</button>
              <button type="button" class="a5-btn-ghost text-[10px]" :disabled="busy" @click="respond(item.profile.id, false)">Нет</button>
            </div>
          </div>
          <p v-else class="mt-4 text-[11px] text-moss/60">Входящих нет. Круг начинается с одного.</p>
        </section>

        <section class="a5-card p-5">
          <div class="flex items-center justify-between">
            <h2 class="a5-display text-lg">Исходящие</h2>
            <span class="a5-mono text-[9px] text-moss/50">{{ data.outgoing.length }}</span>
          </div>
          <div v-if="data.outgoing.length" class="mt-4 space-y-3">
            <div v-for="item in data.outgoing" :key="item.profile.id" class="flex items-center gap-3 rounded-xl border border-line/70 p-3">
              <Avatar :name="item.profile.name" :hue="item.profile.avatarHue" :accent="item.profile.avatarAccent" :src="item.profile.avatarUrl" size="sm" />
              <div class="min-w-0 flex-1">
                <a :href="profilePageRoute.query({ id: item.profile.id }).url()" class="block truncate text-[12px] text-bone hover:text-lime">{{ item.profile.name }}</a>
                <p class="text-[10px] text-moss/50">@{{ item.profile.handle }} · {{ item.ago }}</p>
              </div>
              <span class="a5-pill !text-[8px]">ждём</span>
            </div>
          </div>
          <p v-else class="mt-4 text-[11px] text-moss/60">Ты пока никого не звал.</p>
        </section>
      </div>

      <section class="mt-6 a5-card p-5">
        <div class="flex items-center justify-between">
          <h2 class="a5-display text-lg">В кругу</h2>
          <span class="a5-mono text-[9px] text-moss/50">{{ data.friends.length }}</span>
        </div>
        <div v-if="data.friends.length" class="mt-4 flex flex-wrap gap-3">
          <a v-for="friend in data.friends" :key="friend.id" :href="profilePageRoute.query({ id: friend.id }).url()" class="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 hover:border-lime/40">
            <Avatar :name="friend.name" :hue="friend.avatarHue" :accent="friend.avatarAccent" :src="friend.avatarUrl" size="xs" />
            <span class="text-[11px] text-bone">{{ friend.name }}</span>
          </a>
        </div>
        <p v-else class="mt-3 text-[11px] text-moss/60">Пока пусто. Это нормально.</p>
      </section>

      <p v-if="error" class="mt-4 text-[11px] text-ember">{{ error }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FriendsData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import Avatar from './Avatar.vue'
import { friendRespondRoute } from '../api/friend/respond'
import { profilePageRoute } from '../profile'

const props = defineProps<{ data: FriendsData }>()
const busy = ref(false)
const error = ref('')

async function respond(profileId: string, accept: boolean) {
  busy.value = true
  error.value = ''
  try {
    const result = await friendRespondRoute.run(ctx, { profileId, accept })
    if (!result.ok) {
      error.value = result.error
      return
    }
    window.location.reload()
  } catch {
    error.value = 'Не удалось ответить на заявку.'
  } finally {
    busy.value = false
  }
}
</script>
