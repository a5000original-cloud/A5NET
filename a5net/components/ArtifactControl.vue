<template>
  <section class="space-y-4">
    <!-- Header -->
    <div
      class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4 sm:p-5"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/15"
        >
          <svg
            class="h-5 w-5 text-amber"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18.75"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-base font-medium text-bone">Артефакты</h2>
          <p class="text-[11px] text-moss/60">выдача и отзыв предметов</p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1fr_340px]">
      <!-- Item Grid -->
      <div class="space-y-4">
        <!-- Profile Input -->
        <div
          class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4"
        >
          <label class="a5-label" for="artifact-profile">Кому выдать</label>
          <input
            id="artifact-profile"
            v-model="profileInput"
            class="a5-input !py-3 font-mono text-[12px]"
            placeholder="@handle или ID профиля"
            @input="emit('profile-input', profileInput)"
          />
        </div>

        <!-- Visual Card Grid -->
        <div
          class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4"
        >
          <h3 class="text-sm font-medium text-bone mb-3">Выберите предмет</h3>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <template v-if="items.length">
              <button
                v-for="item in items"
                :key="item.id"
                type="button"
                class="group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300 active:scale-95 touch-manipulation"
                :class="
                  selectedItem?.id === item.id
                    ? 'border-violet/60 bg-violet/10 shadow-lg shadow-violet/10 scale-[1.02]'
                    : 'border-line/50 bg-panel2/40 hover:border-violet/30 hover:scale-[1.03] hover:shadow-lg'
                "
                @click="
                  selectedItem = item;
                  emit('selectItem', item);
                "
              >
                <!-- Rarity glow -->
                <div
                  class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  :style="{ background: rarityGlow(item.rarity) }"
                ></div>

                <!-- Icon -->
                <div class="relative z-10">
                  <span class="text-3xl">{{ typeIcon(item.type) }}</span>
                </div>

                <!-- Name -->
                <p
                  class="relative z-10 mt-2 truncate text-[12px] font-medium text-bone"
                >
                  {{ item.name }}
                </p>

                <!-- Rarity badge -->
                <span
                  class="relative z-10 mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                  :class="rarityBadge(item.rarity)"
                >
                  {{ item.rarity }}
                </span>
              </button>
            </template>
            <div
              v-else
              class="col-span-full rounded-xl border-2 border-dashed border-line/40 p-8 text-center"
            >
              <p class="text-sm text-moss/60">Предметы ещё не загружены</p>
              <p class="mt-1 text-[11px] text-moss/40">
                Попробуйте обновить страницу
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-xl bg-lime px-6 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-lime/20 transition-all hover:bg-[#d8ff7c] hover:shadow-xl hover:shadow-lime/30 disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="!canIssue"
            @click="emit('issue')"
          >
            {{ loading ? "Выдаю..." : "✦ Выдать артефакт" }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl border border-line/60 bg-panel2/60 px-6 py-3.5 text-sm font-semibold text-bone transition-all hover:border-ember/40 hover:bg-ember/10 hover:text-ember disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="!canRevoke"
            @click="emit('revoke')"
          >
            Забрать
          </button>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember"
        >
          {{ error }}
        </div>
      </div>

      <!-- Preview Panel -->
      <div
        class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-5"
      >
        <h3 class="text-sm font-medium text-bone mb-4">Предпросмотр</h3>

        <!-- Selected item preview -->
        <div
          v-if="selectedItem"
          class="mb-5 rounded-xl border border-line/50 bg-panel2/30 p-4"
        >
          <div class="flex items-center gap-3">
            <span class="text-4xl">{{ typeIcon(selectedItem.type) }}</span>
            <div>
              <p class="text-sm font-medium text-bone">
                {{ selectedItem.name }}
              </p>
              <p class="text-[11px] text-moss/60">
                {{ selectedItem.description }}
              </p>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <span
              class="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase"
              :class="rarityBadge(selectedItem.rarity)"
            >
              {{ selectedItem.rarity }}
            </span>
            <span class="text-[10px] text-moss/50">{{
              animLabel(selectedItem.animationType)
            }}</span>
          </div>
        </div>

        <!-- Avatar preview with animation — FULL POST MOCKUP -->
        <div
          class="rounded-2xl border border-line/90 bg-panel/80 shadow-lift backdrop-blur-sm overflow-hidden"
          :class="previewCardClass"
          :style="previewCardStyle"
        >
          <!-- Post header with avatar -->
          <div class="flex items-start gap-3 p-4 pb-0">
            <div class="relative">
              <div
                class="h-10 w-10 rounded-full flex items-center justify-center bg-panel2 text-sm font-medium text-bone ring-2 ring-ink transition-all duration-300"
                :class="[avatarRingClass, previewAnimationClass]"
                :style="avatarGlowStyle"
              >
                {{ profileInitial }}
              </div>
              <!-- Artifact animation ring -->
              <div
                v-if="selectedItem && selectedItem.animationType !== 'none'"
                class="absolute inset-0 rounded-full"
                :class="avatarRingClass"
              ></div>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="truncate text-sm font-medium text-bone">{{
                  profileInput || "Никнейм"
                }}</span>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold text-lime border border-lime/40 bg-lime/10"
                >
                  👑 A5000
                </span>
              </div>
              <span class="block truncate text-[11px] text-moss"
                >@{{ profileInput || "ник" }} · только что</span
              >
            </div>
          </div>

          <!-- Post body -->
          <div class="p-4">
            <h3 class="a5-display text-base font-medium leading-snug text-bone">
              Так выглядит мой новый статус в A5NET!
            </h3>
            <p class="mt-1.5 text-sm leading-relaxed text-moss">
              Каждый артефакт — это не просто значок. Это часть истории сети.
              Получи свой.
            </p>

            <!-- Topics -->
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                class="a5-chip"
                style="border-color: hsla(120, 60%, 60%, 0.35)"
                >технологии</span
              >
              <span
                class="a5-chip"
                style="border-color: hsla(270, 60%, 60%, 0.35)"
                >сообщество</span
              >
            </div>
          </div>

          <!-- Post footer -->
          <div
            class="flex items-center justify-between gap-2 border-t border-line/70 px-4 py-3 text-moss"
          >
            <div class="flex items-center gap-1">
              <span
                class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs hover:bg-panel2 text-lime"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.3"
                >
                  <path
                    d="M8 13.5s-5.5-3.2-5.5-7A3.2 3.2 0 018 4.2a3.2 3.2 0 015.5 2.3c0 3.8-5.5 7-5.5 7z"
                  />
                </svg>
                42
              </span>
              <span
                class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs hover:bg-panel2 hover:text-bone"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.3"
                >
                  <path d="M3 3.5h10v7H8l-3 2.5v-2.5H3v-7z" />
                </svg>
                12
              </span>
            </div>
            <span class="hidden font-mono text-[10px] text-moss/60 sm:inline"
              >128 просм.</span
            >
          </div>
        </div>

        <!-- Awards list -->
        <div v-if="awards.length" class="mt-5">
          <h4
            class="text-[10px] font-medium uppercase tracking-wider text-moss/50 mb-3"
          >
            Последние выдачи
          </h4>
          <div class="space-y-1.5 max-h-[180px] overflow-y-auto a5-scroll">
            <div
              v-for="award in awards.slice(0, 20)"
              :key="award.id"
              class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition hover:bg-panel2/50"
            >
              <span>{{ typeIcon(award.itemType) }}</span>
              <span class="truncate text-bone/80">{{ award.itemName }}</span>
              <span class="ml-auto text-[10px] text-moss/40">{{
                award.awardedAt
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { PremiumItem } from "../shared/types";

const props = defineProps<{
  items: PremiumItem[];
  awards: Array<{
    id: string;
    itemName: string;
    itemType: string;
    awardedAt: string;
  }>;
  error: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  issue: [];
  revoke: [];
  selectItem: [item: PremiumItem | null];
  "profile-input": [value: string];
}>();

const profileInput = ref("");
const selectedItem = ref<PremiumItem | null>(null);

const profileInitial = computed(() => {
  const val = profileInput.value;
  if (!val || val.length === 0) return "A";
  return val.charAt(0).toUpperCase();
});

const canIssue = computed(
  () => profileInput.value.trim() && selectedItem.value && !props.loading,
);
const canRevoke = computed(
  () => profileInput.value.trim() && selectedItem.value && !props.loading,
);

function typeIcon(type: string): string {
  const map: Record<string, string> = {
    seal: "🔏",
    shard: "💎",
    frame: "🖼",
    effect: "✨",
    sticker: "🏷",
  };
  return map[type] ?? "❓";
}

function animLabel(anim: string): string {
  const map: Record<string, string> = {
    pulse: "пульсация",
    rotate: "вращение",
    fog: "туман",
    shimmer: "блик",
    none: "нет",
  };
  return map[anim] ?? anim;
}

function rarityBadge(rarity: string): string {
  const map: Record<string, string> = {
    founder: "bg-[#bfff00]/15 text-[#bfff00] border border-[#bfff00]/30",
    legendary: "bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30",
    epic: "bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30",
    rare: "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30",
    common: "bg-line/20 text-moss/60 border border-line/30",
  };
  return map[rarity] ?? "bg-line/20 text-moss/60";
}

function rarityGlow(rarity: string): string {
  const map: Record<string, string> = {
    founder:
      "radial-gradient(circle at center, rgba(191,255,0,0.12) 0%, transparent 70%)",
    legendary:
      "radial-gradient(circle at center, rgba(255,215,0,0.12) 0%, transparent 70%)",
    epic: "radial-gradient(circle at center, rgba(168,85,247,0.12) 0%, transparent 70%)",
    rare: "radial-gradient(circle at center, rgba(56,189,248,0.12) 0%, transparent 70%)",
    common:
      "radial-gradient(circle at center, rgba(148,163,184,0.08) 0%, transparent 70%)",
  };
  return map[rarity] ?? "";
}

const avatarGlowStyle = computed(() => {
  if (!selectedItem.value) return {};
  const effects: Record<string, string> = {
    founder:
      "0 0 20px #c9f75a, 0 0 40px #c9f75a, 0 0 60px rgba(201,247,90,0.5), inset 0 0 15px rgba(201,247,90,0.3)",
    legendary:
      "0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px rgba(255,215,0,0.5), inset 0 0 15px rgba(255,215,0,0.3)",
    epic: "0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 60px rgba(168,85,247,0.5), inset 0 0 15px rgba(168,85,247,0.3)",
    rare: "0 0 20px #38bdf8, 0 0 40px #38bdf8, 0 0 60px rgba(56,189,248,0.5), inset 0 0 15px rgba(56,189,248,0.3)",
  };
  return { boxShadow: effects[selectedItem.value.rarity] ?? "none" };
});

const avatarRingClass = computed(() => {
  if (!selectedItem.value) return "border-line/50";
  const map: Record<string, string> = {
    founder: "border-[#c9f75a] border-2",
    legendary: "border-[#ffd700] border-2",
    epic: "border-[#a855f7] border-2",
    rare: "border-[#38bdf8] border-2",
    common: "border-line/50",
  };
  return map[selectedItem.value.rarity] ?? "border-line/50";
});

const previewCardClass = computed(() => {
  if (!selectedItem.value) return "";
  const map: Record<string, string> = {
    founder: "border-[#c9f75a]/40",
    legendary: "border-[#ffd700]/40",
    epic: "border-[#a855f7]/40",
    rare: "border-[#38bdf8]/40",
    common: "border-line/90",
  };
  return map[selectedItem.value.rarity] ?? "border-line/90";
});

const previewCardStyle = computed(() => {
  if (!selectedItem.value) return {};
  const effects: Record<string, string> = {
    founder:
      "0 0 30px rgba(201,247,90,0.2), inset 0 0 30px rgba(201,247,90,0.05)",
    legendary:
      "0 0 30px rgba(255,215,0,0.2), inset 0 0 30px rgba(255,215,0,0.05)",
    epic: "0 0 30px rgba(168,85,247,0.2), inset 0 0 30px rgba(168,85,247,0.05)",
    rare: "0 0 30px rgba(56,189,248,0.2), inset 0 0 30px rgba(56,189,248,0.05)",
  };
  return { boxShadow: effects[selectedItem.value.rarity] ?? "none" };
});

const previewAnimationClass = computed(() => {
  if (!selectedItem.value) return "";
  return `artifact-anim-${selectedItem.value.rarity}`;
});

function selectItem(item: PremiumItem | null) {
  selectedItem.value = item;
  emit("selectItem", item);
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

/* === MAXIMUM VISUAL ARTIFACT ANIMATIONS === */

/* Founder: мощная пульсирующая неоновая лаймовая аура */
@keyframes founder-pulse {
  0%,
  100% {
    box-shadow:
      0 0 8px #c9f75a,
      0 0 20px #c9f75a,
      0 0 40px #c9f75a,
      0 0 70px rgba(201, 247, 90, 0.7),
      0 0 110px rgba(201, 247, 90, 0.4),
      0 0 160px rgba(201, 247, 90, 0.2),
      inset 0 0 20px rgba(201, 247, 90, 0.4);
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    box-shadow:
      0 0 15px #c9f75a,
      0 0 35px #c9f75a,
      0 0 65px #c9f75a,
      0 0 100px rgba(201, 247, 90, 0.9),
      0 0 150px rgba(201, 247, 90, 0.6),
      0 0 220px rgba(201, 247, 90, 0.35),
      inset 0 0 35px rgba(201, 247, 90, 0.6);
    transform: scale(1.12);
    filter: brightness(1.3);
  }
}

.artifact-anim-founder {
  animation: founder-pulse 1.8s ease-in-out infinite;
}

/* Legendary: вращающееся золотое переливающееся сияние */
@keyframes legendary-rotate {
  0% {
    box-shadow:
      0 0 10px #ffd700,
      0 0 25px #ffd700,
      0 0 50px rgba(255, 215, 0, 0.6),
      0 0 80px rgba(255, 215, 0, 0.3),
      inset 0 0 15px rgba(255, 215, 0, 0.3);
    filter: hue-rotate(0deg) brightness(1);
    transform: rotate(0deg) scale(1);
  }
  25% {
    box-shadow:
      0 0 20px #ffed4a,
      0 0 45px #ffd700,
      0 0 75px rgba(255, 237, 74, 0.7),
      0 0 120px rgba(255, 215, 0, 0.4),
      inset 0 0 25px rgba(255, 237, 74, 0.5);
    filter: hue-rotate(15deg) brightness(1.3);
    transform: rotate(90deg) scale(1.06);
  }
  50% {
    box-shadow:
      0 0 10px #ffd700,
      0 0 25px #ffd700,
      0 0 50px rgba(255, 215, 0, 0.6),
      0 0 80px rgba(255, 215, 0, 0.3),
      inset 0 0 15px rgba(255, 215, 0, 0.3);
    filter: hue-rotate(0deg) brightness(1);
    transform: rotate(180deg) scale(1);
  }
  75% {
    box-shadow:
      0 0 20px #e6c200,
      0 0 45px #ffd700,
      0 0 75px rgba(230, 194, 0, 0.7),
      0 0 120px rgba(255, 215, 0, 0.4),
      inset 0 0 25px rgba(230, 194, 0, 0.5);
    filter: hue-rotate(-15deg) brightness(1.3);
    transform: rotate(270deg) scale(1.06);
  }
  100% {
    box-shadow:
      0 0 10px #ffd700,
      0 0 25px #ffd700,
      0 0 50px rgba(255, 215, 0, 0.6),
      0 0 80px rgba(255, 215, 0, 0.3),
      inset 0 0 15px rgba(255, 215, 0, 0.3);
    filter: hue-rotate(0deg) brightness(1);
    transform: rotate(360deg) scale(1);
  }
}

.artifact-anim-legendary {
  animation: legendary-rotate 3s linear infinite;
}

/* Epic: клубящийся фиолетовый туман с радиальным градиентом */
@keyframes epic-fog {
  0%,
  100% {
    box-shadow:
      0 0 10px #a855f7,
      0 0 30px #a855f7,
      0 0 60px rgba(168, 85, 247, 0.7),
      0 0 100px rgba(168, 85, 247, 0.4),
      0 0 150px rgba(126, 34, 206, 0.2),
      inset 0 0 25px rgba(168, 85, 247, 0.5);
    opacity: 0.8;
    filter: brightness(0.9);
  }
  33% {
    box-shadow:
      0 0 20px #c084fc,
      0 0 50px #a855f7,
      0 0 85px rgba(192, 132, 252, 0.8),
      0 0 130px rgba(168, 85, 247, 0.5),
      0 0 180px rgba(126, 34, 206, 0.3),
      inset 0 0 40px rgba(192, 132, 252, 0.6);
    opacity: 1;
    filter: brightness(1.2);
  }
  66% {
    box-shadow:
      0 0 15px #7c3aed,
      0 0 40px #7c3aed,
      0 0 70px rgba(124, 58, 237, 0.8),
      0 0 110px rgba(126, 34, 206, 0.5),
      0 0 160px rgba(107, 33, 168, 0.3),
      inset 0 0 30px rgba(124, 58, 237, 0.5);
    opacity: 0.9;
    filter: brightness(1);
  }
  50% {
    box-shadow:
      0 0 25px #a855f7,
      0 0 55px #a855f7,
      0 0 90px rgba(168, 85, 247, 0.9),
      0 0 140px rgba(168, 85, 247, 0.6),
      0 0 200px rgba(126, 34, 206, 0.35),
      inset 0 0 45px rgba(168, 85, 247, 0.7);
    opacity: 1;
    filter: brightness(1.4);
  }
}

.artifact-anim-epic {
  animation: epic-fog 2.2s ease-in-out infinite;
}

/* Rare: мощное плавное голубое свечение */
@keyframes rare-glow {
  0%,
  100% {
    box-shadow:
      0 0 8px #38bdf8,
      0 0 20px #38bdf8,
      0 0 40px rgba(56, 189, 248, 0.6),
      0 0 70px rgba(56, 189, 248, 0.3),
      inset 0 0 12px rgba(56, 189, 248, 0.3);
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    box-shadow:
      0 0 18px #38bdf8,
      0 0 40px #38bdf8,
      0 0 70px rgba(56, 189, 248, 0.8),
      0 0 110px rgba(56, 189, 248, 0.5),
      0 0 150px rgba(14, 165, 233, 0.25),
      inset 0 0 25px rgba(56, 189, 248, 0.5);
    transform: scale(1.08);
    filter: brightness(1.25);
  }
}

.artifact-anim-rare {
  animation: rare-glow 2s ease-in-out infinite;
}

/* Common: тихое нейтральное свечение */
@keyframes common-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(148, 163, 184, 0.3);
  }
  50% {
    box-shadow: 0 0 10px rgba(148, 163, 184, 0.5);
  }
}

.artifact-anim-common {
  animation: common-glow 3s ease-in-out infinite;
}
</style>
