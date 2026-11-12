<template>
  <div>
    <SiteHeader
      :viewer="data.viewer"
      :role="data.viewerRole"
      active="profile"
    />

    <main class="a5-shell pb-24">
      <section
        class="relative mt-6 overflow-hidden rounded-3xl border"
        :style="{ borderColor: `hsla(${profile.accentHue}, 55%, 55%, 0.35)` }"
      >
        <div class="relative h-44 w-full sm:h-60">
          <img
            v-if="profile.coverUrl"
            :src="profile.coverUrl"
            alt=""
            class="h-full w-full object-cover"
            :style="{ objectPosition: `50% ${profile.coverPosition}%` }"
          />
          <div
            v-else
            class="h-full w-full"
            :style="{ background: coverBackground(profile.avatarHue) }"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent"
          ></div>
          <StickerLayer
            :stickers="profile.stickers"
            :layout="profile.stickerLayout"
          />
          <span class="absolute right-4 top-4 a5-mono text-[8px] text-white/50"
            >{{ profile.profileTheme }} · A5NET</span
          >
        </div>

        <div class="relative px-5 pb-6 sm:px-8">
          <div
            class="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between"
          >
            <div class="flex items-end gap-4">
              <Avatar
                :name="profile.name"
                :hue="profile.avatarHue"
                :accent="profile.accentHue"
                :src="profile.avatarUrl"
                size="xl"
                class="ring-4 ring-ink"
              />
              <div class="pb-1">
                <h1 class="a5-display text-2xl font-medium sm:text-3xl">
                  {{ profile.name }}
                </h1>
                <p class="text-[11px] text-moss">
                  @{{ profile.handle }} · {{ profile.city
                  }}<span v-if="profile.age"> · {{ profile.age }}</span>
                </p>
                <p v-if="profile.tagline" class="mt-1 text-[12px] text-bone/70">
                  {{ profile.tagline }}
                </p>
              </div>
            </div>

            <div v-if="!profile.isSelf" class="flex flex-wrap gap-2">
              <a
                :href="inboxPageRoute.query({ peer: profile.id }).url()"
                class="a5-btn !py-2 text-xs"
                >Написать</a
              >
              <button
                type="button"
                class="a5-btn !py-2 text-xs"
                @click="toggleFollow"
              >
                {{ following ? "Ты читаешь" : "Читать" }}
              </button>
              <button
                v-if="friendState === 'incoming'"
                type="button"
                class="a5-btn-primary !py-2 text-xs"
                :disabled="busy"
                @click="acceptFriend"
              >
                Принять заявку
              </button>
              <button
                v-else
                type="button"
                class="a5-btn !py-2 text-xs"
                :disabled="friendState !== 'none' || busy"
                @click="addFriend"
              >
                {{ friendLabel }}
              </button>
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <a
                v-if="profile.canEdit"
                :href="profileSettingsRoute.url()"
                class="a5-btn-primary !py-2 text-xs"
                >Настроить профиль</a
              >
              <a
                v-if="profile.canEdit || data.viewerRole === 'owner'"
                :href="analyticsPageRoute.query({ id: profile.id }).url()"
                class="a5-btn !py-2 text-xs"
                >Статистика</a
              >
              <a
                v-if="data.viewerRole === 'owner'"
                :href="controlPageRoute.url()"
                class="a5-btn !py-2 text-xs"
                >Пульт A5000</a
              >
              <a
                v-if="
                  data.viewerRole === 'owner' || data.viewerRole === 'admin'
                "
                :href="invitesPageRoute.url()"
                class="a5-btn !py-2 text-xs"
                >Инвайты</a
              >
            </div>
          </div>

          <p class="mt-5 max-w-2xl text-sm leading-relaxed text-bone/85">
            {{ profile.bio }}
          </p>

          <div v-if="profile.links.length" class="mt-3 flex flex-wrap gap-3">
            <a
              v-for="link in profile.links"
              :key="link"
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              class="a5-mono text-[9px] text-moss/60 underline decoration-line hover:text-lime"
            >
              {{ linkHost(link) }}
            </a>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-1.5">
            <span
              v-for="interest in profile.interests"
              :key="interest.id"
              class="a5-chip"
              :style="{ borderColor: `hsla(${interest.hue}, 55%, 55%, 0.35)` }"
            >
              {{ interest.label }}
            </span>
            <span class="a5-pill !text-[9px]">{{ chronotypeLabel }}</span>
          </div>

          <p
            v-if="profile.externalSubscribers"
            class="mt-3 a5-mono text-[9px] text-sky/70"
          >
            перенесено
            {{ formatCount(profile.externalSubscribers) }} подписчиков ·
            {{ profile.subscriberSource }}
          </p>

          <div
            class="mt-6 grid max-w-md grid-cols-3 gap-3 border-t border-line/70 pt-5"
          >
            <div>
              <p class="a5-display text-xl">{{ profile.postsCount }}</p>
              <p class="text-[10px] uppercase tracking-wider text-moss">
                {{ plural(profile.postsCount, "пост", "поста", "постов") }}
              </p>
            </div>
            <div>
              <p class="a5-display text-xl">{{ profile.friendsCount }}</p>
              <p class="text-[10px] uppercase tracking-wider text-moss">
                {{ plural(profile.friendsCount, "друг", "друга", "друзей") }}
              </p>
            </div>
            <div>
              <p class="a5-display text-xl">{{ profile.followersCount }}</p>
              <p class="text-[10px] uppercase tracking-wider text-moss">
                {{
                  plural(profile.followersCount, "читает", "читают", "читают")
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div
        class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
      >
        <section>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="a5-display text-xl">Публикации</h2>
            <span class="a5-mono text-[9px] text-moss/60">{{
              data.posts.length
            }}</span>
          </div>
          <div v-if="data.posts.length" class="space-y-4">
            <div v-for="post in orderedPosts" :key="post.id">
              <p
                v-if="post.id === profile.pinnedPostId"
                class="a5-mono mb-2 text-[9px] text-lime/70"
              >
                закреплено
              </p>
              <PostCard :post="post" />
            </div>
          </div>
          <p
            v-else
            class="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-moss"
          >
            Досье открыто. Артефактов пока нет.
          </p>
        </section>

        <aside class="space-y-4">
          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">круг</p>
            <ul v-if="data.friends.length" class="mt-4 grid grid-cols-2 gap-3">
              <li v-for="friend in data.friends" :key="friend.id">
                <a
                  :href="profilePageRoute.query({ id: friend.id }).url()"
                  class="flex items-center gap-2"
                >
                  <Avatar
                    :name="friend.name"
                    :hue="friend.avatarHue"
                    :accent="friend.avatarAccent"
                    :src="friend.avatarUrl"
                    size="xs"
                  />
                  <span
                    class="min-w-0 truncate text-[11px] text-bone/80 hover:text-lime"
                    >{{ friend.name }}</span
                  >
                </a>
              </li>
            </ul>
            <p v-else class="mt-3 text-[11px] text-moss/70">
              Круг пуст. Связка начинается с одного.
            </p>
          </section>

          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">в сети</p>
            <p class="mt-2 text-sm leading-relaxed text-moss">
              {{
                profile.isSelf
                  ? "Это твой профиль. Его видят только участники A5NET."
                  : "Профиль виден только участникам по приглашению."
              }}
            </p>
          </section>
        </aside>
      </div>

      <section v-if="data.collabs.length" class="mt-10">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="a5-display text-xl">Связки</h2>
          <span class="a5-mono text-[9px] text-moss/60">{{
            data.collabs.length
          }}</span>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <CollabCard
            v-for="collab in data.collabs"
            :key="collab.id"
            :collab="collab"
          />
        </div>
      </section>

      <section class="mt-10">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="a5-display text-xl">Коллекция</h2>
          <span class="a5-mono text-[9px] text-moss/60">премиум-предметы</span>
        </div>
        <PremiumGallery :profile-id="profile.id" />
      </section>

      <p
        v-if="error"
        class="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-3 py-2 text-xs text-ember"
      >
        {{ error }}
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ProfilePageData } from "../shared/types";
import SiteHeader from "./SiteHeader.vue";
import Avatar from "./Avatar.vue";
import StickerLayer from "./StickerLayer.vue";
import PostCard from "./PostCard.vue";
import CollabCard from "./CollabCard.vue";
import PremiumGallery from "./PremiumGallery.vue";
import { coverBackground, formatCount, plural } from "../shared/format";
import { profilePageRoute } from "../profile";
import { controlPageRoute } from "../control";
import { invitesPageRoute } from "../invites";
import { profileSettingsRoute } from "../settings";
import { analyticsPageRoute } from "../analytics";
import { inboxPageRoute } from "../inbox";
import { userFollowRoute } from "../api/user/follow";
import { friendRequestRoute } from "../api/friend/request";
import { friendRespondRoute } from "../api/friend/respond";

const props = defineProps<{ data: ProfilePageData }>();

const profile = props.data.profile;
const following = ref(profile.isFollowing);
const friendState = ref<"none" | "pending" | "friend" | "incoming">(
  profile.isFriend
    ? "friend"
    : props.data.incomingRequest
      ? "incoming"
      : profile.requestPending
        ? "pending"
        : "none",
);
const busy = ref(false);
const error = ref("");

const orderedPosts = computed(() => {
  const list = [...props.data.posts];
  if (!profile.pinnedPostId) return list;
  const index = list.findIndex((post) => post.id === profile.pinnedPostId);
  if (index > 0) {
    const [pinned] = list.splice(index, 1);
    if (pinned) list.unshift(pinned);
  }
  return list;
});

function linkHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const chronotypeLabel = computed(() => {
  if (profile.chronotype === "lark") return "жаворонок";
  if (profile.chronotype === "nightowl") return "сова";
  return "ровный ритм";
});

const friendLabel = computed(() => {
  if (friendState.value === "friend") return "В друзьях";
  if (friendState.value === "pending") return "Заявка отправлена";
  if (friendState.value === "incoming") return "Принять заявку";
  return "В друзья";
});

async function toggleFollow() {
  error.value = "";
  try {
    const result = await userFollowRoute.run(ctx, { profileId: profile.id });
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    following.value = result.following;
  } catch {
    error.value = "Не удалось изменить подписку.";
  }
}

async function addFriend() {
  if (friendState.value !== "none") return;
  busy.value = true;
  error.value = "";
  try {
    const result = await friendRequestRoute.run(ctx, { profileId: profile.id });
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    friendState.value = "pending";
  } catch {
    error.value = "Заявка не отправилась.";
  } finally {
    busy.value = false;
  }
}

async function acceptFriend() {
  busy.value = true;
  error.value = "";
  try {
    const result = await friendRespondRoute.run(ctx, {
      profileId: profile.id,
      accept: true,
    });
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    friendState.value = "friend";
  } catch {
    error.value = "Не удалось принять заявку.";
  } finally {
    busy.value = false;
  }
}
</script>
