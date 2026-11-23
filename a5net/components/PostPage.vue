<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="feed" />

    <main class="a5-shell pb-24 pt-6">
      <a :href="feedPageRoute.url()" class="a5-btn-ghost !px-0 text-xs">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
        >
          <path d="M10 3L5 8l5 5" stroke-linecap="round" />
        </svg>
        Назад в ленту
      </a>

      <div
        class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div class="min-w-0">
          <article class="a5-card a5-grain overflow-hidden">
            <div class="p-5 sm:p-7">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <a
                  :href="profilePageRoute.query({ id: post.author.id }).url()"
                  class="flex items-center gap-3"
                >
                  <div :class="avatarFrameClass(post.author)">
                    <Avatar
                      :name="post.author.name"
                      :hue="post.author.avatarHue"
                      :accent="post.author.avatarAccent"
                      :src="post.author.avatarUrl"
                      size="md"
                    />
                  </div>
                  <span>
                    <span class="flex items-center gap-1.5">
                      <span class="block text-sm font-medium text-bone">{{
                        post.author.name
                      }}</span>
                      <span
                        v-if="isOwner(post.author)"
                        class="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[10px] font-bold"
                        style="
                          color: #c8ff3d;
                          text-shadow: 0 0 8px rgba(200, 255, 61, 0.5);
                        "
                        >A5</span
                      >
                    </span>
                    <span class="block text-[11px] text-moss"
                      >@{{ post.author.handle }} · {{ post.author.city }}</span
                    >
                  </span>
                </a>
                <div class="flex items-center gap-2">
                  <span class="a5-pill !text-[9px]">{{ kindLabel }}</span>
                  <span class="font-mono text-[10px] text-moss/60">{{
                    post.ago
                  }}</span>
                </div>
              </div>

              <h1
                class="a5-display mt-6 text-3xl font-medium leading-[1.1] sm:text-[2.6rem]"
              >
                {{ post.title }}
              </h1>
              <p
                class="mt-4 text-base leading-relaxed text-bone/80 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-lime"
              >
                {{ post.body }}
              </p>

              <div v-if="post.kind === 'video' && post.mediaUrl" class="mt-6">
                <VideoPlayer
                  :src="post.mediaUrl"
                  :title="post.title"
                  :duration="post.durationSec"
                  :post-id="post.id"
                  :cover-url="post.coverUrl"
                />
              </div>
              <div
                v-else-if="post.kind === 'photo' && post.mediaUrl"
                class="mt-6 overflow-hidden rounded-xl border border-line/80"
              >
                <img
                  :src="post.mediaUrl"
                  :alt="post.title"
                  class="max-h-[720px] w-full object-cover"
                />
              </div>
              <div
                v-else-if="post.kind === 'music' && post.mediaUrl"
                class="mt-6"
              >
                <AudioPlayer
                  :src="post.mediaUrl"
                  :title="post.title"
                  :artist="artist"
                  :post-id="post.id"
                />
              </div>

              <div v-if="data.collab" class="mt-6">
                <CollabCard :collab="data.collab" />
              </div>

              <div class="mt-6 flex flex-wrap gap-1.5">
                <span
                  v-for="topic in post.topics"
                  :key="topic.id"
                  class="a5-chip"
                  >{{ topic.label }}</span
                >
              </div>
            </div>

            <div
              class="flex items-center justify-between gap-3 border-t border-line/70 px-5 py-3 sm:px-7"
            >
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-full px-3 py-2 text-sm transition hover:bg-panel2"
                  :class="
                    reaction === 'like'
                      ? 'text-lime'
                      : 'text-moss hover:text-bone'
                  "
                  @click="react('like')"
                >
                  <svg
                    width="17"
                    height="17"
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
                  class="flex items-center gap-2 rounded-full px-3 py-2 text-sm transition hover:bg-panel2"
                  :class="
                    reaction === 'dislike'
                      ? 'text-ember'
                      : 'text-moss hover:text-bone'
                  "
                  @click="react('dislike')"
                >
                  <svg
                    width="16"
                    height="16"
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
                  href="#comments"
                  class="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-moss transition hover:bg-panel2 hover:text-bone"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.3"
                  >
                    <path d="M3 3.5h10v7H8l-3 2.5v-2.5H3v-7z" />
                  </svg>
                  {{ formatCount(commentCount) }}
                </a>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-[10px] text-moss/60"
                  >{{ formatCount(post.views) }} просм.</span
                >
                <HypeMeter :score="post.hypeScore" :level="post.hypeLevel" />
                <button
                  v-if="post.author.id !== data.viewer.id"
                  type="button"
                  class="text-[10px] text-moss/50 underline decoration-line transition hover:text-bone"
                  @click="reportOpen = !reportOpen"
                >
                  пожаловаться
                </button>
                <button
                  v-if="canModerate"
                  type="button"
                  class="text-[10px] text-moss/50 underline decoration-line transition hover:text-ember"
                  :disabled="deleting"
                  @click="removePost"
                >
                  скрыть
                </button>
              </div>
            </div>
          </article>

          <div v-if="reportOpen" class="a5-card mt-4 p-4">
            <p class="a5-mono text-[9px] text-moss">жалоба на пост</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="reason in reasons"
                :key="reason.value"
                type="button"
                class="a5-chip"
                :class="reportReason === reason.value ? 'a5-chip-active' : ''"
                @click="reportReason = reason.value"
              >
                {{ reason.label }}
              </button>
            </div>
            <textarea
              v-model="reportNote"
              class="a5-input mt-3 min-h-[70px]"
              maxlength="400"
              placeholder="Что не так? Коротко и по делу."
            ></textarea>
            <div class="mt-3 flex items-center justify-between">
              <p v-if="reportError" class="text-[11px] text-ember">
                {{ reportError }}
              </p>
              <p v-else class="text-[10px] text-moss/60">
                Жалоба уйдёт A5000 и админам.
              </p>
              <button
                type="button"
                class="a5-btn !py-2 text-xs"
                :disabled="reportBusy"
                @click="sendReport"
              >
                {{ reportBusy ? "Отправляю…" : "Отправить жалобу" }}
              </button>
            </div>
          </div>
          <p v-if="reportSent" class="mt-3 text-[11px] text-lime">
            Жалоба принята. Спасибо, что не молчишь.
          </p>

          <CommentsBlock
            :post-id="post.id"
            :viewer="data.viewer"
            :initial-comments="data.comments"
            :count="post.commentsCount"
          />
        </div>

        <aside class="space-y-4">
          <section class="a5-card p-5">
            <div class="flex items-center gap-3">
              <a :href="profilePageRoute.query({ id: author.id }).url()">
                <div :class="avatarFrameClass(author)">
                  <Avatar
                    :name="author.name"
                    :hue="author.avatarHue"
                    :accent="author.avatarAccent"
                    :src="author.avatarUrl"
                    size="lg"
                  />
                </div>
              </a>
              <div class="min-w-0">
                <a
                  :href="profilePageRoute.query({ id: author.id }).url()"
                  class="flex items-center gap-1.5 truncate hover:text-lime"
                >
                  <span class="text-base font-medium">{{ author.name }}</span>
                  <span
                    v-if="isOwner(author)"
                    class="shrink-0 rounded-sm px-1 py-0.5 font-mono text-[10px] font-bold"
                    style="
                      color: #c8ff3d;
                      text-shadow: 0 0 8px rgba(200, 255, 61, 0.5);
                    "
                    >A5</span
                  >
                </a>
                <p class="truncate text-[11px] text-moss">
                  @{{ author.handle }} · {{ author.city }}
                </p>
              </div>
            </div>
            <p class="mt-4 text-sm leading-relaxed text-moss">
              {{ author.bio }}
            </p>

            <div class="mt-4 flex flex-wrap gap-1.5">
              <span
                v-for="interest in author.interests.slice(0, 4)"
                :key="interest.id"
                class="a5-chip"
                >{{ interest.label }}</span
              >
            </div>

            <div
              class="mt-4 grid grid-cols-3 gap-2 border-t border-line/70 pt-4 text-center"
            >
              <div>
                <p class="a5-display text-base">{{ author.postsCount }}</p>
                <p class="text-[10px] text-moss">
                  {{ plural(author.postsCount, "пост", "поста", "постов") }}
                </p>
              </div>
              <div>
                <p class="a5-display text-base">{{ author.friendsCount }}</p>
                <p class="text-[10px] text-moss">
                  {{ plural(author.friendsCount, "друг", "друга", "друзей") }}
                </p>
              </div>
              <div>
                <p class="a5-display text-base">{{ author.followersCount }}</p>
                <p class="text-[10px] text-moss">
                  {{
                    plural(author.followersCount, "читает", "читают", "читают")
                  }}
                </p>
              </div>
            </div>

            <div v-if="!author.isSelf" class="mt-4 flex gap-2">
              <button
                type="button"
                class="a5-btn flex-1 !py-2 text-xs"
                @click="toggleFollow"
              >
                {{ following ? "Ты читаешь" : "Читать" }}
              </button>
              <button
                type="button"
                class="a5-btn flex-1 !py-2 text-xs"
                :disabled="friendState !== 'none'"
                @click="addFriend"
              >
                {{ friendLabel }}
              </button>
            </div>
            <p v-if="actionError" class="mt-2 text-[11px] text-ember">
              {{ actionError }}
            </p>
          </section>

          <section v-if="data.related.length" class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">рядом по теме</p>
            <ul class="mt-4 space-y-3">
              <li v-for="item in data.related" :key="item.id">
                <a
                  :href="postPageRoute.query({ id: item.id }).url()"
                  class="group block"
                >
                  <p
                    class="text-sm leading-snug text-bone/90 group-hover:text-lime"
                  >
                    {{ item.title }}
                  </p>
                  <p class="mt-1 text-[10px] text-moss/60">
                    {{ item.author.name }} · {{ item.ago }}
                  </p>
                </a>
              </li>
            </ul>
          </section>

          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">правило сети</p>
            <p class="mt-2 text-sm leading-relaxed text-moss">
              Здесь нет кнопки «поделиться в другие сети». Всё остаётся внутри
              A5NET — так и задумано.
            </p>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { CommentItem, PostPageData, ReactionValue } from "../shared/types";
