<template>
  <div class="min-h-screen">
    <SiteHeader :viewer="viewer" :role="role" active="manager" />

    <main class="a5-shell pb-16 pt-8">
      <section class="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="a5-mono text-lime/80">A5NET · поддержка</p>
          <h1 class="a5-display mt-3 text-3xl font-medium leading-tight sm:text-4xl">A5000_Менеджер</h1>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-moss">
            Бот-помощник по площадке: вход и аккаунт, инвайты, профиль, публикации, жалобы и ошибки.
            Отвечает по правилам A5NET и не заменяет A5000: если ответа нет, подскажет, как связаться с ним лично.
          </p>
        </div>
        <span class="a5-pill shrink-0 !text-lime/90 !border-lime/25">
          <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
          бот на связи
        </span>
      </section>

      <ManagerChat :initial-messages="initialMessages" :initial-suggestions="initialSuggestions" />

      <p class="mt-4 text-center text-[11px] leading-relaxed text-moss/60">
        Не отправляйте пароли, коды из SMS и письма, данные карты или паспорта. Бот никогда их не спрашивает.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import SiteHeader from './SiteHeader.vue'
import ManagerChat from './ManagerChat.vue'
import type { AuthorCard, ManagerMessageView } from '../shared/types'

defineProps<{
  initialMessages: ManagerMessageView[]
  initialSuggestions: string[]
  viewer: AuthorCard
  role: 'owner' | 'admin' | 'member'
}>()
</script>
