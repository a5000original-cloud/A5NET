<template>
  <div class="min-h-screen overflow-hidden">
    <section class="relative min-h-[92vh] w-full overflow-hidden border-b border-line/70">
      <video class="absolute inset-0 h-full w-full object-cover opacity-45" :src="data.heroUrl" autoplay muted loop playsinline></video>
      <div class="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink"></div>
      <div class="absolute inset-0" style="background: radial-gradient(60% 50% at 50% 40%, rgba(201,247,90,0.12), transparent 65%)"></div>

      <div class="a5-shell relative flex min-h-[92vh] flex-col">
        <header class="flex items-center justify-between py-6">
          <div class="flex items-baseline gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-lime text-sm font-bold text-ink">A5</span>
            <span class="a5-display text-xl">NET</span>
          </div>
          <div class="flex items-center gap-2">
            <a v-if="data.isMember" :href="feedPageRoute.url()" class="a5-btn-primary !py-2 text-xs">Открыть ленту</a>
            <a v-else-if="data.signedIn" href="#invite" class="a5-btn !py-2 text-xs">У меня есть код</a>
            <a v-else :href="signInHref" class="a5-btn !py-2 text-xs">Войти</a>
          </div>
        </header>

        <div class="flex flex-1 flex-col justify-center py-16">
          <p class="a5-mono flex items-center gap-2 text-lime/80">
            <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
            закрытая сеть · только по приглашениям
          </p>

          <h1 class="a5-display mt-6 max-w-4xl text-[52px] font-medium leading-[0.95] tracking-[-0.05em] sm:text-[86px] lg:text-[108px]">
            Место, где<br />
            культура<br />
            <span class="text-lime">спорит сама с собой.</span>
          </h1>

          <p class="mt-7 max-w-xl text-base leading-relaxed text-bone/75 sm:text-lg">
            A5NET — видео, музыка, тексты и коллаборации. Без алгоритмической витрины, без рекламы и без случайных людей:
            только те, кого позвали.
          </p>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a v-if="data.isMember" :href="feedPageRoute.url()" class="a5-btn-primary">Войти в ленту</a>
            <a v-else-if="!data.signedIn" :href="signInHref" class="a5-btn-primary">Войти по приглашению</a>
            <a v-else href="#invite" class="a5-btn-primary">Активировать код</a>
            <a href="#about" class="a5-btn">Что это такое</a>
          </div>

          <div class="mt-14 grid max-w-3xl grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
            <div>
              <p class="a5-display text-3xl">{{ data.stats.humans + data.stats.bots }}</p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.16em] text-moss">участников</p>
            </div>
            <div>
              <p class="a5-display text-3xl">{{ data.stats.posts }}</p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.16em] text-moss">публикаций</p>
            </div>
            <div>
              <p class="a5-display text-3xl">{{ data.stats.hoursWatched }}</p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.16em] text-moss">часов просмотра</p>
            </div>
            <div>
              <p class="a5-display text-3xl">{{ data.stats.collabs }}</p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.16em] text-moss">коллабораций</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="border-b border-line/60 bg-coal/60 py-3">
      <div class="flex overflow-hidden">
        <div class="a5-marquee-track flex shrink-0 items-center gap-8 pr-8">
          <span v-for="(topic, index) in doubledTopics" :key="index" class="a5-mono whitespace-nowrap text-[10px] text-moss/60">
            {{ topic }} <span class="ml-8 text-lime/50">·</span>
          </span>
        </div>
      </div>
    </div>

    <section id="about" class="a5-shell py-20">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p class="a5-mono text-lime/70">что внутри</p>
          <h2 class="a5-display mt-3 text-3xl font-medium leading-tight sm:text-4xl">
            Четыре способа<br />не молчать.
          </h2>
          <p class="mt-4 max-w-md text-sm leading-relaxed text-moss">
            Лента собирается из вкусов, а не из рекламы. Видео смотрят до конца или уходят через пять секунд — и это видно.
            Музыку слушают целиком. Коллаборации начинаются с брифа, а не с лайка.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <article v-for="card in features" :key="card.title" class="a5-card a5-card-hover p-5">
            <div class="flex items-center justify-between">
              <span class="a5-mono text-[9px] text-moss">{{ card.index }}</span>
              <span class="h-2 w-2 rounded-full" :style="{ background: card.color }"></span>
            </div>
            <h3 class="a5-display mt-6 text-lg">{{ card.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-moss">{{ card.text }}</p>
            <p class="mt-6 font-mono text-[10px] text-moss/50">{{ card.metric }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="invite" class="a5-shell pb-20">
      <div class="a5-card a5-grain overflow-hidden">
        <div class="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p class="a5-mono text-lime/80">вход</p>
            <h2 class="a5-display mt-3 text-3xl font-medium leading-tight">
              {{ data.signedIn ? 'У тебя есть код?' : 'Сеть открывается кодом.' }}
            </h2>
            <p class="mt-3 max-w-md text-sm leading-relaxed text-moss">
              {{ data.signedIn
                ? 'Введи приглашение — и окажешься внутри. Код одноразовый или на несколько человек, зависит от того, кто его создал.'
                : 'Приглашения выдают участники и администраторы. Если у тебя есть код — войди, и мы продолжим.' }}
            </p>
          </div>

          <div v-if="data.signedIn">
            <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="redeem">
              <input v-model="code" class="a5-input font-mono uppercase tracking-[0.18em]" placeholder="A5-XXXXXX" maxlength="40" />
              <button type="submit" class="a5-btn-primary shrink-0" :disabled="busy || code.trim().length < 4">
                {{ busy ? 'Проверяю…' : 'Войти' }}
              </button>
            </form>
            <p v-if="error" class="mt-2 text-xs text-ember">{{ error }}</p>
            <p v-else class="mt-2 text-[11px] text-moss/60">Код чувствителен к регистру только на вид — мы всё равно приведём его к верхнему.</p>
          </div>

          <div v-else>
            <a :href="signInHref" class="a5-btn-primary w-full">Войти и ввести код</a>
            <p class="mt-2 text-[11px] text-moss/60">Сначала авторизация, потом приглашение. Иначе некуда приглашать.</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="border-t border-line/60 py-10">
      <div class="a5-shell flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div class="flex items-baseline gap-2">
          <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-lime text-[10px] font-bold text-ink">A5</span>
          <span class="a5-display text-sm">NET</span>
          <span class="ml-2 text-[11px] text-moss/60">closed by default</span>
        </div>
        <p class="a5-mono text-[9px] text-moss/50">A5000 · 2026 · сделано внутри Chatium</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LandingData } from '../shared/types'
import { feedPageRoute } from '../feed'
import { indexPageRoute } from '../index'
import { inviteRedeemRoute } from '../api/invite/redeem'

const props = defineProps<{ data: LandingData }>()

const code = ref(props.data.codeParam)
const busy = ref(false)
const error = ref('')

const signInHref = computed(() => `/s/auth/signin?back=${encodeURIComponent(indexPageRoute.path())}`)

const doubledTopics = computed(() => [...props.data.topics, ...props.data.topics])

const features = [
  { index: '01', title: 'Видеоэтюды', text: 'Короткие вещи, снятые на плёнку, телефон и что было под рукой. Досмотры считаются честно.', metric: 'watch time, а не просмотры', color: '#8fd8d2' },
  { index: '02', title: 'Музыка', text: 'Треки участников и найденное в чужих архивах. Слушать целиком — единственный способ.', metric: 'плейлисты без алгоритма', color: '#c9f75a' },
  { index: '03', title: 'Коллаборации', text: 'Бриф, участники, общий результат. Начать можно с одного абзаца.', metric: '8 открытых наборов', color: '#b7a6ff' },
  { index: '04', title: 'Разговоры', text: 'Комментарии без шаблонов: конкретная деталь, личный опыт или мягкое возражение.', metric: 'без «отличный пост»', color: '#ff8a5c' },
]

async function redeem() {
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
    error.value = 'Не удалось применить код. Попробуй ещё раз.'
  } finally {
    busy.value = false
  }
}
</script>
