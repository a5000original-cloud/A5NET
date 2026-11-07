<template>
  <header class="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur-xl">
    <div class="a5-shell flex h-16 items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <a :href="feedPageRoute.url()" class="group flex items-baseline gap-2" aria-label="A5NET — лента">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-sm font-bold text-ink transition group-hover:rotate-3">A5</span>
          <span class="a5-display text-lg font-medium tracking-tight">NET</span>
          <span class="a5-mono hidden text-[9px] text-moss/70 sm:inline">closed</span>
        </a>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
          <a
            v-for="item in items"
            :key="item.key"
            :href="item.href"
            class="rounded-full px-3 py-2 text-sm transition"
            :class="active === item.key ? 'bg-panel2 text-bone' : 'text-moss hover:text-bone'"
          >{{ item.label }}</a>
        </nav>
      </div>

      <div class="flex items-center gap-2">
        <a
          v-if="showInvites"
          :href="invitesPageRoute.url()"
          class="a5-pill hidden !text-lime/90 !border-lime/25 hover:!border-lime/60 sm:inline-flex"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
          инвайты
        </a>

        <a
          v-if="role === 'owner'"
          :href="controlPageRoute.url()"
          class="a5-pill hidden !text-violet/90 !border-violet/25 hover:!border-violet/60 sm:inline-flex"
        >
          пульт
        </a>

        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-2 rounded-full border border-line bg-panel2/70 p-1 pr-2 transition hover:border-lime/40"
            aria-label="Меню профиля"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <Avatar :name="viewer.name" :hue="viewer.avatarHue" :accent="viewer.avatarAccent" size="sm" />
            <span class="hidden max-w-[120px] truncate text-xs text-bone/90 sm:block">{{ viewer.name }}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-moss">
              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>

          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-panel shadow-lift"
          >
            <a :href="profilePageRoute.query({ id: viewer.id }).url()" class="block px-4 py-3 text-sm text-bone hover:bg-panel2">Мой профиль</a>
            <a :href="assistantPageRoute.url()" class="block px-4 py-3 text-sm text-bone hover:bg-panel2">A5000_Менеджер</a>
            <a v-if="showInvites" :href="invitesPageRoute.url()" class="block px-4 py-3 text-sm text-bone hover:bg-panel2">Приглашения</a>
            <a v-if="role === 'owner'" :href="controlPageRoute.url()" class="block px-4 py-3 text-sm text-violet hover:bg-panel2">Пульт A5000</a>
            <div class="a5-divider"></div>
            <button type="button" class="block w-full px-4 py-3 text-left text-sm text-moss hover:bg-panel2 hover:text-bone" @click="signOut">
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AuthorCard } from '../shared/types'
import Avatar from './Avatar.vue'
import { feedPageRoute } from '../feed'
import { invitesPageRoute } from '../invites'
import { controlPageRoute } from '../control'
import { profilePageRoute } from '../profile'
import { assistantPageRoute } from '../assistant'

const props = defineProps<{
  viewer: AuthorCard
  role: 'owner' | 'admin' | 'member'
  active: 'feed' | 'invites' | 'control' | 'profile' | 'manager' | 'none'
}>()

const menuOpen = ref(false)
const showInvites = computed(() => props.role === 'owner' || props.role === 'admin')

const items = computed(() => [
  { key: 'feed', label: 'Лента', href: feedPageRoute.url() },
  { key: 'manager', label: 'Менеджер', href: assistantPageRoute.url() },
  { key: 'profile', label: 'Профиль', href: profilePageRoute.query({ id: props.viewer.id }).url() },
])

async function signOut() {
  try {
    await fetch('/s/auth/sign-out', { method: 'POST' })
  } finally {
    window.location.reload()
  }
}
</script>
