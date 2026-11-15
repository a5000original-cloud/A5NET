<template>
  <section class="space-y-4">
    <!-- Header -->
    <div
      class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4 sm:p-5"
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-base font-medium text-bone">Ивенты</h2>
          <p class="text-[11px] text-moss/60">
            челленджи и голосования сообщества
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1fr_380px]">
      <!-- Left: Forms and Active Events -->
      <div class="space-y-4">
        <!-- Challenge Form -->
        <div
          class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4"
        >
          <h3 class="text-sm font-medium text-bone mb-3">
            🏆 Запуск Челленджа
          </h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="a5-label" for="event-title">Название</label>
              <input
                id="event-title"
                v-model="challengeForm.title"
                class="a5-input !py-2.5 text-[12px]"
                placeholder="A5 Battle: Neon Dreams"
              />
            </div>
            <div>
              <label class="a5-label" for="event-hashtag">Хэштег</label>
              <input
                id="event-hashtag"
                v-model="challengeForm.hashtag"
                class="a5-input !py-2.5 font-mono text-[12px]"
                placeholder="#A5BATTLE"
              />
            </div>
          </div>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label class="a5-label" for="event-prize"
                >Призовой артефакт</label
              >
              <select
                id="event-prize"
                v-model="challengeForm.prizeItemId"
                class="a5-input !py-2.5 text-[11px]"
              >
                <option value="">Без приза</option>
                <option
                  v-for="item in premiumItems"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }} ({{ item.rarity }})
                </option>
              </select>
            </div>
            <div>
              <label class="a5-label" for="event-subs">Бонус подписчиков</label>
              <input
                id="event-subs"
                v-model.number="challengeForm.prizeSubscribers"
                type="number"
                min="0"
                class="a5-input !py-2.5 text-[12px]"
                placeholder="0"
              />
            </div>
          </div>
          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-violet px-6 py-3 text-sm font-semibold text-bone shadow-lg shadow-violet/20 transition-all hover:bg-violet/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="
              !challengeForm.title || !challengeForm.hashtag || challengeLoading
            "
            @click="createChallenge"
          >
            {{ challengeLoading ? "Запускаю..." : "🚀 Запустить Челлендж" }}
          </button>
        </div>

        <!-- Vote Form -->
        <div
          class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4"
        >
          <h3 class="text-sm font-medium text-bone mb-3">
            🗳️ Голосование за Артефакт
          </h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="a5-label" for="vote-title">Название</label>
              <input
                id="vote-title"
                v-model="voteForm.title"
                class="a5-input !py-2.5 text-[12px]"
                placeholder="Кому выдать Печать Основателя?"
              />
            </div>
            <div>
              <label class="a5-label" for="vote-prize">Призовой артефакт</label>
              <select
                id="vote-prize"
                v-model="voteForm.prizeItemId"
                class="a5-input !py-2.5 text-[11px]"
              >
                <option value="">Выбери артефакт</option>
                <option
                  v-for="item in premiumItems"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }} ({{ item.rarity }})
                </option>
              </select>
            </div>
          </div>
          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-amber/20 px-6 py-3 text-sm font-semibold text-amber shadow-lg shadow-amber/10 transition-all hover:bg-amber/30 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="!voteForm.title || !voteForm.prizeItemId || voteLoading"
            @click="createVote"
          >
            {{ voteLoading ? "Создаю..." : "🗳️ Выставить на Голосование" }}
          </button>
        </div>

        <!-- Active Events List -->
        <div
          v-if="activeEvents.length"
          class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4"
        >
          <h3 class="text-sm font-medium text-bone mb-3">Активные ивенты</h3>
          <div class="space-y-3">
            <div
              v-for="event in activeEvents"
              :key="event.id"
              class="rounded-xl border border-line/50 bg-panel2/30 p-4"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-sm font-medium text-bone">{{ event.title }}</p>
                  <p class="text-[11px] text-moss/60">
                    {{
                      event.eventType === "challenge"
                        ? "🏆 Челлендж"
                        : "🗳️ Голосование"
                    }}
                    · #{{ event.hashtag }}
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-lg border border-line/50 px-2 py-1 text-[10px] text-moss transition hover:border-ember/50 hover:text-ember"
                  @click="endEvent(event.id)"
                >
                  Завершить
                </button>
              </div>

              <!-- Vote Results -->
              <div
                v-if="event.eventType === 'vote' && event.voteResults"
                class="mt-3 space-y-2"
              >
                <div
                  v-for="result in event.voteResults.slice(0, 5)"
                  :key="result.profileId"
                  class="flex items-center gap-2"
                >
                  <span class="w-24 truncate text-[11px] text-bone">{{
                    result.name
                  }}</span>
                  <div
                    class="flex-1 h-2 overflow-hidden rounded-full bg-line/20"
                  >
                    <div
                      class="h-full rounded-full bg-violet transition-all duration-500"
                      :style="{ width: result.percent + '%' }"
                    ></div>
                  </div>
                  <span class="w-10 text-right text-[10px] font-mono text-moss"
                    >{{ result.votes }} ({{ result.percent }}%)</span
                  >
                </div>
                <p class="text-[10px] text-moss/50">
                  Всего голосов: {{ getEventTotalVotes(event) }}
                </p>

                <!-- Award Winner Button -->
                <button
                  type="button"
                  class="mt-2 w-full rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-lime/20 transition-all hover:bg-[#d8ff7c] disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="eventLoading === event.id"
                  @click="awardWinner(event)"
                >
                  {{
                    eventLoading === event.id
                      ? "Выдаю..."
                      : "🎁 Выдать Победителю"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Stats Panel -->
      <div
        class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-5"
      >
        <h3 class="text-sm font-medium text-bone mb-4">Статистика</h3>
        <div class="space-y-4">
          <div
            class="rounded-xl border border-line/50 bg-panel2/30 p-4 text-center"
          >
            <p class="a5-display text-2xl text-lime">
              {{
                activeEvents.filter((e) => e.eventType === "challenge").length
              }}
            </p>
            <p class="text-[11px] text-moss/60">Активных челленджей</p>
          </div>
          <div
            class="rounded-xl border border-line/50 bg-panel2/30 p-4 text-center"
          >
            <p class="a5-display text-2xl text-violet">
              {{ activeEvents.filter((e) => e.eventType === "vote").length }}
            </p>
            <p class="text-[11px] text-moss/60">Активных голосований</p>
          </div>
          <div
            class="rounded-xl border border-line/50 bg-panel2/30 p-4 text-center"
          >
            <p class="a5-display text-2xl text-amber">{{ totalEvents }}</p>
            <p class="text-[11px] text-moss/60">Всего ивентов</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { PremiumItem } from "../shared/types";
import {
  eventCreateRoute,
  eventListRoute,
  eventEndRoute,
} from "../api/events/create";
import { voteResultsRoute, voteAwardWinnerRoute } from "../api/events/vote";
import { premiumCatalogRoute } from "../api/premium/catalog";

const premiumItems = ref<PremiumItem[]>([]);
const activeEvents = ref<any[]>([]);
const challengeLoading = ref(false);
const voteLoading = ref(false);
const eventLoading = ref<string | null>(null);

const challengeForm = ref({
  title: "",
  hashtag: "",
  prizeItemId: "",
  prizeSubscribers: 0,
});

const voteForm = ref({
  title: "",
  prizeItemId: "",
});

const totalEvents = ref(0);

function getEventTotalVotes(event: any): number {
  if (!event.voteResults || !Array.isArray(event.voteResults)) return 0;
  return event.voteResults.reduce(
    (sum: number, r: { votes: number }) => sum + r.votes,
    0,
  );
}

async function loadEvents() {
  try {
    const result = await eventListRoute.run(ctx);
    if (result.ok) {
      activeEvents.value = result.events ?? [];
      totalEvents.value = activeEvents.value.length;

      // Load vote results for vote-type events
      for (const event of activeEvents.value) {
        if (event.eventType === "vote") {
          const voteResult = await voteResultsRoute
            .query({ eventId: event.id })
            .run(ctx);
          if (voteResult.ok) {
            const total = (
              voteResult.results as Array<{ votes: number }>
            ).reduce((s: number, r: { votes: number }) => s + r.votes, 0);
            event.voteResults = (
              voteResult.results as Array<{
                profileId: string;
                name: string;
                votes: number;
              }>
            ).map((r: { profileId: string; name: string; votes: number }) => ({
              ...r,
              percent: total > 0 ? Math.round((r.votes / total) * 100) : 0,
            }));
          }
        }
      }
    }
  } catch {
    // silent
  }
}

async function loadPremiumItems() {
  try {
    const result = await premiumCatalogRoute.query({}).run(ctx);
    premiumItems.value = result.items ?? [];
  } catch {
    premiumItems.value = [];
  }
}

async function createChallenge() {
  challengeLoading.value = true;
  try {
    const result = await eventCreateRoute.run(ctx, {
      title: challengeForm.value.title,
      hashtag: challengeForm.value.hashtag,
      eventType: "challenge",
      prizeItemId: challengeForm.value.prizeItemId || null,
      prizeSubscribers: challengeForm.value.prizeSubscribers,
    });
    if (result.ok) {
      challengeForm.value = {
        title: "",
        hashtag: "",
        prizeItemId: "",
        prizeSubscribers: 0,
      };
      await loadEvents();
    }
  } catch {
    // silent
  } finally {
    challengeLoading.value = false;
  }
}

async function createVote() {
  voteLoading.value = true;
  try {
    const result = await eventCreateRoute.run(ctx, {
      title: voteForm.value.title,
      hashtag: "VOTE",
      eventType: "vote",
      prizeItemId: voteForm.value.prizeItemId || null,
      prizeSubscribers: 0,
    });
    if (result.ok) {
      voteForm.value = { title: "", prizeItemId: "" };
      await loadEvents();
    }
  } catch {
    // silent
  } finally {
    voteLoading.value = false;
  }
}

async function endEvent(eventId: string) {
  try {
    await eventEndRoute.run(ctx, { eventId });
    await loadEvents();
  } catch {
    // silent
  }
}

async function awardWinner(event: any) {
  eventLoading.value = event.id;
  try {
    if (!event.voteResults || event.voteResults.length === 0) return;
    const winner = event.voteResults[0]; // Already sorted by votes desc
    const result = await voteAwardWinnerRoute.run(ctx, {
      eventId: event.id,
      winnerProfileId: winner.profileId,
    });
    if (result.ok) {
      await loadEvents();
    }
  } catch {
    // silent
  } finally {
    eventLoading.value = null;
  }
}

onMounted(() => {
  loadEvents();
  loadPremiumItems();
});
</script>
