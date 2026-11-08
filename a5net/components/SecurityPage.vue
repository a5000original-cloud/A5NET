<template>
  <div>
    <SiteHeader :viewer="data.viewer" role="owner" active="security" />

    <main class="a5-shell pb-28 pt-8">
      <p class="a5-mono text-lime/80">A5000 · только владелец</p>
      <h1 class="a5-display mt-3 text-4xl font-medium">Безопасность</h1>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-moss">
        A5 Pass — личный пароль поверх обычного входа. Новое устройство не попадёт в сеть, пока не введёт его или одноразовый код.
        Почта и номер хранятся только как резервные контакты: сам вход в Chatium управляется на стороне аккаунта.
      </p>

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div class="space-y-5">
          <section v-if="!enabled" class="a5-card p-5 sm:p-6">
            <p class="a5-mono text-[9px] text-moss">включить A5 Pass</p>
            <h2 class="a5-display mt-2 text-xl">Второй слой входа</h2>
            <p class="mt-2 text-[11px] leading-relaxed text-moss/70">После включения это устройство станет доверенным. Остальные устройства будут спрашивать пароль.</p>
            <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="enable">
              <div>
                <label class="a5-label" for="sp-pass">Личный пароль</label>
                <input id="sp-pass" v-model="passphrase" type="password" class="a5-input" autocomplete="new-password" />
              </div>
              <div>
                <label class="a5-label" for="sp-confirm">Ещё раз</label>
                <input id="sp-confirm" v-model="confirm" type="password" class="a5-input" autocomplete="new-password" />
              </div>
              <div>
                <label class="a5-label" for="sp-email">Резервная почта</label>
                <input id="sp-email" v-model="email" type="email" class="a5-input" placeholder="owner@…" />
              </div>
              <div>
                <label class="a5-label" for="sp-phone">Резервный номер</label>
                <input id="sp-phone" v-model="phone" class="a5-input" placeholder="+7…" />
              </div>
              <div class="sm:col-span-2">
                <p v-if="error" class="mb-2 text-[11px] text-ember">{{ error }}</p>
                <button type="submit" class="a5-btn-primary" :disabled="busy || passphrase.length < 6">
                  {{ busy ? 'Включаю…' : 'Включить A5 Pass' }}
                </button>
              </div>
            </form>
          </section>

          <section v-else class="a5-card p-5 sm:p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="a5-mono text-[9px] text-lime/70">A5 Pass включён</p>
                <h2 class="a5-display mt-1 text-xl">Вход защищён</h2>
              </div>
              <span class="a5-pill !text-lime/80 !border-lime/25">active</span>
            </div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-line bg-coal p-4">
                <p class="a5-mono text-[8px] text-moss">резервная почта</p>
                <p class="mt-1 text-sm text-bone">{{ data.recoveryEmail || 'не задана' }}</p>
              </div>
              <div class="rounded-xl border border-line bg-coal p-4">
                <p class="a5-mono text-[8px] text-moss">резервный номер</p>
                <p class="mt-1 text-sm text-bone">{{ data.recoveryPhone || 'не задан' }}</p>
              </div>
              <div class="rounded-xl border border-line bg-coal p-4">
                <p class="a5-mono text-[8px] text-moss">коды восстановления</p>
                <p class="mt-1 text-sm text-bone">{{ data.recoveryLeft }} осталось</p>
              </div>
              <div class="rounded-xl border border-line bg-coal p-4">
                <p class="a5-mono text-[8px] text-moss">доверенных устройств</p>
                <p class="mt-1 text-sm text-bone">{{ data.devices.length }}</p>
              </div>
            </div>

            <div class="mt-5">
              <p class="a5-label">Устройства</p>
              <div class="space-y-2">
                <div v-for="device in data.devices" :key="device.id" class="flex flex-wrap items-center gap-3 rounded-xl border border-line/70 px-3 py-2.5">
                  <span class="flex-1 text-[12px] text-bone">{{ device.label }}<span v-if="device.current" class="ml-2 text-[9px] text-lime">это устройство</span></span>
                  <span class="font-mono text-[9px] text-moss/50">{{ device.lastSeenAt.slice(0, 10) }}</span>
                  <button type="button" class="text-[10px] text-moss/50 underline hover:text-ember" :disabled="busy" @click="revoke(device.id)">отозвать</button>
                </div>
              </div>
            </div>

            <form class="mt-6 flex flex-col gap-2 border-t border-line/60 pt-4 sm:flex-row" @submit.prevent="disable">
              <input v-model="disablePass" type="password" class="a5-input" placeholder="Пароль A5 Pass" />
              <button type="submit" class="a5-btn !py-2 text-xs text-ember" :disabled="busy">Выключить A5 Pass</button>
            </form>
          </section>
        </div>

        <aside class="space-y-5">
          <section v-if="recoveryCodes.length" class="a5-card border-lime/30 p-5">
            <p class="a5-mono text-[9px] text-lime">сохрани коды</p>
            <p class="mt-2 text-[11px] leading-relaxed text-moss">Они показываются один раз. Каждый работает один раз, если пароль забыт.</p>
            <div class="mt-3 grid grid-cols-2 gap-1.5">
              <code v-for="code in recoveryCodes" :key="code" class="rounded-lg border border-line bg-coal px-2 py-1.5 font-mono text-[10px] text-bone">{{ code }}</code>
            </div>
            <button type="button" class="a5-btn mt-3 w-full text-xs" @click="copyCodes">Скопировать все</button>
          </section>

          <section class="a5-card p-5">
            <p class="a5-mono text-[9px] text-moss">важно</p>
            <p class="mt-2 text-[11px] leading-relaxed text-moss/70">
              A5 Pass защищает интерфейс A5NET. Почта и телефон самой учётной записи Chatium меняются в профиле платформы —
              здесь они хранятся только как резервные контакты для восстановления.
            </p>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AuthorCard } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import { securityEnableRoute } from '../api/security/enable'
