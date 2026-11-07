<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole || 'member'" active="settings" />

    <main class="a5-shell pb-28 pt-8">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p class="a5-mono text-lime/80">досье · редактор</p>
          <h1 class="a5-display mt-3 text-4xl font-medium leading-tight">Настрой профиль</h1>
          <p class="mt-2 max-w-xl text-sm leading-relaxed text-moss">Ник, обложка, наклейки и закреп. Всё это увидят только участники A5NET.</p>
        </div>
        <a :href="profilePageRoute.query({ id: data.viewer.id }).url()" class="a5-btn !py-2 text-xs">Открыть профиль</a>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div class="space-y-5">
          <section class="a5-card p-5 sm:p-6">
            <p class="a5-mono text-[9px] text-moss">01 · личность</p>
            <div class="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
              <div class="flex flex-col items-center gap-2">
                <Avatar :name="name || data.profile.name" :hue="data.profile.avatarHue" :accent="data.profile.accentHue" :src="avatarPreview" size="xl" />
                <label class="a5-btn cursor-pointer !px-3 !py-1.5 text-[10px]">
                  {{ avatarUploading ? `${avatarPercent}%` : 'Сменить аватар' }}
                  <input type="file" class="hidden" accept="image/*" @change="uploadAvatar" />
                </label>
                <button v-if="avatarPreview" type="button" class="text-[10px] text-moss/60 hover:text-ember" @click="avatarPreview = ''; avatarHash = ''; removeAvatar = true">Убрать</button>
              </div>
              <div class="grid flex-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="a5-label" for="s-name">Имя</label>
                  <input id="s-name" v-model="name" class="a5-input" maxlength="40" />
                </div>
                <div>
                  <label class="a5-label" for="s-city">Город</label>
                  <input id="s-city" v-model="city" class="a5-input" maxlength="40" />
                </div>
                <div class="sm:col-span-2">
                  <label class="a5-label" for="s-handle">Ник · уникальный</label>
                  <div class="flex gap-2">
                    <div class="relative flex-1">
                      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-moss">@</span>
                      <input id="s-handle" v-model="handle" class="a5-input pl-7 font-mono lowercase" maxlength="24" @blur="checkName" />
                    </div>
                    <button type="button" class="a5-btn !px-3 text-xs" :disabled="checking" @click="checkName">Проверить</button>
                  </div>
                  <p v-if="handleStatus" class="mt-1 text-[10px]" :class="handleStatus.ok ? 'text-lime' : 'text-ember'">
                    {{ handleStatus.ok ? 'Свободен — забирай' : handleStatus.error }}
                  </p>
                  <p v-else class="mt-1 text-[10px] text-moss/50">3–24 символа. A5000 закреплён за владельцем.</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="a5-label" for="s-tagline">Строка профиля</label>
                  <input id="s-tagline" v-model="tagline" class="a5-input" maxlength="60" placeholder="Например: собираю плёнку и тишину" />
                </div>
                <div class="sm:col-span-2">
                  <label class="a5-label" for="s-bio">Биография</label>
                  <textarea id="s-bio" v-model="bio" class="a5-input min-h-[100px]" maxlength="300"></textarea>
                </div>
              </div>
            </div>
          </section>

          <section class="a5-card p-5 sm:p-6">
            <p class="a5-mono text-[9px] text-moss">02 · пространство</p>
            <div class="relative mt-5 overflow-hidden rounded-2xl border border-line">
              <div class="relative h-40 sm:h-48">
                <img v-if="coverPreview" :src="coverPreview" alt="" class="h-full w-full object-cover" :style="{ objectPosition: `50% ${coverPosition}%` }" />
                <div v-else class="h-full w-full" :style="{ background: coverBackground(data.profile.avatarHue) }"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent"></div>
                <label class="a5-btn absolute right-3 top-3 cursor-pointer !px-3 !py-1.5 text-[10px]">
                  {{ coverUploading ? `${coverPercent}%` : 'Сменить обложку' }}
                  <input type="file" class="hidden" accept="image/*" @change="uploadCover" />
                </label>
              </div>
            </div>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="a5-label">Положение обложки · {{ coverPosition }}%</label>
                <input v-model.number="coverPosition" type="range" min="0" max="100" class="w-full accent-[#c9f75a]" />
              </div>
              <div>
                <label class="a5-label">Акцент · {{ accentHue }}°</label>
                <input v-model.number="accentHue" type="range" min="0" max="360" class="w-full accent-[#c9f75a]" />
              </div>
            </div>
            <div class="mt-4">
              <p class="a5-label">Тема профиля</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in themes"
                  :key="option.id"
                  type="button"
                  class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] transition"
                  :class="theme === option.id ? 'border-lime/60 text-bone' : 'border-line text-moss hover:text-bone'"
                  @click="theme = option.id"
                >
                  <span class="h-2.5 w-2.5 rounded-full" :style="{ background: option.color }"></span>
                  {{ option.label }}
                </button>
              </div>
            </div>
          </section>

          <section class="a5-card p-5 sm:p-6">
            <div class="flex items-center justify-between">
              <p class="a5-mono text-[9px] text-moss">03 · наклейки</p>
              <span class="a5-mono text-[9px] text-moss/50">{{ stickers.length }} / 6</span>
            </div>
            <div class="mt-4 flex min-h-[46px] flex-wrap gap-2 rounded-xl border border-dashed border-line p-3">
              <button
                v-for="(sticker, index) in stickers"
                :key="sticker + index"
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel2 text-lg hover:border-ember/50"
                @click="removeSticker(index)"
              >{{ sticker }}</button>
              <span v-if="!stickers.length" class="self-center text-[11px] text-moss/50">Пока пусто. Выбери до шести.</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-1.5">
              <button
                v-for="sticker in palette"
                :key="sticker"
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg transition hover:border-lime/50 hover:bg-panel2"
                @click="addSticker(sticker)"
              >{{ sticker }}</button>
            </div>
          </section>

          <section class="a5-card p-5 sm:p-6">
            <p class="a5-mono text-[9px] text-moss">04 · ссылки и закреп</p>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="a5-label" for="s-links">Ссылки · по одной в строке</label>
                <textarea id="s-links" v-model="linksText" class="a5-input min-h-[100px] font-mono text-[11px]" placeholder="https://t.me/…&#10;https://bandcamp.com/…"></textarea>
              </div>
              <div>
                <label class="a5-label" for="s-pin">Закреплённый пост</label>
                <select id="s-pin" v-model="pinnedPostId" class="a5-input">
                  <option value="">Не закреплять</option>
                  <option v-for="post in data.posts" :key="post.id" :value="post.id">{{ post.kind === 'video' ? '▶' : post.kind === 'music' ? '♪' : '¶' }} {{ post.title }}</option>
                </select>
                <p class="mt-1 text-[10px] text-moss/50">Закреп показывается первым в профиле.</p>
              </div>
            </div>
          </section>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p v-if="error" class="text-xs text-ember">{{ error }}</p>
            <p v-else-if="saved" class="text-xs text-lime">Сохранено. Профиль обновлён.</p>
            <p v-else class="text-[11px] text-moss/50">Ник меняется раз в 14 дней.</p>
            <button type="button" class="a5-btn-primary" :disabled="saving || avatarUploading || coverUploading" @click="save">
              {{ saving ? 'Сохраняю…' : 'Сохранить профиль' }}
            </button>
          </div>
        </div>

        <aside class="lg:sticky lg:top-24 lg:self-start">
          <p class="a5-mono mb-3 text-[9px] text-moss">предпросмотр</p>
          <div class="overflow-hidden rounded-3xl border border-line/80 bg-panel/60">
            <div class="relative h-32">
              <img v-if="coverPreview" :src="coverPreview" alt="" class="h-full w-full object-cover" :style="{ objectPosition: `50% ${coverPosition}%` }" />
              <div v-else class="h-full w-full" :style="{ background: coverBackground(data.profile.avatarHue) }"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent"></div>
              <div class="absolute inset-x-0 top-0 flex justify-between p-3">
                <span class="a5-mono text-[8px] text-white/60">{{ theme }}</span>
                <span class="a5-mono text-[8px] text-white/60">A5NET</span>
              </div>
            </div>
            <div class="relative px-4 pb-5">
              <div class="-mt-8 flex items-end gap-3">
                <Avatar :name="name || data.profile.name" :hue="data.profile.avatarHue" :accent="accentHue" :src="avatarPreview" size="lg" class="ring-4 ring-panel" />
                <div class="pb-1">
                  <p class="a5-display text-lg leading-tight">{{ name || data.profile.name }}</p>
                  <p class="text-[10px] text-moss">@{{ handle || data.profile.handle }}</p>
                </div>
              </div>
              <p v-if="tagline" class="mt-3 text-[12px] text-bone/80">{{ tagline }}</p>
              <p class="mt-2 line-clamp-3 text-[11px] leading-relaxed text-moss">{{ bio }}</p>
              <div class="mt-3 flex flex-wrap gap-1">
                <span v-for="(sticker, index) in stickers" :key="index" class="text-base">{{ sticker }}</span>
              </div>
              <div class="mt-4 flex items-center gap-3 border-t border-line/60 pt-3 text-[9px] text-moss/60">
                <span>{{ data.profile.postsCount }} постов</span>
                <span>{{ data.profile.friendsCount }} друзей</span>
                <span class="ml-auto">{{ data.profile.followersCount }} читают</span>
              </div>
            </div>
          </div>
          <p class="mt-3 text-[10px] leading-relaxed text-moss/50">Ссылки открываются в новой вкладке. Наклейки видны только на твоём профиле.</p>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProfileSettingsData } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import Avatar from './Avatar.vue'
