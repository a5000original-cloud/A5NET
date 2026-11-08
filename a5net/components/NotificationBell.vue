<template>
  <a :href="notificationsPageRoute.url()" class="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel2/60 text-moss transition hover:border-lime/40 hover:text-bone" aria-label="Уведомления">
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3.5 6.5a4.5 4.5 0 019 0c0 3 1 4 1.5 4.5h-12c.5-.5 1.5-1.5 1.5-4.5z" stroke-linecap="round" /><path d="M6.5 13a1.7 1.7 0 003 0" stroke-linecap="round" /></svg>
    <span v-if="count" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[8px] font-bold text-ink">{{ count > 9 ? '9+' : count }}</span>
  </a>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { notificationUnreadRoute } from '../api/notification/unread'
import { notificationsPageRoute } from '../notifications'

const count = ref(0)
let timer: number | undefined

async function load() {
  try {
    const result = await notificationUnreadRoute.run(ctx)
    if (result.ok) count.value = result.count
  } catch {
    // keep previous count
  }
}

onMounted(() => {
  void load()
  timer = window.setInterval(() => void load(), 60000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>