import SiteHeader from "./SiteHeader.vue";
import Avatar from "./Avatar.vue";
import HypeMeter from "./HypeMeter.vue";
import VideoPlayer from "./VideoPlayer.vue";
import AudioPlayer from "./AudioPlayer.vue";
import CollabCard from "./CollabCard.vue";
import CommentsBlock from "./CommentsBlock.vue";
import { formatCount, plural } from "../shared/format";
import { feedPageRoute } from "../feed";
import { postPageRoute } from "../post";
import { profilePageRoute } from "../profile";
import { postReactRoute } from "../api/post/react";
import { postCommentRoute } from "../api/post/comment";
import { userFollowRoute } from "../api/user/follow";
import { friendRequestRoute } from "../api/friend/request";
import { postDeleteRoute } from "../api/post/delete";
import { reportCreateRoute } from "../api/report/create";

const props = defineProps<{ data: PostPageData }>();

const post = props.data.post;
const author = ref(props.data.author);
const likes = ref(post.likes);
const dislikes = ref(post.dislikes);
const reaction = ref<ReactionValue | null>(post.viewerReaction);
const comments = ref<CommentItem[]>(props.data.comments);
const commentCount = ref(post.commentsCount);
const commentText = ref("");
const sending = ref(false);
const deleting = ref(false);
const reportOpen = ref(false);
const reportBusy = ref(false);
const reportSent = ref(false);
const reportError = ref("");
const reportNote = ref("");
const reportReason = ref<"spam" | "abuse" | "offtopic" | "other">("spam");
const reasons = [
  { value: "spam" as const, label: "спам" },
  { value: "abuse" as const, label: "агрессия" },
  { value: "offtopic" as const, label: "не по теме" },
  { value: "other" as const, label: "другое" },
];
const commentError = ref("");
const actionError = ref("");
const following = ref(props.data.author.isFollowing);
const friendState = ref<"none" | "pending" | "friend">(
  props.data.author.isFriend
    ? "friend"
    : props.data.author.requestPending
      ? "pending"
      : "none",
);

