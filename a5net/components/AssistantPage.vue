<template>
  <div class="min-h-screen">
    <SiteHeader :viewer="viewer" :role="role" active="manager" />

    <main class="a5-shell pb-16 pt-8">
      <section class="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="a5-mono text-lime/80">A5NET · поддержка</p>
          <h1 class="a5-display mt-3 text-3xl font-medium leading-tight sm:text-4xl">A5000_Менеджер</h1>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-moss">
            Цифровой помощник по платформе: вход и аккаунт, инвайты, профиль, публикации, жалобы и ошибки.
            Это не A5000 и не его личные сообщения — только помощь по вопросам A5NET.
          </p>
        </div>
        <span class="a5-pill shrink-0 !text-lime/90 !border-lime/25">
          <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
          помощник на связи
        </span>
      </section>

      <ManagerChat
        v-if="agentId && agentToken"
        :agent-id="agentId"
        :agent-token="agentToken"
        :transport-key="transportKey"
      />

      <section v-else class="a5-card a5-grain p-8 text-center sm:p-12">
        <p class="a5-mono text-lime/80">A5NET · поддержка</p>
        <h2 class="a5-display mt-3 text-2xl font-medium">Помощник ещё настраивается</h2>
        <p class="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-moss">
          Страница уже готова, но агент пока не опубликован. Загляните чуть позже — или напишите A5000,
          если вопрос срочный.
        </p>
      </section>

      <p class="mt-4 text-center text-[11px] leading-relaxed text-moss/60">
        Не отправляйте пароли, коды из SMS и письма, данные карты или паспорта. Помощник никогда их не спрашивает.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import SiteHeader from './SiteHeader.vue'
import ManagerChat from './ManagerChat.vue'
import type { AuthorCard } from '../shared/types'

defineProps<{
  agentId: string
  agentToken: string
  transportKey: string
  viewer: AuthorCard
  role: 'owner' | 'admin' | 'member'
}>()
</script>
