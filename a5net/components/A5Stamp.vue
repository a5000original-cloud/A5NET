<template>
  <span
    class="inline-flex select-none items-center justify-center rounded-full border-2 font-display font-bold leading-none tracking-tight"
    :class="toneClass"
    :style="{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.34) + 'px' }"
    :title="title"
    :aria-label="title"
  >A5</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ size?: number; tone?: 'lime' | 'light' | 'ink'; title?: string }>(), {
  size: 32,
  tone: 'lime',
  title: 'A5NET',
})

const toneClass = computed(() => {
  if (props.tone === 'light') return 'border-white/50 text-white/80'
  if (props.tone === 'ink') return 'border-ink/60 text-ink/80'
  return 'border-lime/60 text-lime/90'
})
</script>