import { coverBackground } from '../shared/format'
import { uploadBlob } from '../shared/upload'
import { profileUpdateRoute } from '../api/profile/update'
import { profileCheckHandleRoute } from '../api/profile/check-handle'
import { profilePageRoute } from '../profile'

const props = defineProps<{ data: ProfileSettingsData }>()

const name = ref(props.data.profile.name)
const handle = ref(props.data.profile.handle)
const city = ref(props.data.profile.city === '—' ? '' : props.data.profile.city)
const bio = ref(props.data.profile.bio)
const tagline = ref(props.data.profile.tagline)
const linksText = ref(props.data.profile.links.join('\n'))
const stickers = ref<string[]>([...props.data.profile.stickers])
const theme = ref(props.data.profile.profileTheme)
const accentHue = ref(props.data.profile.accentHue)
const coverPosition = ref(props.data.profile.coverPosition)
const pinnedPostId = ref(props.data.profile.pinnedPostId ?? '')

const avatarPreview = ref(props.data.profile.avatarUrl ?? '')
const coverPreview = ref(props.data.profile.coverUrl ?? '')
const avatarHash = ref('')
const coverHash = ref('')
const removeAvatar = ref(false)
const removeCover = ref(false)
const avatarUploading = ref(false)
const coverUploading = ref(false)
const avatarPercent = ref(0)
const coverPercent = ref(0)
const saving = ref(false)
const checking = ref(false)
const saved = ref(false)
const error = ref('')
const handleStatus = ref<{ ok: boolean; error?: string } | null>(null)

