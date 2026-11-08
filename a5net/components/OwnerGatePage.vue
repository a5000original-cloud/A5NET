<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
    <div class="absolute inset-0" style="background: radial-gradient(70% 60% at 20% 10%, rgba(201,247,90,0.12), transparent 60%), radial-gradient(60% 60% at 90% 90%, rgba(183,166,255,0.10), transparent 60%)"></div>
    <div class="relative grid w-full max-w-4xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
      <div class="hidden lg:block">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lime text-sm font-bold text-ink">A5</span>
          <span class="a5-display text-xl">NET</span>
          <span class="a5-mono ml-2 text-[9px] text-lime/60">owner gate</span>
        </div>
        <h1 class="a5-display mt-8 text-5xl font-medium leading-[0.95]">Это твой<br />вход.</h1>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-moss">
          Новое устройство не пускается в A5NET без личного пароля. Обычная авторизация — только первый слой.
        </p>
        <div class="mt-8 flex items-center gap-3">
          <A5Stamp :size="40" class="opacity-70" />
          <p class="a5-mono text-[9px] leading-relaxed text-moss/50">A5 PASS · 2FA<br />только для A5000</p>
        </div>
      </div>

      <div class="a5-card a5-grain overflow-hidden">
        <div class="border-b border-line/70 p-6">
          <p class="a5-mono text-[9px] text-lime/70">A5 PASS</p>
          <h2 class="a5-display mt-2 text-2xl">Подтверди, что это ты</h2>
          <p class="mt-2 text-[11px] leading-relaxed text-moss">
            {{ data.email || data.phone ? `Резервные контакты: ${data.email || data.phone}.` : 'Резервные контакты не заданы.' }}
            Осталось кодов восстановления: {{ data.recoveryLeft }}.
          </p>
        </div>

        <div class="p-6">
          <div class="flex gap-1 rounded-full border border-line bg-coal p-1">
            <button type="button" class="flex-1 rounded-full px-3 py-2 text-xs" :class="mode === 'pass' ? 'bg-lime text-ink' : 'text-moss'" @click="mode = 'pass'">Пароль</button>
            <button type="button" class="flex-1 rounded-full px-3 py-2 text-xs" :class="mode === 'recovery' ? 'bg-lime text-ink' : 'text-moss'" @click="mode = 'recovery'">Код восстановления</button>
          </div>

          <form class="mt-5 space-y-4" @submit.prevent="submit">
            <div v-if="mode === 'pass'">
              <label class="a5-label" for="gate-pass">Личный пароль</label>
              <input id="gate-pass" v-model="passphrase" type="password" class="a5-input" autocomplete="current-password" placeholder="••••••••" />
            </div>
            <div v-else>
              <label class="a5-label" for="gate-code">Одноразовый код</label>
              <input id="gate-code" v-model="code" class="a5-input font-mono uppercase tracking-[0.18em]" placeholder="A5-XXXX-XXXX" />
            </div>
            <div>
              <label class="a5-label" for="gate-label">Название устройства</label>
              <input id="gate-label" v-model="label" class="a5-input" maxlength="80" placeholder="Например: ноутбук в студии" />
            </div>
            <p v-if="error" class="rounded-xl border border-ember/30 bg-ember/10 px-3 py-2 text-[11px] text-ember">{{ error }}</p>
            <button type="submit" class="a5-btn-primary w-full" :disabled="busy || (mode === 'pass' ? passphrase.length < 1 : code.length < 4)">
              {{ busy ? 'Проверяю…' : 'Открыть A5NET' }}
            </button>
          </form>

          <p class="mt-5 text-[10px] leading-relaxed text-moss/50">
            Если пароль забыт — используй код восстановления. После входа устройство запомнится на 30 дней.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import A5Stamp from './A5Stamp.vue'
import { securityUnlockRoute } from '../api/security/unlock'
import { securityRecoverRoute } from '../api/security/recover'

const props = defineProps<{ data: { back: string; email: string; phone: string; recoveryLeft: number } }>()

const mode = ref<'pass' | 'recovery'>('pass')
const passphrase = ref('')
const code = ref('')
const label = ref('Новое устройство')
const busy = ref(false)
const error = ref('')

async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    const result = mode.value === 'pass'
      ? await securityUnlockRoute.run(ctx, { passphrase: passphrase.value, label: label.value })
      : await securityRecoverRoute.run(ctx, { code: code.value, label: label.value })
    if (!result.ok) {
      error.value = result.error
      return
    }
    window.location.href = props.data.back
  } catch {
    error.value = 'Не удалось проверить. Попробуй ещё раз.'
  } finally {
    busy.value = false
  }
}
</script>
