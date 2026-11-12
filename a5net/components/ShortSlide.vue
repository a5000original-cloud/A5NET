<template>
  <section
    class="relative mx-auto h-full w-full max-w-[430px] snap-start overflow-hidden bg-black sm:border-x sm:border-line/40"
  >
    <video
      ref="video"
      class="absolute inset-0 h-full w-full object-cover"
      :src="post.mediaUrl ?? undefined"
      :poster="poster"
      autoplay
      muted
      loop
      playsinline
      @click="toggleSound"
    ></video>
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30"
    ></div>

    <div
      class="absolute left-4 right-16 top-4 flex items-center justify-between"
    >
      <a href="/a5net/video" class="a5-mono text-[9px] text-white/70"
        >← видео</a
      >
      <span class="a5-mono text-[9px] text-white/40">A5 SHORTS</span>
    </div>

    <div class="absolute bottom-6 left-4 right-20 sm:bottom-10">
      <a
        :href="profilePageRoute.query({ id: post.author.id }).url()"
        class="flex items-center gap-2"
      >
        <Avatar
          :name="post.author.name"
          :hue="post.author.avatarHue"
          :accent="post.author.avatarAccent"
          :src="post.author.avatarUrl"
          size="sm"
          class="ring-2 ring-white/20"
        />
        <span class="flex items-center gap-1.5">
          <span class="text-[12px] font-medium text-white"
            >@{{ post.author.handle }}</span
          >
          <span
            v-if="isOwner(post.author)"
            class="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[10px] font-bold"
            style="color: #c8ff3d; text-shadow: 0 0 8px rgba(200, 255, 61, 0.5)"
            >A5</span
          >
        </span>
      </a>
      <h2
        class="mt-3 line-clamp-2 text-lg font-medium leading-tight text-white"
      >
        {{ post.title }}
      </h2>
      <p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/65">
        {{ post.body }}
      </p>
      <div class="mt-3 flex flex-wrap gap-1">
        <span
          v-for="topic in post.topics"
          :key="topic.id"
          class="rounded-full border border-white/15 px-2 py-0.5 text-[9px] text-white/60"
          >{{ topic.label }}</span
        >
      </div>
    </div>

    <div class="absolute bottom-8 right-3 flex flex-col items-center gap-4">
      <button
        type="button"
        class="flex flex-col items-center gap-1 text-white"
        @click="react('like')"
      >
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur"
          :class="reaction === 'like' ? 'text-lime' : ''"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
          >
            <path
              d="M8 13.5s-5.5-3.2-5.5-7A3.2 3.2 0 018 4.2a3.2 3.2 0 015.5 2.3c0 3.8-5.5 7-5.5 7z"
            />
          </svg>
        </span>
        <span class="font-mono text-[10px] text-white/70">{{
          formatCount(likes)
        }}</span>
      </button>
      <button
        type="button"
        class="flex flex-col items-center gap-1 text-white"
        @click="react('dislike')"
      >
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur"
          :class="reaction === 'dislike' ? 'text-ember' : ''"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
          >
            <path
              d="M8 2.5s5.5 3.2 5.5 7A3.2 3.2 0 018 11.8a3.2 3.2 0 01-5.5-2.3c0-3.8 5.5-7 5.5-7z"
            />
          </svg>
        </span>
        <span class="font-mono text-[10px] text-white/70">{{
          formatCount(dislikes)
        }}</span>
      </button>
      <a
        :href="postPageRoute.query({ id: post.id }).url() + '#comments'"
        class="flex flex-col items-center gap-1 text-white"
      >
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
          >
            <path d="M3 3.5h10v7H8l-3 2.5v-2.5H3v-7z" />
          </svg>
        </span>
        <span class="font-mono text-[10px] text-white/70">{{
          formatCount(post.commentsCount)
        }}</span>
      </a>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
        :aria-label="muted ? 'Включить звук' : 'Выключить звук'"
        @click="toggleSound"
      >
        <svg
          v-if="muted"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.3"
        >
          <path d="M2 6v4h2.5L8 13V3L4.5 6H2z" />
          <path d="M10.5 6l3 4M13.5 6l-3 4" stroke-linecap="round" />
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.3"
        >
          <path d="M2 6v4h2.5L8 13V3L4.5 6H2z" />
          <path d="M10.5 5.5a3.5 3.5 0 010 5" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import type { PostCard, ReactionValue } from "../shared/types";
import Avatar from "./Avatar.vue";
import { formatCount, mediaCover } from "../shared/format";
import { postReactRoute } from "../api/post/react";
import { postWatchRoute } from "../api/post/watch";
import { profilePageRoute } from "../profile";
import { postPageRoute } from "../post";

const props = defineProps<{ post: PostCard }>();

const video = ref<HTMLVideoElement | null>(null);
const muted = ref(true);
const likes = ref(props.post.likes);
const dislikes = ref(props.post.dislikes);
const reaction = ref<ReactionValue | null>(props.post.viewerReaction);
const poster = computed(() =>
  mediaCover(props.post.coverUrl, props.post.mediaUrl),
);
let reported = false;

function isOwner(author: any): boolean {
  return author.handle === "a5000";
}

function toggleSound() {
  const element = video.value;
  if (!element) return;
  element.muted = !element.muted;
  muted.value = element.muted;
}

async function react(value: "like" | "dislike") {
  const result = await postReactRoute
    .run(ctx, { id: props.post.id, value })
    .catch(() => null);
  if (result?.ok) {
    likes.value = result.likes;
    dislikes.value = result.dislikes;
    reaction.value = result.viewerReaction;
  }
}

onUnmounted(() => {
  if (!reported) {
    reported = true;
    const seconds = Math.round(video.value?.currentTime ?? 0);
    if (seconds > 1)
      void postWatchRoute
        .run(ctx, { id: props.post.id, seconds })
        .catch(() => undefined);
  }
  video.value?.pause();
});
</script>
