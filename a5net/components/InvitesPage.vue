<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="invites" />

    <main class="a5-shell pb-24 pt-8">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p class="a5-mono text-lime/80">доступ</p>
          <h1 class="a5-display mt-3 text-4xl font-medium leading-tight">Приглашения</h1>
          <p class="mt-2 max-w-lg text-sm leading-relaxed text-moss">
            Каждый код — это чей-то вход. Сеть не должна расти быстрее, чем в ней появляются разговоры.
          </p>
        </div>
        <div class="flex gap-6">
          <div>
            <p class="a5-display text-2xl">{{ activeCount }}</p>
            <p class="text-[10px] uppercase tracking-wider text-moss">активных</p>
          </div>
          <div>
            <p class="a5-display text-2xl">{{ usedCount }}</p>
            <p class="text-[10px] uppercase tracking-wider text-moss">использовано</p>
          </div>
        </div>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section class="a5-card h-fit p-5">
          <p class="a5-mono text-[9px] text-moss">новый код</p>
          <form class="mt-4 space-y-4" @submit.prevent="create">
            <div>
              <label class="a5-label" for="invite-note">Для кого</label>
              <input id="invite-note" v-model="note" class="a5-input" maxlength="120" placeholder="Например: друзья A5000, первая волна" />
            </div>
            <div>
              <label class="a5-label" for="invite-uses">Сколько входов</label>
              <input id="invite-uses" v-model.number="maxUses" type="number" min="1" max="25" class="a5-input" />
            </div>
            <button type="submit" class="a5-btn-primary w-full" :disabled="busy">
              {{ busy ? 'Создаю…' : 'Создать приглашение' }}
            </button>
            <p v-if="error" class="text-xs text-ember">{{ error }}</p>
            <p v-else class="text-[11px] leading-relaxed text-moss/60">Код можно отправить ссылкой — человек попадёт сразу на форму входа.</p>
          </form>
        </section>

        <section>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="a5-display text-xl">Выданные коды</h2>
            <span class="a5-mono text-[9px] text-moss/60">{{ data.invites.length }}</span>
          </div>

          <div v-if="invites.length" class="space-y-3">
            <article v-for="invite in invites" :key="invite.id" class="a5-card p-4 sm:p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-mono text-lg tracking-[0.16em] text-bone">{{ invite.code }}</p>
                  <p class="mt-1 text-[11px] text-moss">{{ invite.note }} · {{ invite.ago }}</p>
                </div>
                <span
                  class="a5-pill !text-[9px]"
                  :class="invite.active ? '!text-lime/80 !border-lime/25' : '!text-moss/60'"
                >{{ invite.active ? 'активен' : 'закрыт' }}</span>
              </div>

              <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                    <div class="h-full rounded-full bg-lime" :style="{ width: Math.min(100, (invite.uses / invite.maxUses) * 100) + '%' }"></div>
                  </div>
                  <span class="font-mono text-[10px] text-moss">{{ invite.uses }} / {{ invite.maxUses }}</span>
                </div>
                <button type="button" class="a5-btn !px-3 !py-1.5 text-[11px]" :disabled="!invite.copyable" @click="copy(invite.code)">
                  {{ !invite.copyable ? 'Код скрыт' : copied === invite.code ? 'Ссылка скопирована' : 'Скопировать ссылку' }}
                </button>
              </div>
            </article>
          </div>

          <p v-else class="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-moss">
            Пока ни одного кода. Первый обычно уходит тому, с кем давно хотелось поговорить.
          </p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { InvitesData, InviteRow } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import { inviteCreateRoute } from '../api/invite/create'
import { joinPageRoute } from '../join'

const props = defineProps<{ data: InvitesData }>()

const invites = ref<InviteRow[]>(props.data.invites)
const note = ref('')
const maxUses = ref(1)
const busy = ref(false)
const error = ref('')
const copied = ref('')

const activeCount = computed(() => invites.value.filter(invite => invite.active).length)
const usedCount = computed(() => invites.value.reduce((sum, invite) => sum + invite.uses, 0))

async function create() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    const result = await inviteCreateRoute.run(ctx, { note: note.value.trim(), maxUses: maxUses.value })
    if (!result.ok) {
      error.value = result.error
      return
    }
    invites.value = [
      {
        id: result.id,
        code: result.code,
        note: note.value.trim() || 'Без комментария',
        maxUses: maxUses.value,
        uses: 0,
        active: true,
        createdAt: new Date().toISOString(),
        ago: 'только что',
        link: '',
        copyable: true,
      },
      ...invites.value,
    ]
    note.value = ''
  } catch {
    error.value = 'Код не создался.'
  } finally {
    busy.value = false
  }
}

async function copy(code: string) {
  if (!code || code.includes('•')) return
  const url = `${window.location.origin}${joinPageRoute.query({ code }).path()}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = code
    window.setTimeout(() => {
      copied.value = ''
    }, 2400)
  } catch {
    error.value = 'Браузер не дал скопировать. Код: ' + code
  }
}
</script>
