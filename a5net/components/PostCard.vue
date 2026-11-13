<template>
  <article
    class="a5-card a5-card-hover a5-grain a5-post overflow-hidden"
    :class="{ 'owner-post-card': isOwnerPost }"
  >
    <div class="flex items-start justify-between gap-3 p-4 pb-0 sm:p-5 sm:pb-0">
      <a
        :href="profilePageRoute.query({ id: post.author.id }).url()"
        class="flex min-w-0 items-center gap-3"
      >
        <div :class="avatarFrameClass(post.author)">
          <Avatar
            :name="post.author.name"
            :hue="post.author.avatarHue"
            :accent="post.author.avatarAccent"
            :src="post.author.avatarUrl"
            size="sm"
          />
        </div>
        <span class="min-w-0">
          <span class="flex items-center gap-1.5">
            <span class="truncate text-sm font-medium text-bone">{{
              post.author.name
            }}</span>
            <span
              v-if="isOwnerPost"
              class="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[10px] font-bold"
              style="
                color: #c8ff3d;
                text-shadow: 0 0 8px rgba(200, 255, 61, 0.5);
              "
              title="Печать Основателя"
              >👑 A5000 · ВЛАДЕЛЕЦ</span
            >
            <span
              v-else
              class="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[10px] font-bold"
              style="
                color: #c8ff3d;
                text-shadow: 0 0 8px rgba(200, 255, 61, 0.5);
              "
              title="Печать Основателя"
              >A5</span
            >
          </span>
          <span class="block truncate text-[11px] text-moss"
            >@{{ post.author.handle }} · {{ post.ago }}</span
          >
        </span>
      </a>
      <span class="a5-pill shrink-0 !py-1 !text-[9px]">{{ kindLabel }}</span>
    </div>

    <div class="p-4 sm:p-5">
      <a :href="targetHref" class="group block">
        <h3
          :class="isOwnerPost ? 'owner-post-title' : ''"
          class="a5-display text-lg font-medium leading-snug text-bone transition group-hover:text-lime sm:text-xl"
        >
          {{ post.title }}
        </h3>
        <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-moss">
          {{ post.body }}
        </p>
      </a>

      <div v-if="post.kind === 'video'" class="mt-4">
        <a
          :href="targetHref"
          class="group/cover relative block overflow-hidden rounded-xl border border-line/80"
        >
          <div
            class="relative aspect-video w-full"
            :style="{ background: coverBackground(post.coverHue) }"
          >
            <img
              v-if="poster"
              :src="poster"
              alt=""
              loading="lazy"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover opacity-75"
            />
            <div
              class="absolute inset-0"
              :style="{
                background: `linear-gradient(135deg, hsla(${post.coverHue}, 55%, 42%, 0.32), transparent 65%)`,
              }"
            ></div>
            <div
              class="absolute inset-0 opacity-60"
              style="
                background-image:
                  radial-gradient(
                    circle at 30% 30%,
                    rgba(255, 255, 255, 0.12),
                    transparent 40%
                  ),
                  radial-gradient(
                    circle at 70% 70%,
                    rgba(255, 255, 255, 0.08),
                    transparent 45%
                  );
              "
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span
                class="flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-ink/60 text-lime backdrop-blur transition group-hover/cover:scale-105 group-hover/cover:border-lime"
              >
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 14 16"
                  fill="currentColor"
                >
                  <path
                    d="M1 1.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L2.6.3C1.9-.1 1 .4 1 1.2z"
                  />
                </svg>
              </span>
            </div>
            <span
              class="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80"
              >{{ formatDuration(post.durationSec) }}</span
            >
            <span class="absolute left-4 top-4 a5-mono text-[9px] text-white/60"
              >видеоэтюд</span
            >
            <A5Stamp
              :size="22"
              tone="light"
              class="absolute right-3 top-3 opacity-70"
            />
          </div>
        </a>
      </div>

      <div
        v-else-if="post.kind === 'photo' && post.mediaUrl"
        class="mt-4 overflow-hidden rounded-xl border border-line/80"
      >
        <img
          :src="post.mediaUrl"
          :alt="post.title"
          loading="lazy"
          class="max-h-[560px] w-full object-cover"
        />
      </div>

      <div v-else-if="post.kind === 'music' && post.mediaUrl" class="mt-4">
        <AudioPlayer
          :src="post.mediaUrl"
          :title="post.title"
          :artist="artist"
          :post-id="post.id"
        />
      </div>

      <div
        v-else-if="post.kind === 'collab'"
        class="mt-4 rounded-xl border border-violet/25 bg-violet/5 p-4"
      >
        <p class="a5-mono text-[9px] text-violet/80">коллаборация · открыта</p>
        <p class="mt-1 text-sm text-bone/90">{{ post.body }}</p>
      </div>

      <div class="mt-4 flex flex-wrap gap-1.5">
        <span
          v-for="topic in post.topics"
          :key="topic.id"
          class="a5-chip"
          :style="{ borderColor: `hsla(${topic.hue}, 60%, 60%, 0.35)` }"
        >
          {{ topic.label }}
        </span>
        <span
          v-if="post.discovery"
          class="a5-mono self-center text-[8px] text-violet/60"
          >· новый голос</span
        >
      </div>

      <div class="mt-3">
        <EmojiBar
          :post-id="post.id"
          :counts="post.emojiCounts"
          :viewer-emoji="post.viewerEmoji"
        />
      </div>
    </div>

    <div
      class="flex items-center justify-between gap-2 border-t border-line/70 px-4 py-3 text-moss sm:px-5"
    >
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition hover:bg-panel2"
          :class="
            reaction === 'like' ? 'a5-like-pop text-lime' : 'hover:text-bone'
          "
          :aria-pressed="reaction === 'like'"
          aria-label="Нравится"
          @click="react('like')"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
          >
            <path
              d="M8 13.5s-5.5-3.2-5.5-7A3.2 3.2 0 018 4.2a3.2 3.2 0 015.5 2.3c0 3.8-5.5 7-5.5 7z"
            />
          </svg>
          {{ formatCount(likes) }}
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs transition hover:bg-panel2"
          :class="reaction === 'dislike' ? 'text-ember' : 'hover:text-bone'"
          :aria-pressed="reaction === 'dislike'"
          aria-label="Не нравится"
          @click="react('dislike')"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
          >
            <path
              d="M8 2.5s5.5 3.2 5.5 7A3.2 3.2 0 018 11.8a3.2 3.2 0 01-5.5-2.3c0-3.8 5.5-7 5.5-7z"
            />
          </svg>
          {{ formatCount(dislikes) }}
        </button>
        <a
          :href="postPageRoute.query({ id: post.id }).url() + '#comments'"
          class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition hover:bg-panel2 hover:text-bone"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
          >
            <path d="M3 3.5h10v7H8l-3 2.5v-2.5H3v-7z" />
          </svg>
          {{ formatCount(post.commentsCount) }}
        </a>
      </div>
      <div class="flex items-center gap-3">
        <span class="hidden font-mono text-[10px] text-moss/60 sm:inline"
          >{{ formatCount(post.views) }} просм.</span
        >
        <HypeMeter :score="post.hypeScore" :level="post.hypeLevel" />
      </div>
    </div>

    <p v-if="error" class="px-4 pb-3 text-[11px] text-ember sm:px-5">
      {{ error }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { PostCard as PostCardData, ReactionValue } from "../shared/types";
import Avatar from "./Avatar.vue";
import HypeMeter from "./HypeMeter.vue";
import EmojiBar from "./EmojiBar.vue";
import AudioPlayer from "./AudioPlayer.vue";
import A5Stamp from "./A5Stamp.vue";
import {
  coverBackground,
  formatCount,
  formatDuration,
  mediaCover,
} from "../shared/format";
import { postPageRoute } from "../post";
import { watchPageRoute } from "../watch";
import { profilePageRoute } from "../profile";
import { postReactRoute } from "../api/post/react";

const props = defineProps<{ post: PostCardData }>();

const likes = ref(props.post.likes);
const dislikes = ref(props.post.dislikes);
const reaction = ref<ReactionValue | null>(props.post.viewerReaction);
const error = ref("");

const kindLabel = computed(() => {
  if (props.post.kind === "video") return "видео";
  if (props.post.kind === "music") return "музыка";
  if (props.post.kind === "collab") return "коллаб";
  if (props.post.kind === "photo") return "фото";
  return "текст";
});

const artist = computed(() => {
  const first = props.post.body.split(".")[0];
  return first && first.length < 48 ? first : "";
});

function isOwner(author: any): boolean {
  return author.handle === "a5000";
}

const isOwnerPost = computed(() => isOwner(props.post.author));

function avatarFrameClass(author: any): string {
  if (!isOwner(author)) return "";
  return "premium-avatar founder";
}

const poster = computed(() =>
  mediaCover(props.post.coverUrl, props.post.mediaUrl),
);

const targetHref = computed(() =>
  props.post.kind === "video"
    ? watchPageRoute.query({ id: props.post.id }).url()
    : postPageRoute.query({ id: props.post.id }).url(),
);

async function react(value: "like" | "dislike") {
  error.value = "";
  const before = {
    likes: likes.value,
    dislikes: dislikes.value,
    reaction: reaction.value,
  };

  if (reaction.value === value) {
    reaction.value = null;
    if (value === "like") likes.value = Math.max(0, likes.value - 1);
    else dislikes.value = Math.max(0, dislikes.value - 1);
  } else {
    if (reaction.value === "like") likes.value = Math.max(0, likes.value - 1);
    if (reaction.value === "dislike")
      dislikes.value = Math.max(0, dislikes.value - 1);
    reaction.value = value;
    if (value === "like") likes.value += 1;
    else dislikes.value += 1;
  }

  try {
    const result = await postReactRoute.run(ctx, { id: props.post.id, value });
    if (!result.ok) {
      likes.value = before.likes;
      dislikes.value = before.dislikes;
      reaction.value = before.reaction;
      error.value = result.error;
      return;
    }
    likes.value = result.likes;
    dislikes.value = result.dislikes;
    reaction.value = result.viewerReaction;
  } catch {
    likes.value = before.likes;
    dislikes.value = before.dislikes;
    reaction.value = before.reaction;
    error.value = "Не удалось поставить реакцию.";
  }
}
</script>

<style scoped>
/* Premium avatar frames */
.premium-avatar {
  position: relative;
  display: inline-block;
  border-radius: 9999px;
}

.premium-avatar::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  z-index: -1;
}

