<template>
  <div class="flex flex-wrap items-center gap-1">
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      class="flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition"
      :class="viewer === option.id ? 'border-lime/50 bg-lime/10 text-lime' : 'border-line/70 text-moss hover:border-lime/30 hover:text-bone'"
      :aria-label="option.label"
      @click="react(option.id)"
    >
      <span>{{ option.icon }}</span>
      <span v-if="counts[option.id]" class="font-mono text-[9px]">{{ counts[option.id] }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { postEmojiRoute } from '../api/post/emoji'

const props = defineProps<{ postId: string; counts: Record<string, number>; viewerEmoji: string | null }>()

const options = [
  { id: 'fire' as const, icon: '🔥', label: 'огонь' },
  { id: 'heart' as const, icon: '❤️', label: 'сердце' },
  { id: 'lol' as const, icon: '😂', label: 'смешно' },
  { id: 'wow' as const, icon: '😮', label: 'вау' },
  { id: 'sad' as const, icon: '😢', label: 'грустно' },
  { id: 'respect' as const, icon: '🫡', label: 'респект' },
]

const counts = ref<Record<string, number>>({ ...props.counts })
const viewer = ref<string | null>(props.viewerEmoji)
const busy = ref(false)

async function react(emoji: (typeof options)[number]['id']) {
  if (busy.value) return
  busy.value = true
  try {
    const result = await postEmojiRoute.run(ctx, { id: props.postId, emoji })
    if (result.ok) {
      counts.value = result.counts
      viewer.value = result.viewerEmoji
    }
  } catch {
    // keep state
  } finally {
    busy.value = false
  }
}
</script>
