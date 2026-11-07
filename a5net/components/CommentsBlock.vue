<template>
  <section id="comments" class="mt-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="a5-display text-xl">Обсуждение <span class="text-moss">{{ count }}</span></h2>
      <span class="a5-mono text-[9px] text-moss/50">без шаблонов</span>
    </div>

    <form class="a5-card mb-5 p-4" @submit.prevent="send">
      <div class="flex gap-3">
        <Avatar :name="viewer.name" :hue="viewer.avatarHue" :accent="viewer.avatarAccent" :src="viewer.avatarUrl" size="sm" />
        <div class="flex-1">
          <textarea
            v-model="text"
            class="a5-input min-h-[76px] resize-y"
            maxlength="600"
            placeholder="Что зацепило? Конкретно, без «отличный пост»."
          ></textarea>
          <div class="mt-2 flex items-center justify-between">
            <p class="text-[11px] text-moss/60">{{ text.length }} / 600</p>
            <button type="submit" class="a5-btn-primary !py-2 text-xs" :disabled="sending || text.trim().length < 2">
              {{ sending ? 'Отправляю…' : 'Отправить' }}
            </button>
          </div>
        </div>
      </div>
      <p v-if="error" class="mt-2 text-xs text-ember">{{ error }}</p>
    </form>

    <div v-if="items.length" class="space-y-3">
      <article v-for="comment in items" :key="comment.id" class="a5-card p-4">
        <div class="flex items-start gap-3">
          <a :href="profilePageRoute.query({ id: comment.author.id }).url()">
            <Avatar :name="comment.author.name" :hue="comment.author.avatarHue" :accent="comment.author.avatarAccent" :src="comment.author.avatarUrl" size="sm" />
          </a>
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2">
              <a :href="profilePageRoute.query({ id: comment.author.id }).url()" class="text-sm font-medium text-bone hover:text-ember">{{ comment.author.name }}</a>
              <span class="text-[10px] text-moss/60">{{ comment.ago }}</span>
            </div>
            <p class="mt-1.5 text-sm leading-relaxed text-bone/85">{{ comment.text }}</p>
          </div>
        </div>
      </article>
    </div>
    <p v-else class="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-moss">
      Тишина. Первый голос задаст тон.
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AuthorCard, CommentItem } from '../shared/types'
import Avatar from './Avatar.vue'
import { postCommentRoute } from '../api/post/comment'
import { profilePageRoute } from '../profile'

const props = defineProps<{ postId: string; viewer: AuthorCard; initialComments: CommentItem[]; count: number }>()

const items = ref<CommentItem[]>(props.initialComments)
const count = ref(props.count)
const text = ref('')
const sending = ref(false)
const error = ref('')

async function send() {
  if (text.value.trim().length < 2 || sending.value) return
  sending.value = true
  error.value = ''
  try {
    const result = await postCommentRoute.run(ctx, { id: props.postId, text: text.value.trim() })
    if (!result.ok) {
      error.value = result.error
      return
    }
    items.value = [...items.value, result.comment]
    count.value = result.commentsCount
    text.value = ''
  } catch {
    error.value = 'Комментарий не отправился.'
  } finally {
    sending.value = false
  }
}
</script>
