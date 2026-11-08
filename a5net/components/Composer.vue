<template>
  <section class="a5-card overflow-hidden">
    <div
      class="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-5"
    >
      <div class="flex items-center gap-3">
        <Avatar
          :name="viewer.name"
          :hue="viewer.avatarHue"
          :accent="viewer.avatarAccent"
          :src="viewer.avatarUrl"
          size="sm"
        />
        <div>
          <p class="text-sm font-medium text-bone">Новый артефакт</p>
          <p class="text-[11px] text-moss">
            Текст, видео или трек — без лимита на длительность
          </p>
        </div>
      </div>
      <button
        type="button"
        class="a5-btn-ghost text-xs"
        @click="$emit('close')"
      >
        Свернуть
      </button>
    </div>

    <div class="space-y-4 p-4 sm:p-5">
      <div class="flex gap-1 rounded-full border border-line bg-coal p-1">
        <button
          v-for="option in kinds"
          :key="option.value"
          type="button"
          class="flex-1 rounded-full px-3 py-2 text-xs font-medium transition"
          :class="
            kind === option.value
              ? 'bg-lime text-ink'
              : 'text-moss hover:text-bone'
          "
          @click="selectKind(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div>
        <label class="a5-label" for="a5-title">Заголовок</label>
        <input
          id="a5-title"
          v-model="title"
          class="a5-input"
          maxlength="140"
          placeholder="О чём это?"
        />
      </div>

      <div>
        <label class="a5-label" for="a5-body">Описание</label>
        <textarea
          id="a5-body"
          v-model="body"
          class="a5-input min-h-[110px] resize-y"
          maxlength="600"
          :placeholder="bodyPlaceholder"
        ></textarea>
        <p class="mt-1 text-right font-mono text-[10px] text-moss/60">
          {{ body.length }} / 600
        </p>
      </div>

      <div
        v-if="kind !== 'text'"
        class="rounded-2xl border border-line bg-coal/60 p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="a5-label !mb-1">
              {{
                kind === "video"
                  ? "Видеофайл"
                  : kind === "photo"
                    ? "Изображение"
                    : "Аудиофайл"
              }}
            </p>
            <p class="text-[11px] text-moss/70">
              MP4 / WebM / MOV / MP3 / WAV / JPG / PNG · размер не ограничен
            </p>
          </div>
          <label class="a5-btn cursor-pointer">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
            >
              <path d="M8 11V3M4.5 6.5L8 3l3.5 3.5" stroke-linecap="round" />
              <path d="M2.5 12.5h11" stroke-linecap="round" />
            </svg>
            {{
              uploading
                ? `Загружаю ${uploadPercent}%`
                : fileName
                  ? "Заменить файл"
                  : "Выбрать файл"
            }}
            <input
              type="file"
              class="hidden"
              :accept="
                kind === 'video'
                  ? 'video/*'
                  : kind === 'photo'
                    ? 'image/*'
                    : 'audio/*'
              "
              @change="upload"
            />
          </label>
        </div>

        <div v-if="uploading || uploadPercent > 0" class="mt-3">
          <div class="h-1.5 overflow-hidden rounded-full bg-line">
            <div
              class="h-full rounded-full bg-lime transition-[width]"
              :style="{ width: uploadPercent + '%' }"
            ></div>
          </div>
        </div>

        <div
          v-if="fileName"
          class="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-moss"
        >
          <span class="max-w-full truncate">{{ fileName }}</span>
          <span v-if="meta.duration" class="font-mono text-lime/80">{{
            formatLongDuration(meta.duration)
          }}</span>
          <span v-if="meta.size" class="font-mono">{{
            formatBytes(meta.size)
          }}</span>
          <span v-if="meta.width" class="font-mono"
            >{{ meta.width }}×{{ meta.height }}</span
          >
        </div>

        <div v-if="kind === 'video' || kind === 'music'" class="mt-4">
          <div class="flex items-center justify-between">
            <p class="a5-label !mb-0">Обложка</p>
            <div class="flex gap-2">
              <button
                v-if="kind === 'video' && lastFile"
                type="button"
                class="a5-btn-ghost !px-2 !py-1 text-[10px]"
                :disabled="coverUploading"
                @click="captureCover"
              >
                Взять кадр
              </button>
              <label
                class="a5-btn-ghost cursor-pointer !px-2 !py-1 text-[10px]"
              >
                Своя картинка
                <input
                  type="file"
                  class="hidden"
                  accept="image/*"
                  @change="uploadCover"
                />
              </label>
              <button
                v-if="coverPreview"
                type="button"
                class="a5-btn-ghost !px-2 !py-1 text-[10px] text-ember/80"
                @click="resetCover"
              >
                Убрать
              </button>
            </div>
          </div>
          <div
            class="relative mt-2 aspect-[16/7] overflow-hidden rounded-xl border border-line bg-ink"
          >
            <img
              v-if="coverPreview"
              :src="coverPreview"
              alt=""
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full items-center justify-center"
              :style="{ background: coverBackground(viewer.avatarHue) }"
            >
              <span class="a5-mono text-[9px] text-moss/60"
                >обложка не выбрана</span
              >
            </div>
            <div
              v-if="coverUploading"
              class="absolute inset-0 flex items-center justify-center bg-ink/70"
            >
              <span class="a5-mono text-[9px] text-lime"
                >обложка {{ coverPercent }}%</span
              >
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="a5-label">Темы · до трёх</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="topic in topicOptions"
            :key="topic.id"
            type="button"
            class="a5-chip"
            :class="topics.includes(topic.id) ? 'a5-chip-active' : ''"
            @click="toggleTopic(topic.id)"
          >
            {{ topic.label }}
          </button>
        </div>
      </div>

      <!-- Poll Section -->
      <div class="rounded-2xl border border-line bg-coal/60 p-4">
        <div class="flex items-center justify-between">
          <p class="a5-label !mb-0">Опрос</p>
          <button
            type="button"
            class="a5-btn-ghost !px-2 !py-1 text-[10px]"
            @click="showPoll = !showPoll"
          >
            {{ showPoll ? "Скрыть" : "Добавить" }}
          </button>
        </div>
        <div v-if="showPoll" class="mt-3 space-y-2">
          <div
            v-for="(option, index) in pollOptions"
            :key="index"
            class="flex gap-2"
          >
            <input
              v-model="pollOptions[index]"
              class="a5-input flex-1 !py-2 text-xs"
              placeholder="Вариант ответа"
            />
            <button
              type="button"
              class="a5-btn-ghost !px-2 text-xs text-ember/70"
              @click="pollOptions.splice(index, 1)"
              :disabled="pollOptions.length <= 2"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            class="a5-btn-ghost !px-2 !py-1 text-[10px]"
            @click="pollOptions.push('')"
            :disabled="pollOptions.length >= 6"
          >
            + вариант
          </button>
          <div class="flex items-center gap-2">
            <label class="text-[10px] text-moss">Истекает через:</label>
            <select v-model="pollDuration" class="a5-input !py-1 text-[10px]">
              <option :value="24">24 часа</option>
              <option :value="168">7 дней</option>
              <option :value="720">30 дней</option>
            </select>
          </div>
        </div>
      </div>

      <div
        v-if="error"
        class="rounded-xl border border-ember/30 bg-ember/10 px-3 py-2 text-xs text-ember"
      >
        {{ error }}
      </div>

      <div class="flex items-center justify-between gap-3">
        <p class="text-[11px] text-moss/70">
          Файл уходит напрямую в хранилище. Большой ролик можно не закрывать
          вкладку.
        </p>
        <button
          type="button"
          class="a5-btn-primary"
          :disabled="submitting || uploading || coverUploading"
          @click="submit"
        >
          {{
            submitting
              ? "Публикую…"
              : kind === "video"
                ? "Опубликовать видео"
                : "Опубликовать"
          }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { AuthorCard, TopicRef } from "../shared/types";
import Avatar from "./Avatar.vue";
import { postCreateRoute } from "../api/post/create";
import { watchPageRoute } from "../watch";
import { postPageRoute } from "../post";
import {
  captureVideoFrame,
  formatBytes,
  formatLongDuration,
  readMediaMeta,
  uploadBlob,
  uploadFile,
} from "../shared/upload";
import { coverBackground } from "../shared/format";

const props = defineProps<{ viewer: AuthorCard; topicOptions: TopicRef[] }>();
defineEmits<{ close: [] }>();

const kinds = [
  { value: "text" as const, label: "Текст" },
  { value: "video" as const, label: "Видео" },
  { value: "music" as const, label: "Музыка" },
  { value: "photo" as const, label: "Фото" },
];

const kind = ref<"text" | "video" | "music" | "photo">("text");
const title = ref("");
const body = ref("");
const topics = ref<string[]>([]);
const submitting = ref(false);
const uploading = ref(false);
const coverUploading = ref(false);
const uploadPercent = ref(0);
const coverPercent = ref(0);
const mediaHash = ref("");
const coverHash = ref("");
const coverPreview = ref("");
const fileName = ref("");
const meta = ref({ duration: 0, size: 0, width: 0, height: 0 });
const error = ref("");
const lastFile = ref<File | null>(null);
const showPoll = ref(false);
const pollOptions = ref<string[]>(["", ""]);
const pollDuration = ref(168);

const bodyPlaceholder = computed(() => {
  if (kind.value === "video")
    return "Что происходит в кадре и почему это стоит смотреть?";
  if (kind.value === "music") return "Пара слов о треке. Без рекламного тона.";
  if (kind.value === "photo") return "Что в кадре и почему ты его сохранил?";
  return "Мысль, наблюдение или вопрос. Живым языком.";
});

function selectKind(value: "text" | "video" | "music" | "photo") {
  if (kind.value === value) return;
  kind.value = value;
  resetMedia();
}

function resetMedia() {
  mediaHash.value = "";
  fileName.value = "";
  lastFile.value = null;
  meta.value = { duration: 0, size: 0, width: 0, height: 0 };
  uploadPercent.value = 0;
  resetCover();
}

function resetCover() {
  coverHash.value = "";
  coverPreview.value = "";
}

function toggleTopic(id: string) {
  if (topics.value.includes(id)) {
    topics.value = topics.value.filter((topic) => topic !== id);
    return;
  }
  if (topics.value.length >= 3) return;
  topics.value = [...topics.value, id];
}

async function upload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  error.value = "";
  uploading.value = true;
  uploadPercent.value = 0;
  fileName.value = file.name;
  lastFile.value = file;
  meta.value = { duration: 0, size: file.size, width: 0, height: 0 };
  try {
    const metadataPromise = readMediaMeta(file);
    const result = await uploadFile(ctx, file, (progress) => {
      uploadPercent.value = progress.percent;
    });
    mediaHash.value = result.hash;
    const metadata = await metadataPromise;
    meta.value = {
      duration: metadata.duration,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
    };
    if (kind.value === "video" && !coverHash.value) {
      void autoCover(file);
    }
  } catch {
    error.value = "Файл не загрузился. Проверь соединение и попробуй ещё раз.";
    mediaHash.value = "";
  } finally {
    uploading.value = false;
  }
}