/* Founder — lime glow + pulse */
.premium-avatar.founder::before {
  border: 2px solid #c8ff3d;
  box-shadow:
    0 0 10px rgba(200, 255, 61, 0.6),
    0 0 20px rgba(200, 255, 61, 0.3);
  animation: avatarPulse 2.5s ease-in-out infinite;
}

/* Legendary — gold glow */
.premium-avatar.legendary::before {
  border: 2px solid #ffd700;
  box-shadow:
    0 0 10px rgba(255, 215, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.25);
}

/* Epic — purple glow */
.premium-avatar.epic::before {
  border: 2px solid #a855f7;
  box-shadow:
    0 0 10px rgba(168, 85, 247, 0.5),
    0 0 20px rgba(168, 85, 247, 0.25);
}

@keyframes avatarPulse {
  0%,
  100% {
    box-shadow:
      0 0 10px rgba(200, 255, 61, 0.6),
      0 0 20px rgba(200, 255, 61, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 14px rgba(200, 255, 61, 0.8),
      0 0 28px rgba(200, 255, 61, 0.4);
    transform: scale(1.04);
  }
}
</style>

<style scoped>
/* Owner post card — God Mode */
.owner-post-card {
  position: relative;
  background: linear-gradient(135deg, #000000 0%, #0a0a00 50%, #000000 100%);
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow:
    0 0 20px rgba(200, 255, 61, 0.4),
    0 0 40px rgba(200, 255, 61, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  animation: ownerPulse 3s ease-in-out infinite;
}

.owner-post-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(45deg, #c8ff3d, #ffd700, #c8ff3d, #ffd700);
  background-size: 400% 400%;
  z-index: -1;
  animation: borderRotate 6s linear infinite;
  opacity: 0.8;
}

.owner-post-card::after {
  content: "👑";
  position: absolute;
  top: -12px;
  right: 20px;
  font-size: 24px;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
  animation: crownFloat 2s ease-in-out infinite;
  z-index: 10;
}

.owner-post-title {
  font-size: 1.15rem !important;
  line-height: 1.3 !important;
  color: #ffd700 !important;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@keyframes ownerPulse {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(200, 255, 61, 0.4),
      0 0 40px rgba(200, 255, 61, 0.2),
      inset 0 0 30px rgba(255, 215, 0, 0.05);
  }
  50% {
    box-shadow:
      0 0 30px rgba(200, 255, 61, 0.6),
      0 0 60px rgba(200, 255, 61, 0.3),
      inset 0 0 40px rgba(255, 215, 0, 0.08);
  }
}

@keyframes borderRotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes crownFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(5deg);
  }
}
</style>
