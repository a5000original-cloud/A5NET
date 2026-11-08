<template>
  <div :class="variant === 'menu' ? '' : 'inline-flex'">
    <button
      type="button"
      :class="variant === 'menu'
        ? 'block w-full px-4 py-3 text-left text-sm text-bone hover:bg-panel2'
        : 'a5-btn !py-2 text-xs'"
      @click="install"
    >Установить приложение</button>

    <div v-if="help" class="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 backdrop-blur sm:items-center" @click.self="help = false">
      <div class="a5-card w-full max-w-md p-6">
        <div class="flex items-center justify-between">
          <p class="a5-mono text-[9px] text-lime/80">A5NET · приложение</p>
          <button type="button" class="text-xs text-moss hover:text-bone" @click="help = false">Закрыть</button>
        </div>
        <h3 class="a5-display mt-3 text-2xl">Поставь A5NET на главный экран</h3>
        <div class="mt-4 space-y-3 text-[12px] leading-relaxed text-moss">
          <p><span class="text-bone">iPhone / iPad:</span> открой сайт в Safari → «Поделиться» → «На экран Домой».</p>
          <p><span class="text-bone">Android / Chrome:</span> меню ⋮ → «Установить приложение» или «Добавить на главный экран».</p>
          <p><span class="text-bone">Компьютер:</span> в адресной строке Chrome появится иконка установки; или меню → «Установить A5NET».</p>
        </div>
        <button type="button" class="a5-btn-primary mt-5 w-full" @click="help = false">Понял</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

withDefaults(defineProps<{ variant?: 'menu' | 'button' }>(), { variant: 'menu' })

const deferred = ref<BeforeInstallPromptEvent | null>(null)
const help = ref(false)
const standalone = ref(false)

onMounted(() => {
  standalone.value = window.matchMedia('(display-mode: standalone)').matches
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault()
    deferred.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    deferred.value = null
  })
})

async function install() {
  if (standalone.value) return
  if (deferred.value) {
    await deferred.value.prompt()
    await deferred.value.userChoice.catch(() => undefined)
    deferred.value = null
    return
  }
  help.value = true
}
</script>
