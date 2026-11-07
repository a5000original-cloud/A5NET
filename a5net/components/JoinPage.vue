<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-12">
    <div class="a5-card a5-grain w-full max-w-lg overflow-hidden">
      <div class="border-b border-line/70 p-6 sm:p-8">
        <div class="flex items-center justify-between">
          <a :href="indexPageRoute.url()" class="flex items-baseline gap-2">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-xs font-bold text-ink">A5</span>
            <span class="a5-display text-lg">NET</span>
          </a>
          <span class="a5-mono text-[9px] text-lime/70">invite only</span>
        </div>
        <h1 class="a5-display mt-8 text-3xl font-medium leading-tight">Тебя позвали.</h1>
        <p class="mt-3 text-sm leading-relaxed text-moss">
          Остался один шаг: подтвердить код. Дальше — лента, музыка, видео и люди, которые не боятся тишины.
        </p>
      </div>

      <div class="p-6 sm:p-8">
        <div v-if="!data.signedIn" class="space-y-4">
          <div class="rounded-xl border border-line bg-coal p-4">
            <p class="a5-mono text-[9px] text-moss">приглашение</p>
            <p class="mt-1 font-mono text-lg tracking-[0.2em] text-bone">{{ data.code || '—' }}</p>
          </div>
          <a :href="signInHref" class="a5-btn-primary w-full">Войти и продолжить</a>
          <p class="text-[11px] leading-relaxed text-moss/60">После входа вернём сюда же, код подставим сам.</p>
        </div>

        <form v-else class="space-y-4" @submit.prevent="accept">
          <div>
            <label class="a5-label" for="join-code">Код приглашения</label>
            <input id="join-code" v-model="code" class="a5-input font-mono uppercase tracking-[0.18em]" placeholder="A5-XXXXXX" maxlength="40" />
          </div>
          <button type="submit" class="a5-btn-primary w-full" :disabled="busy || code.trim().length < 4">
            {{ busy ? 'Открываю дверь…' : 'Войти в A5NET' }}
          </button>
          <p v-if="error" class="rounded-xl border border-ember/30 bg-ember/10 px-3 py-2 text-xs text-ember">{{ error }}</p>
        </form>

        <div class="mt-6 border-t border-line/70 pt-4">
          <a :href="indexPageRoute.url()" class="a5-btn-ghost !px-0 text-xs">← На главную</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { feedPageRoute } from '../feed'
import { indexPageRoute } from '../index'
import { joinPageRoute } from '../join'
import { inviteRedeemRoute } from '../api/invite/redeem'

const props = defineProps<{ data: { code: string; signedIn: boolean } }>()

const code = ref(props.data.code)
const busy = ref(false)
const error = ref('')

const signInHref = computed(() => {
  const back = joinPageRoute.query({ code: props.data.code }).path()
  return `/s/auth/signin?back=${encodeURIComponent(back)}`
})

async function accept() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    const result = await inviteRedeemRoute.run(ctx, { code: code.value.trim() })
    if (!result.ok) {
      error.value = result.error
      return
    }
    window.location.href = feedPageRoute.url()
  } catch {
    error.value = 'Код не сработал. Проверь раскладку и попробуй ещё раз.'
  } finally {
    busy.value = false
  }
}
</script>
