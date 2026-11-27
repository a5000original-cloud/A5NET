<template>
  <div>
    <header
      class="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur-xl"
    >
      <div
        class="a5-shell flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4"
      >
        <div class="flex items-center gap-6">
          <a
            :href="feedPageRoute.url()"
            class="group flex items-baseline gap-2"
            aria-label="A5NET"
          >
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-sm font-bold text-ink transition group-hover:rotate-3"
              >A5</span
            >
            <span class="a5-display text-lg font-medium tracking-tight"
              >NET</span
            >
            <span class="a5-mono hidden text-[9px] text-moss/60 sm:inline">{{
              activeLabel
            }}</span>
          </a>
          <nav
            class="hidden items-center gap-1 md:flex"
            aria-label="Площадки A5NET"
          >
            <a
              v-for="item in items"
              :key="item.key"
              :href="item.href"
              class="rounded-full px-3 py-2 text-sm transition"
              :class="
                active === item.key ? activePill : 'text-moss hover:text-bone'
              "
              >{{ item.label }}</a
            >
          </nav>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="relative flex h-9 w-9 items-center justify-center rounded-full transition"
            :class="
              dailyAvailable
                ? 'bg-amber/15 text-amber hover:bg-amber/25'
                : 'text-moss hover:text-bone'
            "
            :disabled="!dailyAvailable"
            @click="claimDailyReward"
            title="Ежедневный бонус"
          >
            <span
              v-if="dailyAvailable"
              class="absolute inset-0 rounded-full"
              style="animation: dailyGlow 2s ease-in-out infinite"
            ></span>
            🎁
          </button>
          <NotificationBell />
          <SearchOverlay />
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
            >пульт</a
          >
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-line bg-panel2/70 p-1 pr-2 transition hover:border-lime/40 touch-manipulation"
              aria-label="Меню профиля"
              :aria-expanded="menuOpen"
              @click.stop="toggleMenu"
            >
              <Avatar
                :name="viewer.name"
                :hue="viewer.avatarHue"
                :accent="viewer.avatarAccent"
                :src="viewer.avatarUrl"
                size="sm"
              />
              <span
                class="hidden max-w-[120px] truncate text-xs text-bone/90 sm:block"
                >{{ viewer.name }}</span
              >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                class="text-moss"
              >
                <path
                  d="M2.5 4.5L6 8l3.5-3.5"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <div
              v-if="menuOpen"
              class="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-56"
              @click.self="menuOpen = false"
            >
              <div
                class="absolute inset-0 bg-black/60 sm:hidden"
                @click="menuOpen = false"
              ></div>
              <div
                class="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-panel/95 pt-2 sm:relative sm:rounded-xl sm:border sm:border-line sm:bg-panel sm:pt-0 sm:shadow-lift"
              >
                <div
                  class="mx-auto mb-3 h-1 w-12 rounded-full bg-line/50 sm:hidden"
                ></div>
                <a
                  :href="profilePageRoute.query({ id: viewer.id }).url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Мой профиль</a
                >
                <a
                  :href="profileSettingsRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Настроить профиль</a
                >
                <a
                  :href="notificationsPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Уведомления</a
                >
                <a
                  :href="friendsPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Заявки в друзья</a
                >
                <a
                  :href="shortsPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >A5 Shorts</a
                >
                <a
                  :href="communitiesPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Сообщества</a
                >
                <a
                  :href="inboxPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Сообщения</a
                >
                <a
                  :href="assistantPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >A5000_Менеджер</a
                >
                <a
                  :href="storePageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  ><span class="mr-2">🛒</span>Магазин</a
                >
                <a
                  v-if="showInvites"
                  :href="invitesPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Приглашения</a
                >
                <InstallApp variant="menu" />
                <a
                  v-if="role === 'owner'"
                  :href="securityPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-bone hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Безопасность</a
                >
                <a
                  v-if="role === 'owner'"
                  :href="controlPageRoute.url()"
                  class="block px-4 py-3.5 text-sm text-violet hover:bg-panel2 active:bg-panel2 transition-colors touch-manipulation"
                  @click="menuOpen = false"
                  >Пульт A5000</a
                >
                <div class="a5-divider my-1"></div>
                <button
                  type="button"
                  class="block w-full px-4 py-3.5 text-left text-sm text-bone hover:bg-panel2 hover:text-lime active:bg-panel2 transition-colors touch-manipulation"
                  @click="openAccountSwitcher"
                >
                  <span class="mr-2">🔄</span>Переключить аккаунт
                </button>
                <div class="a5-divider my-1"></div>
                <button
                  type="button"
                  class="block w-full px-4 py-3.5 text-left text-sm text-moss hover:bg-panel2 hover:text-bone active:bg-panel2 transition-colors touch-manipulation"
                  @click="signOut"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-line/50 bg-ink/90 backdrop-blur-2xl md:hidden"
      style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px)"
      aria-label="Площадки"
    >
      <div class="grid grid-cols-5">
        <a
          v-for="item in dockItems"
          :key="item.key"
          :href="item.href"
          class="flex flex-col items-center gap-0.5 py-2 text-[9px] transition active:scale-90 touch-manipulation"
          :class="active === item.key ? item.activeClass : 'text-moss/50'"
        >
          <span v-html="item.icon" class="h-5 w-5"></span>
          <span class="truncate px-0.5">{{ item.label }}</span>
        </a>
      </div>
    </nav>
    <PwaBoot />
    <!-- Account Switcher Modal -->
    <div
      v-if="showAccountSwitcher"
      class="account-switcher-overlay"
      @click="showAccountSwitcher = false"
    >
      <div class="account-switcher-modal" @click.stop>
        <h3 class="text-lg font-semibold text-bone mb-4">Выберите аккаунт</h3>
        <div class="space-y-2">
          <div
            v-for="acc in availableAccounts"
            :key="acc.id"
            class="account-option"
            :class="{ active: acc.id === viewer.id }"
            @click="switchAccount(acc.id)"
          >
            <Avatar
              :name="acc.name"
              :hue="acc.avatarHue"
              :accent="acc.avatarAccent"
              :src="acc.avatarUrl"
              size="sm"
            />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-bone truncate">
                {{ acc.name }}
              </div>
              <div class="text-[10px] text-moss/60">@{{ acc.handle }}</div>
            </div>
            <span
              v-if="acc.id === viewer.id"
              class="text-[10px] text-lime font-medium"
              >Активен</span
            >
          </div>
        </div>
        <button
          type="button"
          class="mt-4 w-full rounded-xl border border-line bg-panel2 px-4 py-3 text-sm text-moss hover:text-bone transition"
          @click="showAccountSwitcher = false"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { AuthorCard } from "../shared/types";
