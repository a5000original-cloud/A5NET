<template>
  <article class="a5-card a5-card-hover overflow-hidden p-4 sm:p-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="a5-mono text-[9px] text-violet/80">{{ statusLabel }}</p>
        <h3 class="a5-display mt-1 text-base font-medium text-bone">{{ collab.title }}</h3>
      </div>
      <span class="a5-pill shrink-0 !text-[9px]">{{ collab.ago }}</span>
    </div>
    <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-moss">{{ collab.brief }}</p>

    <div class="mt-3 flex items-center justify-between gap-3">
      <div class="flex items-center">
        <Avatar
          v-for="person in visibleParticipants"
          :key="person.id"
          :name="person.name"
          :hue="person.avatarHue"
          :accent="person.avatarAccent" :src="person.avatarUrl"
          size="xs"
          class="-ml-1.5 border border-ink first:ml-0"
        />
        <span class="ml-2 text-[11px] text-moss">{{ collab.participants.length + 1 }} участн.</span>
      </div>

      <a
        v-if="collab.postId"
        :href="postPageRoute.query({ id: collab.postId }).url()"
        class="a5-btn-ghost !px-2 !text-[11px]"
      >Открыть</a>
    </div>

    <button
      type="button"
      class="mt-3 w-full rounded-full border px-3 py-2 text-xs font-medium transition"
      :class="joined ? 'border-lime/30 bg-lime/10 text-lime' : 'border-line text-moss hover:border-lime/40 hover:text-lime'"
      :disabled="joined || joining"
      @click="join"
    >
      {{ joined ? 'Ты в коллаборации' : joining ? 'Присоединяюсь…' : 'Присоединиться' }}
    </button>
    <p v-if="error" class="mt-2 text-[11px] text-ember">{{ error }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CollabCard } from '../shared/types'
import Avatar from './Avatar.vue'
import { collabJoinRoute } from '../api/collab/join'
import { postPageRoute } from '../post'

const props = defineProps<{ collab: CollabCard }>()

const joined = ref(props.collab.joined)
const joining = ref(false)
const error = ref('')

const statusLabel = computed(() => {
  if (props.collab.status === 'active') return 'коллаборация · в работе'
  if (props.collab.status === 'done') return 'коллаборация · завершена'
  return 'коллаборация · набор'
})

const visibleParticipants = computed(() => props.collab.participants.slice(0, 4))

async function join() {
  if (joined.value) return
  joining.value = true
  error.value = ''
  try {
    const result = await collabJoinRoute.run(ctx, { id: props.collab.id })
    if (!result.ok) {
      error.value = result.error
      return
    }
    joined.value = true
  } catch {
    error.value = 'Не удалось присоединиться.'
  } finally {
    joining.value = false
  }
}
</script>