const themes = [
  { id: 'graphite' as const, label: 'графит', color: '#252b21' },
  { id: 'lime' as const, label: 'лайм', color: '#c9f75a' },
  { id: 'violet' as const, label: 'фиалка', color: '#b7a6ff' },
  { id: 'ember' as const, label: 'янтарь', color: '#ff8a5c' },
  { id: 'ice' as const, label: 'лёд', color: '#8fd8d2' },
]

const palette = ['✦', '◐', '☾', '✶', '⟡', '⌁', '♒', '⚑', '▣', '⌘', '☄', '❖', '◈', '⚡', '☕', '🎧', '📼', '🪩', '🌫️', '🛰️']

const currentThemeColor = computed(() => themes.find(option => option.id === theme.value)?.color ?? '#252b21')

function addSticker(sticker: string) {
  if (stickers.value.length >= 6) return
  stickers.value = [...stickers.value, sticker]
}

function removeSticker(index: number) {
  stickers.value = stickers.value.filter((_, position) => position !== index)
}

async function uploadAvatar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarUploading.value = true
  avatarPercent.value = 0
  try {
    const result = await uploadBlob(ctx, file, file.name, progress => {
      avatarPercent.value = progress.percent
    })
    avatarHash.value = result.hash
    avatarPreview.value = result.url
    removeAvatar.value = false
  } catch {
    error.value = 'Аватар не загрузился.'
  } finally {
    avatarUploading.value = false
  }
}

async function uploadCover(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverUploading.value = true
  coverPercent.value = 0
  try {
    const result = await uploadBlob(ctx, file, file.name, progress => {
      coverPercent.value = progress.percent
    })
    coverHash.value = result.hash
    coverPreview.value = result.url
    removeCover.value = false
  } catch {
    error.value = 'Обложка не загрузилась.'
  } finally {
    coverUploading.value = false
  }
}

async function checkName() {
  checking.value = true
  handleStatus.value = null
  try {
    const result = await profileCheckHandleRoute.query({ handle: handle.value }).run(ctx)
    handleStatus.value = { ok: result.ok, error: result.error }
  } catch {
    handleStatus.value = { ok: false, error: 'Не удалось проверить ник.' }
  } finally {
    checking.value = false
  }
}

async function save() {
  error.value = ''
  saved.value = false
  saving.value = true
  try {
    const result = await profileUpdateRoute.run(ctx, {
      name: name.value,
      handle: handle.value,
      city: city.value,
      bio: bio.value,
      tagline: tagline.value,
      links: linksText.value.split('\n').map(line => line.trim()).filter(Boolean),
      stickers: stickers.value,
      profileTheme: theme.value,
      accentHue: accentHue.value,
      coverPosition: coverPosition.value,
      pinnedPostId: pinnedPostId.value,
      avatarHash: avatarHash.value || undefined,
      coverHash: coverHash.value || undefined,
      removeAvatar: removeAvatar.value || undefined,
      removeCover: removeCover.value || undefined,
    })
    if (!result.ok) {
      error.value = result.error
      return
    }
    saved.value = true
    window.setTimeout(() => {
      window.location.href = profilePageRoute.query({ id: props.data.viewer.id }).url()
    }, 500)
  } catch {
    error.value = 'Не удалось сохранить профиль.'
  } finally {
    saving.value = false
  }
}

void currentThemeColor
</script>
