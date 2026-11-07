<template>
  <span
    class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 text-white/90"
    :class="sizeClass"
    :style="{ background: avatarBackground(hue, accent) }"
    :aria-label="name"
  >
    <span class="font-medium tracking-wide" :class="textClass">{{ initials(name) }}</span>
    <span class="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10"></span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { avatarBackground, initials } from '../shared/format'

const props = withDefaults(
  defineProps<{ name: string; hue: number; accent: number; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }>(),
  { size: 'sm' },
)

const sizeClass = computed(() => {
  if (props.size === 'xs') return 'h-6 w-6'
  if (props.size === 'sm') return 'h-9 w-9'
  if (props.size === 'md') return 'h-12 w-12'
  if (props.size === 'lg') return 'h-16 w-16'
  return 'h-24 w-24'
})

const textClass = computed(() => {
  if (props.size === 'xs') return 'text-[9px]'
  if (props.size === 'sm') return 'text-[11px]'
  if (props.size === 'md') return 'text-sm'
  if (props.size === 'lg') return 'text-lg'
  return 'text-2xl'
})
</script>