import Avatar from "./Avatar.vue";
import SearchOverlay from "./SearchOverlay.vue";
import NotificationBell from "./NotificationBell.vue";
import PwaBoot from "./PwaBoot.vue";
import InstallApp from "./InstallApp.vue";
import { feedPageRoute } from "../feed";
import { videoHubRoute } from "../video";
import { musicHubRoute } from "../music";
import { invitesPageRoute } from "../invites";
import { controlPageRoute } from "../control";
import { profilePageRoute } from "../profile";
import { profileSettingsRoute } from "../settings";
import { assistantPageRoute } from "../assistant";
import { inboxPageRoute } from "../inbox";
import { securityPageRoute } from "../security";
import { notificationsPageRoute } from "../notifications";
import { friendsPageRoute } from "../friends";
import { shortsPageRoute } from "../shorts";
import { communitiesPageRoute } from "../communities";
import { storePageRoute } from "../store";
import { dailyRewardRoute } from "../api/rewards/daily";
import { switchAccountRoute } from "../api/auth/switch-account";

const props = defineProps<{
  viewer: AuthorCard;
  role: "owner" | "admin" | "member";
  active:
    | "feed"
    | "video"
    | "music"
    | "shorts"
    | "communities"
    | "inbox"
    | "invites"
    | "control"
    | "profile"
    | "manager"
    | "settings"
    | "security"
    | "notifications"
    | "friends"
    | "none";
}>();

const menuOpen = ref(false);
const showAccountSwitcher = ref(false);
const availableAccounts = ref<Array<AuthorCard & { handle: string }>>([]);

const showInvites = computed(
  () => props.role === "owner" || props.role === "admin",
);