const kindLabel = computed(() => {
  if (post.kind === "video") return "видеоэтюд";
  if (post.kind === "music") return "музыка";
  if (post.kind === "collab") return "коллаборация";
  if (post.kind === "photo") return "фото";
  return "текст";
});

const artist = computed(() => {
  const first = post.body.split(".")[0];
  return first && first.length < 48 ? first : "";
});

function isOwner(author: any): boolean {
  return author.handle === "a5000";
}

function avatarFrameClass(author: any): string {
  if (!isOwner(author)) return "";
  return "premium-avatar founder";
}

const friendLabel = computed(() => {
  if (friendState.value === "friend") return "В друзьях";
  if (friendState.value === "pending") return "Заявка отправлена";
  return "В друзья";
});

async function react(value: "like" | "dislike") {
  try {
    const result = await postReactRoute.run(ctx, { id: post.id, value });
    if (!result.ok) return;
    likes.value = result.likes;
    dislikes.value = result.dislikes;
    reaction.value = result.viewerReaction;
  } catch {
    // keep previous reaction
  }
}

async function sendComment() {
  if (commentText.value.trim().length < 2 || sending.value) return;
  sending.value = true;
  commentError.value = "";
  try {
    const result = await postCommentRoute.run(ctx, {
      id: post.id,
      text: commentText.value.trim(),
    });
    if (!result.ok) {
      commentError.value = result.error;
      return;
    }
    comments.value = [...comments.value, result.comment];
    commentCount.value = result.commentsCount;
    commentText.value = "";
  } catch {
    commentError.value = "Комментарий не отправился.";
  } finally {
    sending.value = false;
  }
}

