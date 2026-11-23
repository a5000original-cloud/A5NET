<template>
  <div class="relative" :class="wide ? 'w-full' : ''">
    <button
      type="button"
      class="flex h-9 items-center gap-2 rounded-full border border-line bg-panel2/60 px-3 text-moss transition hover:border-lime/40 hover:text-bone"
      aria-label="Поиск по A5NET"
      :aria-expanded="open"
      @click="toggle"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5L14 14" stroke-linecap="round" />
      </svg>
      <span class="hidden text-[11px] lg:inline">поиск</span>
    </button>

    <div
      v-if="open"
      class="absolute inset-x-0 top-14 z-50 mx-auto w-full sm:inset-auto sm:right-0 sm:top-11 sm:w-[min(520px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-panel shadow-lift"
    >
      <div class="flex items-center gap-2 border-b border-line/70 px-4 py-3">
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="text-moss"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" stroke-linecap="round" />
        </svg>
        <input
          ref="input"
          v-model="query"
          class="w-full bg-transparent text-sm text-bone outline-none placeholder:text-moss/50"
          placeholder="Имя, @ник, тема или заголовок"
          maxlength="80"
          @input="schedule"
          @keydown.esc="close"
        />
        <button
          type="button"
          class="text-[10px] text-moss/50 hover:text-bone"
          @click="close"
        >
          esc
        </button>
      </div>

      <div class="a5-scroll max-h-[420px] overflow-auto">
        <div v-if="loading" class="p-6 text-center text-[11px] text-moss/60">
          Ищу…
        </div>
        <template v-else>
          <div v-if="profiles.length" class="border-b border-line/60 p-2">
            <p class="a5-mono px-2 py-1 text-[8px] text-moss/50">люди</p>
            <a
              v-for="profile in profiles"
              :key="profile.id"
              :href="profilePageRoute.query({ id: profile.id }).url()"
              class="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-panel2"
              @click="close"
            >
              <Avatar
                :name="profile.name"
                :hue="profile.avatarHue"
                :accent="profile.avatarAccent"
                :src="profile.avatarUrl"
                size="sm"
              />
              <span class="min-w-0">
                <span class="block truncate text-[12px] text-bone">{{
                  profile.name
                }}</span>
                <span class="block truncate text-[10px] text-moss"
                  >@{{ profile.handle }}</span
                >
              </span>
            </a>
          </div>

          <div v-if="posts.length" class="p-2">
            <p class="a5-mono px-2 py-1 text-[8px] text-moss/50">публикации</p>
            <a
              v-for="post in posts"
              :key="post.id"
              :href="
                post.kind === 'video'
                  ? watchPageRoute.query({ id: post.id }).url()
                  : postPageRoute.query({ id: post.id }).url()
              "
              class="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-panel2"
              @click="close"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-coal text-[13px]"
              >
                {{
                  post.kind === "video"
                    ? "▶"
                    : post.kind === "music"
                      ? "♪"
                      : post.kind === "collab"
                        ? "⟡"
                        : "¶"
                }}
              </span>
              <span class="min-w-0">
                <span class="block truncate text-[12px] text-bone">{{
                  post.title
                }}</span>
                <span class="block truncate text-[10px] text-moss"
                  >{{ post.author.name }} · {{ post.ago }}</span
                >
              </span>
            </a>
          </div>

          <p
            v-if="!profiles.length && !posts.length"
            class="p-8 text-center text-[11px] text-moss/60"
          >
            Ничего не нашлось. Попробуй имя, ник или тему.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import type { AuthorCard, PostCard } from "../shared/types";
import Avatar from "./Avatar.vue";
import { searchRoute } from "../api/search";
import { profilePageRoute } from "../profile";
import { postPageRoute } from "../post";
import { watchPageRoute } from "../watch";

const props = withDefaults(defineProps<{ wide?: boolean }>(), { wide: false });

const open = ref(false);
const query = ref("");
const loading = ref(false);
const profiles = ref<AuthorCard[]>([]);
const posts = ref<PostCard[]>([]);
const input = ref<HTMLInputElement | null>(null);
let timer: number | undefined;

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    await nextTick();
    input.value?.focus();
    if (query.value.trim().length >= 2) schedule();
  }
}

function close() {
  open.value = false;
}

function schedule() {
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => void search(), 220);
}

async function search() {
  const value = query.value.trim();
  if (value.length < 2) {
    profiles.value = [];
    posts.value = [];
    return;
  }
  loading.value = true;
  try {
    const result = await searchRoute.query({ q: value }).run(ctx);
    if (result.ok) {
      profiles.value = result.profiles;
      posts.value = result.posts;
    }
  } catch {
    profiles.value = [];
    posts.value = [];
  } finally {
    loading.value = false;
  }
}

void props;
</script>
