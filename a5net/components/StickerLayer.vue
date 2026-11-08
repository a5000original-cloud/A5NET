<template>
  <div ref="layer" class="absolute inset-0" :class="editable ? 'z-20' : 'pointer-events-none z-10'">
    <div
      v-for="(sticker, index) in stickers"
      :key="sticker + index"
      class="absolute select-none"
      :class="positions[index]?.float ? 'a5-sticker-float' : ''"
      :style="{
        left: `${positions[index]?.x ?? 10}%`,
        top: `${positions[index]?.y ?? 20}%`,
        transform: `translate(-50%, -50%) scale(${positions[index]?.scale ?? 1}) rotate(${(index % 2 ? 1 : -1) * (5 + index * 2)}deg)`,
        touchAction: editable ? 'none' : undefined,
        cursor: editable ? 'grab' : undefined,
        zIndex: 10 + index,
        animationDelay: `${index * -0.8}s`,
      }"
      @pointerdown="startDrag($event, index)"
    >
      <img v-if="isImage(sticker)" :src="sticker" alt="" draggable="false" class="h-14 w-14 object-contain drop-shadow-2xl sm:h-16 sm:w-16" />
      <span v-else class="text-2xl drop-shadow-lg sm:text-3xl">{{ sticker }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { StickerPlacement } from '../shared/types'

const props = withDefaults(defineProps<{ stickers: string[]; layout?: StickerPlacement[]; editable?: boolean }>(), {
  layout: () => [],
  editable: false,
})
const emit = defineEmits<{ 'update:layout': [StickerPlacement[]] }>()

const layer = ref<HTMLElement | null>(null)
const positions = ref<StickerPlacement[]>(build())
let dragIndex = -1

function build(): StickerPlacement[] {
  return props.stickers.map((_, index) => props.layout?.[index] ?? {
    x: 10 + index * 13,
    y: 14 + (index % 3) * 20,
    scale: 1,
    float: index % 2 === 0,
  })
}

watch(() => props.stickers, () => {
  positions.value = build()
})

watch(() => props.layout, () => {
  if (props.layout?.length === props.stickers.length) positions.value = props.layout.map(item => ({ ...item }))
}, { deep: true })

function isImage(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function startDrag(event: PointerEvent, index: number) {
  if (!props.editable) return
  event.preventDefault()
  dragIndex = index
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}

function move(event: PointerEvent) {
  if (dragIndex < 0 || !layer.value) return
  const rect = layer.value.getBoundingClientRect()
  const x = Math.max(3, Math.min(97, ((event.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(5, Math.min(95, ((event.clientY - rect.top) / rect.height) * 100))
  positions.value = positions.value.map((item, index) => index === dragIndex ? { ...item, x, y } : item)
}

function stop() {
  dragIndex = -1
  window.removeEventListener('pointermove', move)
  window.removeEventListener('pointerup', stop)
  emit('update:layout', positions.value.map(item => ({ ...item })))
}
</script>
