<template>
  <span class="inline-flex items-center gap-1" :title="`хайп ${Math.round(score)}`">
    <span
      v-for="index in 4"
      :key="index"
      class="h-1.5 rounded-full transition-all"
      :class="index <= filled ? 'bg-lime' : 'bg-line'"
      :style="{ width: index <= filled ? '12px' : '7px' }"
    ></span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ score: number; level?: number }>()
const filled = computed(() => {
  const level = props.level ?? Math.min(1, props.score / 70)
  return Math.max(1, Math.min(4, Math.ceil(level * 4)))
})
</script>
