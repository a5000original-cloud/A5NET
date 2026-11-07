<template>
  <section class="a5-card overflow-hidden">
    <div class="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-5">
      <div class="flex items-center gap-3">
        <Avatar :name="viewer.name" :hue="viewer.avatarHue" :accent="viewer.avatarAccent" size="sm" />
        <div>
          <p class="text-sm font-medium text-bone">Новый пост</p>
          <p class="text-[11px] text-moss">Текст, видеоэтюд или трек — без хэштегов</p>
        </div>
      </div>
      <button type="button" class="a5-btn-ghost text-xs" @click="$emit('close')">Свернуть</button>
    </div>

    <div class="space-y-4 p-4 sm:p-5">
      <div class="flex gap-1 rounded-full border border-line bg-coal p-1">
        <button
          v-for="option in kinds"
          :key="option.value"
          type="button"
          class="flex-1 rounded-full px-3 py-2 text-xs font-medium transition"
          :class="kind === option.value ? 'bg-lime text-ink' : 'text-moss hover:text-bone'"
          @click="kind = option.value"
        >{{ option.label }}</button>
      </div>

      <div>
        <label class="a5-label" for="a5-title">Заголовок</label>
        <input id="a5-title" v-model="title" class="a5-input" maxlength="140" placeholder="О чём это?" />
      </div>

      <div>
        <label class="a5-label" for="a5-body">Текст</label>
        <textarea
          id="a5-body"
          v-model="body"
          class="a5-input min-h-[110px] resize-y"
          maxlength="600"
          :placeholder="bodyPlaceholder"
        ></textarea>
        <p class="mt-1 text-right font-mono text-[10px] text-moss/60">{{ body.length }} / 600</p>
      </div>

      <div v-if="kind !== 'text'">
        <label class="a5-label">{{ kind === 'video' ? 'Видеофайл' : 'Аудиофайл' }}</label>
        <label class="a5-btn cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 11V3M4.5 6.5L8 3l3.5 3.5" stroke-linecap="round" /><path d="M2.5 12.5h11" stroke-linecap="round" /></svg>
          {{ uploading ? 'Загружаю…' : fileLabel }}
          <input type="file" class="hidden" :accept="kind === 'video' ? 'video/*' : 'audio/*'" @change="upload" />
        </label>
        <p class="mt-2 text-[11px] text-moss/70">Файл попадёт в хранилище A5NET. Видео лучше до 60 секунд.</p>
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
          >{{ topic.label }}</button>
        </div>
      </div>

      <div v-if="error" class="rounded-xl border border-ember/30 bg-ember/10 px-3 py-2 text-xs text-ember">{{ error }}</div>

      <div class="flex items-center justify-between gap-3">
        <p class="text-[11px] text-moss/70">Публикация появится в ленте сразу.</p>
        <button type="button" class="a5-btn-primary" :disabled="submitting || uploading" @click="submit">
          {{ submitting ? 'Публикую…' : 'Опубликовать' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { obtainStorageFilePutUrl } from '@app/storage'
import type { AuthorCard, TopicRef } from '../shared/types'
import Avatar from './Avatar.vue'
import { postCreateRoute } from '../api/post/create'
import { postPageRoute } from '../post'

const props = defineProps<{ viewer: AuthorCard; topicOptions: TopicRef[] }>()
defineEmits<{ close: [] }>()

const kinds = [
  { value: 'text' as const, label: 'Текст' },
  { value: 'video' as const, label: 'Видео' },
  { value: 'music' as const, label: 'Музыка' },
]

const kind = ref<'text' | 'video' | 'music'>('text')
const title = ref('')
const body = ref('')
const topics = ref<string[]>([])
const submitting = ref(false)
const uploading = ref(false)
const mediaHash = ref('')
const fileName = ref('')
const error = ref('')

const bodyPlaceholder = computed(() => {
  if (kind.value === 'video') return 'Что происходит в кадре и почему это стоит смотреть?'
  if (kind.value === 'music') return 'Пара слов о треке. Без рекламного тона.'
  return 'Мысль, наблюдение или вопрос. Живым языком.'
})

const fileLabel = computed(() => (fileName.value ? fileName.value : 'Выбрать файл'))

function toggleTopic(id: string) {
  if (topics.value.includes(id)) {
    topics.value = topics.value.filter(topic => topic !== id)
    return
  }
  if (topics.value.length >= 3) return
  topics.value = [...topics.value, id]
}

async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  uploading.value = true
  fileName.value = file.name
  try {
    const url = await obtainStorageFilePutUrl(ctx, { protected: false })
    const form = new FormData()
    form.append('Filedata', file)
    const response = await fetch(url, { method: 'POST', body: form })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const hash = (await response.text()).trim()
    if (!hash) throw new Error('empty hash')
    mediaHash.value = hash
  } catch {
    error.value = 'Не удалось загрузить файл. Попробуй ещё раз.'
    mediaHash.value = ''
  } finally {
    uploading.value = false
  }
}

async function submit() {
  error.value = ''
  if (title.value.trim().length < 3) {
    error.value = 'Нужен заголовок хотя бы из трёх символов.'
    return
  }
  if (body.value.trim().length < 2) {
    error.value = 'Добавь текст.'
    return
  }
  if (!topics.value.length) {
    error.value = 'Выбери хотя бы одну тему.'
    return
  }
  if (kind.value !== 'text' && !mediaHash.value) {
    error.value = 'Для видео и музыки нужен файл.'
    return
  }
  submitting.value = true
  try {
    const result = await postCreateRoute.run(ctx, {
      kind: kind.value,
      title: title.value.trim(),
      body: body.value.trim(),
      topics: topics.value,
      mediaHash: mediaHash.value || undefined,
    })
    if (!result.ok) {
      error.value = result.error
      return
    }
    window.location.href = postPageRoute.query({ id: result.id }).url()
  } catch {
    error.value = 'Публикация не удалась. Попробуй ещё раз.'
  } finally {
    submitting.value = false
  }
}
</script>
