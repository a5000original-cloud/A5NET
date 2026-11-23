<template>
  <span
    class="relative inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 text-white/90 overflow-hidden"
    :class="sizeClass"
    :style="src ? undefined : { background: avatarBackground(hue, accent) }"
    :aria-label="name"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <span
      v-else
      class="font-medium tracking-wide flex h-full w-full items-center justify-center"
      :class="textClass"
      >{{ initials(name) }}</span
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
  }>(),
  { size: "sm", src: null },
);

const sizeClass = computed(() => {
  if (props.size === "xs") return "h-6 w-6 text-[9px]";
  if (props.size === "sm") return "h-9 w-9 text-[11px]";
  if (props.size === "md") return "h-12 w-12 text-sm";
  if (props.size === "lg") return "h-16 w-16 text-lg";
  return "h-24 w-24 text-2xl";
});

const textClass = computed(() => "");
</script>
