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
          />
        </div>

        <!-- Visual Card Grid -->
        <div
          class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-4"
        >
          <h3 class="text-sm font-medium text-bone mb-3">Выберите предмет</h3>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="item in items"
              :key="item.id"
              type="button"
              class="group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300"
              :class="
                selectedItem?.id === item.id
                  ? 'border-violet/60 bg-violet/10 shadow-lg shadow-violet/10 scale-[1.02]'
                  : 'border-line/50 bg-panel2/40 hover:border-violet/30 hover:scale-[1.03] hover:shadow-lg'
              "
              @click="selectedItem = item"
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
              <p class="relative z-10 mt-2 text-[12px] font-medium text-bone">
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
                class="h-10 w-10 rounded-full flex items-center justify-center bg-panel2 text-sm font-medium text-bone ring-2 ring-ink"
                :class="avatarRingClass"
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

const previewAvatarClass = computed(() => {
  if (!selectedItem.value) return "border-line/50";
  const map: Record<string, string> = {
    founder: "border-[#bfff00]/50",
    legendary: "border-[#ffd700]/50",
    epic: "border-[#a855f7]/50",
    rare: "border-[#38bdf8]/50",
    common: "border-line/50",
  };
  return map[selectedItem.value.rarity] ?? "border-line/50";
});

const avatarRingClass = computed(() => {
  if (!selectedItem.value) return "border-line/50";
  const map: Record<string, string> = {
    founder: "border-[#bfff00]/50",
    legendary: "border-[#ffd700]/50",
    epic: "border-[#a855f7]/50",
    rare: "border-[#38bdf8]/50",
    common: "border-line/50",
  };
  return map[selectedItem.value.rarity] ?? "border-line/50";
});

const avatarGlowStyle = computed(() => {
  if (!selectedItem.value || selectedItem.value.animationType === "none")
    return {};
  const colors: Record<string, string> = {
    founder: "0 0 12px rgba(191,255,0,0.5)",
    legendary: "0 0 12px rgba(255,215,0,0.5)",
    epic: "0 0 12px rgba(168,85,247,0.5)",
    rare: "0 0 12px rgba(56,189,248,0.5)",
  };
  return { boxShadow: colors[selectedItem.value.animationType] ?? "none" };
});

const previewCardClass = computed(() => {
  if (!selectedItem.value) return "";
  const map: Record<string, string> = {
    founder: "border-lime/30",
    legendary: "border-amber/30",
    epic: "border-violet/30",
    rare: "border-sky/30",
    common: "border-line/90",
  };
  return map[selectedItem.value.rarity] ?? "border-line/90";
});

const previewCardStyle = computed(() => {
  if (!selectedItem.value) return {};
  const colors: Record<string, string> = {
    founder: "0 0 20px rgba(191,255,0,0.1)",
    legendary: "0 0 20px rgba(255,215,0,0.1)",
    epic: "0 0 20px rgba(168,85,247,0.1)",
    rare: "0 0 20px rgba(56,189,248,0.1)",
  };
  return { boxShadow: colors[selectedItem.value.animationType] ?? "none" };
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

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin-slow 3s linear infinite;
}
</style>