async function toggleFollow() {
  actionError.value = "";
  try {
    const result = await userFollowRoute.run(ctx, {
      profileId: author.value.id,
    });
    if (!result.ok) {
      actionError.value = result.error;
      return;
    }
    following.value = result.following;
  } catch {
    actionError.value = "Не удалось изменить подписку.";
  }
}

async function addFriend() {
  if (friendState.value !== "none") return;
  actionError.value = "";
  try {
    const result = await friendRequestRoute.run(ctx, {
      profileId: author.value.id,
    });
    if (!result.ok) {
      actionError.value = result.error;
      return;
    }
    friendState.value = "pending";
  } catch {
    actionError.value = "Заявка не отправилась.";
  }
}

const canModerate = props.data.viewerRole !== "member";

async function removePost() {
  if (
    !window.confirm(
      "Скрыть пост? Он исчезнет из ленты, но останется в базе для модерации.",
    )
  )
    return;
  deleting.value = true;
  actionError.value = "";
  try {
    const result = await postDeleteRoute.run(ctx, { id: post.id });
    if (!result.ok) {
      actionError.value = result.error;
      return;
    }
    window.location.href = feedPageRoute.url();
  } catch {
    actionError.value = "Не удалось скрыть пост.";
  } finally {
    deleting.value = false;
  }
}

async function sendReport() {
  if (reportBusy.value) return;
  reportBusy.value = true;
  reportError.value = "";
  try {
    const result = await reportCreateRoute.run(ctx, {
      targetType: "post",
      targetId: post.id,
      reason: reportReason.value,
      note: reportNote.value.trim() || undefined,
    });
    if (!result.ok) {
      reportError.value = result.error;
      return;
    }
    reportSent.value = true;
    reportOpen.value = false;
    reportNote.value = "";
  } catch {
    reportError.value = "Жалоба не отправилась.";
  } finally {
    reportBusy.value = false;
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