const items = computed(() => [
  { key: "feed", label: "Поток", href: feedPageRoute.url() },
  { key: "video", label: "Видео", href: videoHubRoute.url() },
  { key: "music", label: "Музыка", href: musicHubRoute.url() },
  { key: "shorts", label: "Shorts", href: shortsPageRoute.url() },
  { key: "manager", label: "Менеджер", href: assistantPageRoute.url() },
  { key: "inbox", label: "Письма", href: inboxPageRoute.url() },
  { key: "store", label: "Магазин", href: storePageRoute.url() },
]);

const dockItems = computed(() => [
  {
    key: "feed",
    label: "Поток",
    href: feedPageRoute.url(),
    activeClass: "text-lime",
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5h14M3 10h9M3 15h12" stroke-linecap="round"/></svg>',
  },
  {
    key: "video",
    label: "Видео",
    href: videoHubRoute.url(),
    activeClass: "text-ember",
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="4" width="15" height="11" rx="3"/><path d="M8 7.5l4 2.5-4 2.5z" fill="currentColor" stroke="none"/></svg>',
  },
  {
    key: "music",
    label: "Музыка",
    href: musicHubRoute.url(),
    activeClass: "text-violet",
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 14V5l7-1v9" stroke-linecap="round"/><circle cx="6" cy="14" r="2"/><circle cx="13" cy="13" r="2"/></svg>',
  },
  {
    key: "store",
    label: "Магазин",
    href: storePageRoute.url(),
    activeClass: "text-amber",
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="16" height="11" rx="2"/><path d="M6 6V5a4 4 0 018 0v1" stroke-linecap="round"/></svg>',
  },
  {
    key: "profile",
    label: "Профиль",
    href: profilePageRoute.query({ id: props.viewer.id }).url(),
    activeClass: "text-bone",
    icon: '<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="7" r="3"/><path d="M4 17c1-3 3.2-4.5 6-4.5S15 14 16 17" stroke-linecap="round"/></svg>',
  },
]);

const activeLabel = computed(() => {
  const map: Record<string, string> = {
    feed: "поток",
    video: "video",
    music: "audio",
    manager: "manager",
    inbox: "письма",
    profile: "досье",
    settings: "настройки",
    security: "A5 PASS",
    notifications: "события",
    friends: "круг",
    shorts: "shorts",
    communities: "круги",
  };
  return map[props.active] ?? "closed";
});

const activePill = computed(() => {
  if (props.active === "video") return "bg-ember/15 text-ember";
  if (props.active === "music") return "bg-violet/15 text-violet";
  return "bg-panel2 text-bone";
});

const dailyAvailable = ref(false);
const dailyLoading = ref(false);
const dailyToast = ref("");

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

async function openAccountSwitcher() {
  menuOpen.value = false;
  try {
    const result = await switchAccountRoute.query({}).run(ctx);
    if (result.ok) {
      availableAccounts.value = result.accounts;
      showAccountSwitcher.value = true;
    }
  } catch (error) {
    console.error("Failed to load accounts:", error);
  }
}

async function switchAccount(accountId: string) {
  try {
    const result = await switchAccountRoute.run(ctx, { accountId });
    if (result.ok) {
      window.location.reload();
    }
  } catch (error) {
    console.error("Failed to switch account:", error);
  }
}

async function checkDailyReward() {
  try {
    const result = await dailyRewardRoute.run(ctx);
    if (result.ok) {
      dailyAvailable.value = true;
      dailyToast.value = result.reward;
    } else {
      dailyAvailable.value = false;
    }
  } catch {
    dailyAvailable.value = false;
  }
}

async function claimDailyReward() {
  if (dailyLoading.value || !dailyAvailable.value) return;
  dailyLoading.value = true;
  try {
    const result = await dailyRewardRoute.run(ctx);
    if (result.ok) {
      dailyAvailable.value = false;
      dailyToast.value = `+${result.streak} стрик · ${result.reward}`;
      setTimeout(() => {
        dailyToast.value = "";
      }, 4000);
    }
  } catch {
    dailyAvailable.value = false;
  } finally {
    dailyLoading.value = false;
  }
}

checkDailyReward();

async function signOut() {
  try {
    await fetch("/s/auth/sign-out", { method: "POST" });
  } finally {
    window.location.reload();
  }
}
</script>

<style scoped>
@keyframes dailyGlow {
  0%,
  100% {
    box-shadow: 0 0 4px rgba(251, 191, 36, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.7);
    transform: scale(1.08);
  }
}
</style>
