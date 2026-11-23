<template>
  <section id="comments" class="mt-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="a5-display text-xl">
        Обсуждение <span class="text-moss">{{ count }}</span>
      </h2>
      <span class="a5-mono text-[9px] text-moss/50">без шаблонов</span>
    </div>

    <form class="a5-card mb-5 p-4" @submit.prevent="send">
      <div class="flex gap-3">
        <Avatar
          :name="viewer.name"
          :hue="viewer.avatarHue"
          :accent="viewer.avatarAccent"
          :src="viewer.avatarUrl"
          size="sm"
        />
        <div class="flex-1">
          <textarea
            v-model="text"
            class="a5-input min-h-[76px] resize-y"
            maxlength="600"
            placeholder="Что зацепило? Конкретно, без «отличный пост»."
          ></textarea>
          <div class="mt-2 flex items-center justify-between">
            <p class="text-[11px] text-moss/60">{{ text.length }} / 600</p>
            <button
              type="submit"
              class="a5-btn-primary !py-2 text-xs"
              :disabled="sending || text.trim().length < 2"
            >
              {{ sending ? "Отправляю…" : "Отправить" }}
            </button>
          </div>
        </div>
      </div>
      <p v-if="error" class="mt-2 text-xs text-ember">{{ error }}</p>
    </form>

    <div v-if="items.length" class="space-y-3">
      <article
        v-for="comment in items"
        :key="comment.id"
        class="a5-card p-4"
        :class="comment.parentId ? 'ml-4 border-lime/20 sm:ml-8' : ''"
      >
        <div class="flex items-start gap-3">
          <a
            :href="profilePageRoute.query({ id: comment.author.id }).url()"
            :class="avatarFrameClass(comment.author)"
          >
            <Avatar
              :name="comment.author.name"
              :hue="comment.author.avatarHue"
              :accent="comment.author.avatarAccent"
              :src="comment.author.avatarUrl"
              size="sm"
            />
          </a>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline gap-2">
              <a
                :href="profilePageRoute.query({ id: comment.author.id }).url()"
                class="text-sm font-medium text-bone hover:text-ember"
                >{{ comment.author.name }}</a
              >
              <span
                v-if="isOwner(comment.author)"
                class="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[10px] font-bold"
                style="
                  color: #c8ff3d;
                  text-shadow: 0 0 8px rgba(200, 255, 61, 0.5);
                "
                >A5</span
              >
              <span class="text-[10px] text-moss/60">{{ comment.ago }}</span>
              <span v-if="comment.replyToName" class="text-[10px] text-moss/50"
                >↳ {{ comment.replyToName }}</span
              >
            </div>
            <p class="mt-1.5 text-sm leading-relaxed text-bone/85">
              {{ comment.text }}
            </p>
            <button
              type="button"
              class="mt-2 text-[10px] text-moss/50 underline decoration-line hover:text-bone"
              @click="openReply(comment)"
            >
              ответить
            </button>

            <div
              v-if="replyTo?.id === comment.id"
              class="mt-3 rounded-xl border border-line bg-coal p-3"
            >
              <textarea
                v-model="replyText"
                class="a5-input min-h-[60px] text-[12px]"
                maxlength="600"
                :placeholder="`Ответить ${comment.author.name}…`"
              ></textarea>
              <div class="mt-2 flex items-center justify-between">
                <p class="text-[9px] text-moss/50">
                  {{ replyText.length }} / 600
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="a5-btn-ghost text-[10px]"
                    @click="replyTo = null"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    class="a5-btn-primary !px-3 !py-1.5 text-[10px]"
                    :disabled="replyBusy || replyText.trim().length < 2"
                    @click="sendReply(comment)"
                  >
                    {{ replyBusy ? "…" : "Ответить" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <span
            v-if="comment.likes"
            class="flex items-center gap-1 text-[10px] text-moss/60"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
            >
              <path
                d="M8 13.5s-5.5-3.2-5.5-7A3.2 3.2 0 018 4.2a3.2 3.2 0 015.5 2.3c0 3.8-5.5 7-5.5 7z"
              />
            </svg>
            {{ comment.likes }}
          </span>
        </div>
      </article>
    </div>
    <p
      v-else
      class="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-moss"
    >
      Тишина. Первый голос задаст тон.
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { AuthorCard, CommentItem } from "../shared/types";
import Avatar from "./Avatar.vue";
import { postCommentRoute } from "../api/post/comment";
import { profilePageRoute } from "../profile";

const props = defineProps<{
  postId: string;
  viewer: AuthorCard;
  initialComments: CommentItem[];
  count: number;
}>();

const items = ref<CommentItem[]>([...props.initialComments]);
const count = ref(props.count);
const text = ref("");
const sending = ref(false);
const error = ref("");
const replyTo = ref<CommentItem | null>(null);
const replyText = ref("");
const replyBusy = ref(false);

function isOwner(author: any): boolean {
  return author.handle === "a5000";
}

function avatarFrameClass(author: any): string {
  if (!isOwner(author)) return "";
  return "premium-avatar founder";
}

function openReply(comment: CommentItem) {
  replyTo.value = comment;
  replyText.value = "";
}

async function send() {
  if (text.value.trim().length < 2 || sending.value) return;
  sending.value = true;
  error.value = "";
  try {
    const result = await postCommentRoute.run(ctx, {
      id: props.postId,
      text: text.value.trim(),
    });
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    items.value = [...items.value, result.comment];
    count.value = result.commentsCount;
    text.value = "";
  } catch {
    error.value = "Комментарий не отправился.";
  } finally {
    sending.value = false;
  }
}

async function sendReply(comment: CommentItem) {
  if (replyText.value.trim().length < 2 || replyBusy.value) return;
  replyBusy.value = true;
  error.value = "";
  try {
    const result = await postCommentRoute.run(ctx, {
      id: props.postId,
      parentId: comment.id,
      text: replyText.value.trim(),
    });
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    items.value = [...items.value, result.comment];
    count.value = result.commentsCount;
    replyTo.value = null;
    replyText.value = "";
  } catch {
    error.value = "Ответ не отправился.";
  } finally {
    replyBusy.value = false;
  }
}
</script>

<style scoped>
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