import { securityDisableRoute } from '../api/security/disable'
import { securityRevokeRoute } from '../api/security/revoke'

const props = defineProps<{ data: { enabled: boolean; recoveryEmail: string; recoveryPhone: string; recoveryLeft: number; devices: Array<{ id: string; label: string; lastSeenAt: string; current: boolean }>; viewer: AuthorCard } }>()

const enabled = ref(props.data.enabled)
const passphrase = ref('')
const confirm = ref('')
const email = ref('')
const phone = ref('')
const disablePass = ref('')
const recoveryCodes = ref<string[]>([])
const busy = ref(false)
const error = ref('')

async function enable() {
  if (passphrase.value !== confirm.value) {
    error.value = 'Пароли не совпадают.'
    return
  }
  busy.value = true
  error.value = ''
  try {
    const result = await securityEnableRoute.run(ctx, {
      passphrase: passphrase.value,
      confirm: confirm.value,
      email: email.value,
      phone: phone.value,
    })
    if (!result.ok) {
      error.value = result.error
      return
    }
    recoveryCodes.value = result.recoveryCodes
    enabled.value = true
  } catch {
    error.value = 'Не удалось включить A5 Pass.'
  } finally {
    busy.value = false
  }
}

async function disable() {
  busy.value = true
  error.value = ''
  try {
    const result = await securityDisableRoute.run(ctx, { passphrase: disablePass.value })
    if (!result.ok) {
      error.value = result.error
      return
    }
    window.location.reload()
  } catch {
    error.value = 'Не удалось выключить A5 Pass.'
  } finally {
    busy.value = false
  }
}

async function revoke(id: string) {
  busy.value = true
  try {
    const result = await securityRevokeRoute.run(ctx, { id })
    if (result.ok) window.location.reload()
  } finally {
    busy.value = false
  }
}

async function copyCodes() {
  try {
    await navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
  } catch {
    // clipboard can be blocked
  }
}
</script>
