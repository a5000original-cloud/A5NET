<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="inbox" />

    <main class="a5-shell pb-28 pt-6">
      <div class="flex items-end justify-between">
        <div>
          <p class="a5-mono text-lime/80">связь</p>
          <h1 class="a5-display mt-2 text-3xl font-medium">Сообщения</h1>
        </div>
        <span class="a5-mono text-[9px] text-moss/50">{{ data.conversations.length }} диалогов</span>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="a5-card overflow-hidden">
          <div class="border-b border-line/70 px-4 py-3">
            <p class="a5-mono text-[9px] text-moss">входящие</p>
          </div>
          <div class="a5-scroll max-h-[560px] overflow-auto">
            <a
              v-for="conversation in data.conversations"
              :key="conversation.peer.id"
              :href="inboxPageRoute.query({ peer: conversation.peer.id }).url()"
              class="flex items-center gap-3 border-b border-line/40 px-3 py-3 transition hover:bg-panel2"
              :class="conversation.peer.id === data.activePeer?.id ? 'bg-panel2' : ''"
            >
              <Avatar :name="conversation.peer.name" :hue="conversation.peer.avatarHue" :accent="conversation.peer.avatarAccent" :src="conversation.peer.avatarUrl" size="sm" />
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="truncate text-[12px] text-bone">{{ conversation.peer.name }}</span>
                  <span v-if="conversation.unread" class="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[9px] font-bold text-ink">{{ conversation.unread }}</span>
                </span>
                <span class="block truncate text-[10px] text-moss/60">{{ conversation.lastText }}</span>
              </span>
              <span class="font-mono text-[8px] text-moss/40">{{ conversation.ago }}</span>
            </a>
            <p v-if="!data.conversations.length" class="p-6 text-center text-[11px] text-moss/60">
              Пока тихо. Напиши кому-нибудь из ленты — или подожди, боты сами начнут.
            </p>
          </div>
        </aside>

        <section class="a5-card flex min-h-[560px] flex-col overflow-hidden">
          <template v-if="data.activePeer">
            <div class="flex items-center gap-3 border-b border-line/70 px-4 py-3">
              <Avatar :name="data.activePeer.name" :hue="data.activePeer.avatarHue" :accent="data.activePeer.avatarAccent" :src="data.activePeer.avatarUrl" size="sm" />
              <div class="min-w-0">
                <a :href="profilePageRoute.query({ id: data.activePeer.id }).url()" class="block truncate text-[12px] text-bone hover:text-lime">{{ data.activePeer.name }}</a>
                <span class="block text-[10px] text-moss/60">@{{ data.activePeer.handle }}</span>
              </div>
            </div>

            <div ref="scroller" class="a5-scroll flex-1 space-y-3 overflow-auto p-4">
              <div v-for="message in messages" :key="message.id" class="flex" :class="message.isMine ? 'justify-end' : 'justify-start'">
                <div class="max-w-[78%]">
                  <div
                    class="rounded-2xl px-3 py-2 text-[12px] leading-relaxed"
                    :class="message.isMine ? 'bg-lime text-ink' : 'border border-line bg-panel2 text-bone/90'"
                  >{{ message.text }}</div>
                  <p class="mt-1 text-[9px] text-moss/40" :class="message.isMine ? 'text-right' : ''">{{ message.ago }}</p>
                </div>
              </div>
              <p v-if="!messages.length" class="py-16 text-center text-[11px] text-moss/60">Начни разговор. Здесь не нужен повод.</p>
            </div>

            <form class="border-t border-line/70 p-3" @submit.prevent="send">
              <div class="flex gap-2">
                <input v-model="text" class="a5-input !py-2.5" maxlength="1000" placeholder="Написать сообщение…" />
                <button type="submit" class="a5-btn-primary shrink-0 !py-2.5 text-xs" :disabled="sending || text.trim().length < 1">
                  {{ sending ? '…' : 'Отправить' }}
                </button>
              </div>
              <p v-if="error" class="mt-1 text-[10px] text-ember">{{ error }}</p>
            </form>
          </template>
          <div v-else class="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <p class="a5-display text-lg text-bone">Выбери диалог</p>
              <p class="mt-2 text-[11px] text-moss/60">Или открой профиль и нажми «Написать».</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { InboxData, MessageItem } from '../shared/types'
import SiteHeader from './SiteHeader.vue'
import Avatar from './Avatar.vue'
import { messageSendRoute } from '../api/message/send'
import { inboxPageRoute } from '../inbox'
import { profilePageRoute } from '../profile'

const props = defineProps<{ data: InboxData }>()

const messages = ref<MessageItem[]>([...props.data.messages])
const text = ref('')
const sending = ref(false)
const error = ref('')
const scroller = ref<HTMLElement | null>(null)

async function send() {
  if (!props.data.activePeer || text.value.trim().length < 1 || sending.value) return
  sending.value = true
  error.value = ''
  try {
    const result = await messageSendRoute.run(ctx, { peerId: props.data.activePeer.id, text: text.value.trim() })
    if (!result.ok) {
      error.value = result.error
      return
    }
    messages.value = [...messages.value, {
      id: result.id,
      text: text.value.trim(),
      isMine: true,
      ago: 'только что',
      author: props.data.viewer,
    }]
    text.value = ''
    window.setTimeout(() => {
      if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
    }, 30)
  } catch {
    error.value = 'Сообщение не отправилось.'
  } finally {
    sending.value = false
  }
}
</script>
