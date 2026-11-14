<template>
  <section class="space-y-4">
    <!-- Header -->
    <div
      class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4 sm:p-5"
    >
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/15"
          >
            <svg
              class="h-5 w-5 text-violet"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-medium text-bone">Флот ботов</h2>
            <p class="text-[11px] text-moss/60">
              {{ bots.length }} ботов · {{ onlineCount }} онлайн
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-line/60 bg-panel2/60 px-3 py-2 text-[11px] font-medium text-moss transition-all hover:border-lime/40 hover:text-lime"
            @click="adjustBots(-10)"
          >
            −10
          </button>
          <button
            type="button"
            class="rounded-lg border border-line/60 bg-panel2/60 px-3 py-2 text-[11px] font-medium text-moss transition-all hover:border-lime/40 hover:text-lime"
            @click="adjustBots(10)"
          >
            +10
          </button>
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-[11px] font-semibold transition-all"
            :class="
              fleet.enabled
                ? 'bg-lime/15 text-lime hover:bg-lime/25'
                : 'bg-violet/15 text-violet hover:bg-violet/25'
            "
            @click="toggleFleet"
          >
            {{ fleet.enabled ? "Стоп" : "Старт" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bot List — Telegram style -->
    <div
      class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl overflow-hidden"
    >
      <div class="max-h-[420px] overflow-y-auto a5-scroll">
        <div
          v-for="bot in bots"
          :key="bot.id"
          class="group flex items-center gap-3 border-b border-line/40 px-4 py-3 transition-all hover:bg-panel2/60 last:border-b-0"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
            <Avatar
              :name="bot.name"
              :hue="bot.avatarHue"
              :accent="bot.avatarAccent"
              :src="bot.avatarUrl"
              size="sm"
            />
            <span
              class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink"
              :class="bot.enabled ? 'bg-lime' : 'bg-moss/30'"
            ></span>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="truncate text-sm font-medium text-bone">{{
                bot.name
              }}</span>
              <span v-if="bot.streakDays > 0" class="shrink-0 text-[10px]">
                🔥{{ bot.streakDays }}
              </span>
            </div>
            <p class="truncate text-[11px] text-moss/70">
              {{ bot.statusLabel }}
            </p>
          </div>

          <!-- Actions -->
          <div
            class="shrink-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <button
              type="button"
              class="rounded-lg p-1.5 text-moss/50 transition-all hover:bg-ember/10 hover:text-ember"
              :title="bot.enabled ? 'Забанить' : 'Разбанить'"
              @click="toggleBotBan(bot)"
            >
              <svg
                v-if="bot.enabled"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <svg
                v-else
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </button>
            <button
              type="button"
              class="rounded-lg p-1.5 text-moss/50 transition-all hover:bg-panel2 hover:text-bone"
              title="Настройки"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Event Feed -->
    <div
      class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4 sm:p-5"
    >
      <div class="flex items-center gap-2 mb-4">
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime/60"
          ></span>
          <span
            class="relative inline-flex h-2 w-2 rounded-full bg-lime"
          ></span>
        </span>
        <h3 class="text-sm font-medium text-bone">Живая лента</h3>
      </div>

      <div class="space-y-2 max-h-[280px] overflow-y-auto a5-scroll">
        <div
          v-for="(event, index) in liveEvents"
          :key="event.id + index"
          class="flex items-start gap-3 rounded-xl border border-line/40 bg-panel2/30 px-3 py-2.5 text-xs transition-all"
          :style="{ animationDelay: index * 60 + 'ms' }"
        >
          <Avatar
            :name="event.botName"
            :hue="event.botHue"
            :accent="120"
            size="xs"
          />
          <div class="min-w-0 flex-1">
            <span class="font-medium text-bone">{{ event.botName }}</span>
            <span class="text-moss/60"> · </span>
            <span class="text-moss/80">{{ event.actionText }}</span>
          </div>
          <span class="shrink-0 font-mono text-[10px] text-moss/40">{{
            event.ago
          }}</span>
        </div>

        <p v-if="!logs.length" class="py-8 text-center text-sm text-moss/40">
          события появятся, когда боты начнут работу
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { BotRow, FleetSettings } from "../shared/types";
import Avatar from "./Avatar.vue";

const props = defineProps<{
  bots: BotRow[];
  logs: Array<{
    id: string;
    botName: string;
    botHue: number;
    action: string;
    content: string;
    ago: string;
    status: string;
  }>;
  fleet: FleetSettings;
  onlineCount: number;
}>();

const emit = defineEmits<{
  toggleFleet: [];
  adjustBots: [delta: number];
  toggleBotBan: [botId: string];
}>();

// Transform logs into live events
const liveEvents = computed(() =>
  props.logs.slice(0, 30).map((log) => ({
    id: log.id,
    botName: log.botName,
    botHue: log.botHue,
    actionText:
      log.action === "POST"
        ? `опубликовал「${log.content.slice(0, 50)}」`
        : log.action === "COMMENT"
          ? `комментирует「${log.content.slice(0, 50)}」`
          : log.action === "LIKE"
            ? `лайкнул пост`
            : log.action === "FRIEND_REQUEST"
              ? `отправил заявку в друзья`
              : `${log.action.toLowerCase()} — ${log.content.slice(0, 40)}`,
    ago: log.ago,
  })),
);

function toggleFleet() {
  emit("toggleFleet");
}

function adjustBots(delta: number) {
  emit("adjustBots", delta);
}

function toggleBotBan(bot: BotRow) {
  emit("toggleBotBan", bot.id);
}
</script>

<style scoped>
.a5-scroll::-webkit-scrollbar {
  width: 4px;
}
.a5-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 99px;
}
.a5-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
