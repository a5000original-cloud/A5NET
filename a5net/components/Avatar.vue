<template>
  <span
    class="relative inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 text-white/90"
    :class="[sizeClass, isPremium ? 'premium-avatar founder' : '']"
    :style="src ? undefined : { background: avatarBackground(hue, accent) }"
    :aria-label="name"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full rounded-full object-cover"
    />
    <span
      v-else
      class="absolute inset-0 flex items-center justify-center font-medium leading-none"
      :class="textClass"
      >{{ initials(name) }}</span
    >
    <span
      v-if="isPremium"
      class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[8px] text-ink font-bold"
      >✓</span
    >
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { avatarBackground, initials } from "../shared/format";

const props = withDefaults(
  defineProps<{
    name: string;
    hue: number;
    accent: number;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    src?: string | null;
    isPremium?: boolean;
  }>(),
  { size: "sm", src: null, isPremium: false },
);

const sizeClass = computed(() => {
  if (props.size === "xs") return "h-6 w-6";
  if (props.size === "sm") return "h-9 w-9";
  if (props.size === "md") return "h-12 w-12";
  if (props.size === "lg") return "h-16 w-16";
  return "h-24 w-24";
});

const textClass = computed(() => {
  if (props.size === "xs") return "text-[9px]";
  if (props.size === "sm") return "text-[11px]";
  if (props.size === "md") return "text-sm";
  if (props.size === "lg") return "text-lg";
  return "text-2xl";
});
</script>
