<template>
  <div>
    <header class="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur-xl">
      <div class="a5-shell flex h-16 items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <a :href="feedPageRoute.url()" class="group flex items-baseline gap-2" aria-label="A5NET">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-sm font-bold text-ink transition group-hover:rotate-3">A5</span>
            <span class="a5-display text-lg font-medium tracking-tight">NET</span>
            <span class="a5-mono hidden text-[9px] text-moss/60 sm:inline">{{ activeLabel }}</span>
          </a>

          <nav class="hidden items-center gap-1 md:flex" aria-label="Площадки A5NET">
            <a
              v-for="item in items"
              :key="item.key"
              :href="item.href"
              class="rounded-full px-3 py-2 text-sm transition"
              :class="active === item.key ? activePill : 'text-moss hover:text-bone'"
            >{{ item.label }}</a>
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <a
            v-if="showInvites"
            :href="invitesPageRoute.url()"
            class="a5-pill hidden !border-lime/25 !text-lime/90 hover:!border-lime/60 sm:inline-flex"
          >
            <span class="a5-live-dot h-1.5 w-1.5 rounded-full bg-lime"></span>
            инвайты
          </a>

          <a
            v-if="role === 'owner'"
            :href="controlPageRoute.url()"
            class="a5-pill hidden !border-violet/25 !text-violet/90 hover:!border-violet/60 sm:inline-flex"
          >пульт</a>

          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-line bg-panel2/70 p-1 pr-2 transition hover:border-lime/40"
              aria-label="Меню профиля"
              :aria-expanded="menuOpen"
              @click="menuOpen = !menuOpen"
            >
              <Avatar :name="viewer.name" :hue="viewer.avatarHue" :accent="viewer.avatarAccent" :src="viewer.avatarUrl" size="sm" />
              <span class="hidden max-w-[120px] truncate text-xs text-bone/90 sm:block">{{ viewer.name }}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-moss">
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>

            <div
              v-if="menuOpen"
              class="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-panel shadow-lift"
            >
              <a :href="profilePageRoute.query({ id: viewer.id }).url()" class="block px-4 py-3 text-sm text-bone hover:bg-panel2">Мой профиль</a>
              <a :href="profileSettingsRoute.url()" class="block px-4 py-3 text-sm text-bone hover:bg-panel2">Настроить профиль</a>
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

    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-ink/95 backdrop-blur-xl md:hidden" aria-label="Площадки">
      <div class="grid grid-cols-4">
        <a
          v-for="item in dockItems"
          :key="item.key"
          :href="item.href"
          class="flex flex-col items-center gap-1 py-2 text-[9px] transition"
          :class="active === item.key ? item.activeClass : 'text-moss/60'"
        >
          <span v-html="item.icon"></span>
          <span>{{ item.label }}</span>
        </a>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AuthorCard } from '../shared/types'
import Avatar from './Avatar.vue'
import { feedPageRoute } from '../feed'
import { videoHubRoute } from '../video'
import { musicHubRoute } from '../music'
import { invitesPageRoute } from '../invites'
import { controlPageRoute } from '../control'
import { profilePageRoute } from '../profile'
import { profileSettingsRoute } from '../settings'
import { assistantPageRoute } from '../assistant'

const props = defineProps<{
  viewer: AuthorCard
  role: 'owner' | 'admin' | 'member'
  active: 'feed' | 'video' | 'music' | 'invites' | 'control' | 'profile' | 'manager' | 'settings' | 'none'
}>()

const menuOpen = ref(false)
const showInvites = computed(() => props.role === 'owner' || props.role === 'admin')

const items = computed(() => [
  { key: 'feed', label: 'Поток', href: feedPageRoute.url() },
  { key: 'video', label: 'Видео', href: videoHubRoute.url() },
  { key: 'music', label: 'Музыка', href: musicHubRoute.url() },
  { key: 'manager', label: 'Менеджер', href: assistantPageRoute.url() },
])

const dockItems = computed(() => [
  {
    key: 'feed',
    label: 'Поток',
    href: feedPageRoute.url(),
    activeClass: 'text-lime',
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5h14M3 10h9M3 15h12" stroke-linecap="round"/></svg>',
  },
  {
    key: 'video',
    label: 'Видео',
    href: videoHubRoute.url(),
    activeClass: 'text-ember',
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="4" width="15" height="11" rx="3"/><path d="M8 7.5l4 2.5-4 2.5z" fill="currentColor" stroke="none"/></svg>',
  },
  {
    key: 'music',
    label: 'Музыка',
    href: musicHubRoute.url(),
    activeClass: 'text-violet',
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 14V5l7-1v9" stroke-linecap="round"/><circle cx="6" cy="14" r="2"/><circle cx="13" cy="13" r="2"/></svg>',
  },
  {
    key: 'profile',
    label: 'Профиль',
    href: profilePageRoute.query({ id: props.viewer.id }).url(),
    activeClass: 'text-bone',
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="7" r="3"/><path d="M4 17c1-3 3.2-4.5 6-4.5S15 14 16 17" stroke-linecap="round"/></svg>',
  },
])

const activeLabel = computed(() => {
  const map: Record<string, string> = { feed: 'поток', video: 'video', music: 'audio', manager: 'manager', profile: 'досье', settings: 'настройки' }
  return map[props.active] ?? 'closed'
})

const activePill = computed(() => {
  if (props.active === 'video') return 'bg-ember/15 text-ember'
  if (props.active === 'music') return 'bg-violet/15 text-violet'
  return 'bg-panel2 text-bone'
})

async function signOut() {
  try {
    await fetch('/s/auth/sign-out', { method: 'POST' })
  } finally {
    window.location.reload()
  }
}
</script>
