<template>
  <div class="bg-black">
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="video" />
    <main class="h-[calc(100dvh-120px)] snap-y snap-mandatory overflow-y-auto a5-scroll md:h-[calc(100dvh-64px)]">
      <div v-for="post in data.items" :key="post.id" class="h-full w-full snap-start">
        <ShortSlide :post="post" />
      </div>
      <div v-if="!data.items.length" class="flex h-full items-center justify-center p-8 text-center text-sm text-moss">
        Вертикальных роликов пока нет. Загрузи первый в композере.
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { ShortsData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import ShortSlide from './ShortSlide.vue'

defineProps<{ data: ShortsData }>()
</script>
