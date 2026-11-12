<template>
  <div class="a5-video-theme min-h-screen">
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="video" />

    <main class="a5-shell pb-28 pt-6">
      <section
        v-if="data.featured"
        class="relative overflow-hidden rounded-3xl border border-line/80"
      >
        <div class="absolute inset-0">
          <img
            v-if="featuredPoster"
            :src="featuredPoster"
            alt=""
            class="h-full w-full object-cover opacity-40"
          />
          <div
            class="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent"
          ></div>
        </div>
        <div
          class="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"
        >
          <div>
            <p class="a5-mono text-ember/80">A5 VIDEO · сейчас смотрят</p>
            <h1
              class="a5-display mt-4 max-w-2xl text-4xl font-medium leading-[1.02] sm:text-6xl"
            >
              {{ data.featured.title }}
            </h1>
            <p class="mt-4 max-w-xl text-sm leading-relaxed text-bone/70">
              {{ data.featured.body }}
            </p>
            <div class="mt-6 flex flex-wrap items-center gap-3">
              <a
                :href="watchPageRoute.query({ id: data.featured.id }).url()"
                class="a5-btn-primary"
              >
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="currentColor"
                >
                  <path
                    d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z"
                  />
                </svg>
                Смотреть
              </a>
              <span class="a5-pill !text-[9px]">{{
                formatLongDuration(data.featured.durationSec)
              }}</span>
              <span class="a5-pill !text-[9px]"
                >{{ formatCount(data.featured.views) }} просмотров</span
              >
            </div>
          </div>
          <div class="hidden justify-self-end lg:block">
            <div
              class="w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur"
            >
              <p class="a5-mono text-[9px] text-moss">канал</p>
              <div class="mt-3 flex items-center gap-3">
                <Avatar
                  :name="data.featured.author.name"
                  :hue="data.featured.author.avatarHue"
                  :accent="data.featured.author.avatarAccent"
                  :src="data.featured.author.avatarUrl"
                  size="md"
                />
                <div class="min-w-0">
                  <p
                    class="truncate flex items-center gap-1.5 text-sm text-bone"
                  >
                    <span>{{ data.featured.author.name }}</span>
                    <span
                      v-if="isOwner(data.featured.author)"
                      class="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[9px] font-bold"
                      style="
                        color: #c8ff3d;
                        text-shadow: 0 0 8px rgba(200, 255, 61, 0.5);
                      "
                      >A5</span
                    >
                  </p>
                  <p class="text-[10px] text-moss">
                    @{{ data.featured.author.handle }}
                  </p>
                </div>
              </div>
              <p class="mt-4 text-[11px] leading-relaxed text-moss/70">
                Видео, снятое вручную. Без вертикального кроя и без рекламы.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div
        class="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <p class="a5-display text-2xl">Видео</p>
            <p class="text-[11px] text-moss">
              {{ data.stats.videos }} роликов ·
              {{ data.stats.creators }} авторов ·
              {{ data.stats.hoursWatched }} ч просмотра
            </p>
          </div>
        </div>
        <div class="flex w-full max-w-md items-center gap-2">
          <input
            v-model="query"
            class="a5-input !py-2.5"
            placeholder="Поиск по видео и авторам"
          />
          <a
            :href="shortsPageRoute.url()"
            class="a5-btn shrink-0 !py-2.5 text-xs"
            >Shorts</a
          >
          <a :href="feedPageRoute.url()" class="a5-btn shrink-0 !py-2.5 text-xs"
            >Загрузить</a
          >
        </div>
      </div>

      <div class="a5-scroll mt-4 flex gap-1.5 overflow-x-auto pb-2">
        <button
          type="button"
          class="a5-chip shrink-0"
          :class="!activeTopic ? 'a5-chip-active' : ''"
          @click="activeTopic = ''"
        >
          Все
        </button>
        <button
          v-for="topic in data.topics"
          :key="topic.id"
          type="button"
          class="a5-chip shrink-0"
          :class="activeTopic === topic.id ? 'a5-chip-active' : ''"
          @click="activeTopic = topic.id"
        >
          {{ topic.label }}
        </button>
      </div>

      <section v-if="data.continueWatching.length" class="mt-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="a5-display text-xl">Продолжить смотреть</h2>
          <span class="a5-mono text-[9px] text-moss/50">{{
            data.continueWatching.length
          }}</span>
        </div>
        <div class="a5-scroll flex gap-4 overflow-x-auto pb-3">
          <div
            v-for="item in data.continueWatching"
            :key="item.post.id"
            class="w-[300px] shrink-0"
          >
            <VideoTile :post="item.post" :progress="item.progress" />
          </div>
        </div>
      </section>

      <section v-if="data.subscriptions.length" class="mt-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="a5-display text-xl">Твои подписки</h2>
          <span class="a5-mono text-[9px] text-moss/50"
            >свежее от тех, кого читаешь</span
          >
        </div>
        <div class="a5-scroll flex gap-4 overflow-x-auto pb-3">
          <div
            v-for="video in data.subscriptions"
            :key="video.id"
            class="w-[300px] shrink-0"
          >
            <VideoTile :post="video" />
          </div>
        </div>
      </section>

      <section class="mt-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="a5-display text-xl">
            {{ query || activeTopic ? "Найдено" : "Все ролики" }}
          </h2>
          <span class="a5-mono text-[9px] text-moss/50">{{
            filtered.length
          }}</span>
        </div>
        <div
          v-if="filtered.length"
          class="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <VideoTile v-for="video in filtered" :key="video.id" :post="video" />
        </div>
        <p
          v-else
          class="rounded-2xl border border-dashed border-line p-12 text-center text-sm text-moss"
        >
          Здесь пока нет роликов под этот запрос. Загрузи первый.
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { VideoHubData } from "../shared/types";
import SiteHeader from "./SiteHeader.vue";
import VideoTile from "./VideoTile.vue";
import Avatar from "./Avatar.vue";
import { formatCount, mediaCover } from "../shared/format";
import { formatLongDuration } from "../shared/upload";
import { watchPageRoute } from "../watch";
import { shortsPageRoute } from "../shorts";
import { feedPageRoute } from "../feed";

const props = defineProps<{ data: VideoHubData }>();

function isOwner(author: any): boolean {
  return author.handle === "a5000";
}

const query = ref("");
const activeTopic = ref("");

const featuredPoster = computed(() => {
  if (!props.data.featured) return "";
  return mediaCover(props.data.featured.coverUrl, props.data.featured.mediaUrl);
});

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return props.data.videos.filter((video) => {
    if (
      activeTopic.value &&
      !video.topics.some((topic) => topic.id === activeTopic.value)
    )
      return false;
    if (!needle) return true;
    return (
      video.title.toLowerCase().includes(needle) ||
      video.body.toLowerCase().includes(needle) ||
      video.author.name.toLowerCase().includes(needle) ||
      video.topics.some((topic) => topic.label.toLowerCase().includes(needle))
    );
  });
});
</script>