async function autoCover(file: File) {
  coverUploading.value = true;
  coverPercent.value = 0;
  try {
    const blob = await captureVideoFrame(file, 1.2);
    if (!blob) return;
    coverPreview.value = URL.createObjectURL(blob);
    const result = await uploadBlob(ctx, blob, "cover.jpg", (progress) => {
      coverPercent.value = progress.percent;
    });
    coverHash.value = result.hash;
  } catch {
    // a custom cover can be uploaded instead
  } finally {
    coverUploading.value = false;
  }
}

async function captureCover() {
  if (lastFile.value) await autoCover(lastFile.value);
}

async function uploadCover(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  error.value = "";
  coverUploading.value = true;
  coverPercent.value = 0;
  coverPreview.value = URL.createObjectURL(file);
  try {
    const result = await uploadBlob(ctx, file, file.name, (progress) => {
      coverPercent.value = progress.percent;
    });
    coverHash.value = result.hash;
  } catch {
    error.value = "Обложка не загрузилась.";
    coverPreview.value = "";
  } finally {
    coverUploading.value = false;
  }
}

async function submit() {
  error.value = "";
  if (title.value.trim().length < 3) {
    error.value = "Нужен заголовок хотя бы из трёх символов.";
    return;
  }
  if (body.value.trim().length < 2) {
    error.value = "Добавь описание.";
    return;
  }
  if (!topics.value.length) {
    error.value = "Выбери хотя бы одну тему.";
    return;
  }
  if (kind.value !== "text" && !mediaHash.value) {
    error.value = "Для видео и музыки нужен файл.";
    return;
  }
  submitting.value = true;
  try {
    const validPollOptions = pollOptions.value.filter(
      (o) => o.trim().length > 0,
    );
    const result = await postCreateRoute.run(ctx, {
      kind: kind.value,
      title: title.value.trim(),
      body: body.value.trim(),
      topics: topics.value,
      mediaHash: mediaHash.value || undefined,
      coverHash: coverHash.value || undefined,
      durationSec: meta.value.duration || undefined,
      sizeBytes: meta.value.size || undefined,
      mimeType: lastFile.value?.type || undefined,
      orientation:
        meta.value.height > meta.value.width ? "vertical" : "horizontal",
      pollOptions:
        validPollOptions.length >= 2
          ? validPollOptions.map((o) => o.trim())
          : undefined,
      pollDuration:
        validPollOptions.length >= 2 ? pollDuration.value : undefined,
    });
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    window.location.href =
      result.kind === "video"
        ? watchPageRoute.query({ id: result.id }).url()
        : postPageRoute.query({ id: result.id }).url();
  } catch {
    error.value = "Публикация не удалась. Попробуй ещё раз.";
  } finally {
    submitting.value = false;
  }
}
</script>
