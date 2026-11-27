<template>
  <section class="relative">
    <!-- Loading -->
    <div v-if="loading" class="flex min-h-[320px] items-center justify-center">
      <div class="a5-mono text-sm text-moss/50">загрузка хранилища…</div>
    </div>
    <!-- Empty -->
    <p v-else-if="!items.length" class="py-16 text-center text-sm text-moss/50">
      Хранилище пусто.
    </p>
    <!-- Grid -->
    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="group relative overflow-hidden rounded-2xl transition-all duration-500"
        :class="[
          isAwarded(item.id)
            ? 'cursor-default'
            : 'cursor-default opacity-50 grayscale-[0.7] brightness-75',
          isAwarded(item.id) ? rarityGlow(item.rarity) : '',
        ]"
        @mouseenter="isAwarded(item.id) && (hoveredCard = item.id)"
        @mouseleave="hoveredCard = null"
      >
        <!-- Rarity border gradient -->
        <div
          class="absolute inset-0 rounded-2xl"
          :class="isAwarded(item.id) ? rarityBorder(item.rarity) : 'bg-line/20'"
        ></div>
        <!-- Card body -->
        <div
          class="relative flex flex-col rounded-2xl border border-line/30 bg-ink/70 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-line/50"
          :class="isAwarded(item.id) ? 'shadow-lg' : ''"
        >
          <!-- Image area -->
          <div
            class="relative flex aspect-square items-center justify-center overflow-hidden rounded-t-2xl"
            :class="
              isAwarded(item.id) ? rarityImageBg(item.rarity) : 'bg-coal/60'
            "
          >
            <!-- Shimmer overlay for legendary -->
            <div
              v-if="isAwarded(item.id) && item.rarity === 'legendary'"
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style="
                background-size: 200% 100%;
                animation: shimmer 3s ease-in-out infinite;
              "
            ></div>
            <!-- Pulsing overlay for founder -->
            <div
              v-if="isAwarded(item.id) && item.rarity === 'founder'"
              class="absolute inset-0 rounded-t-2xl"
              style="
                background: radial-gradient(
                  circle at center,
                  rgba(191, 255, 0, 0.08) 0%,
                  transparent 70%
                );
                animation: pulseGlow 2.5s ease-in-out infinite;
              "
            ></div>
            <!-- Image or icon -->
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="h-full w-full object-contain transition-all duration-500 group-hover:scale-110"
            />
            <span
              v-else
              class="text-5xl sm:text-6xl transition-all duration-500"
              :class="isAwarded(item.id) ? 'scale-100' : 'scale-90'"
              :style="{
                filter: isAwarded(item.id)
                  ? `drop-shadow(0 0 16px ${rarityColor(item.rarity)}55)`
                  : 'grayscale',
              }"
            >
              {{ typeIcon(item.type) }}
            </span>
            <!-- Awarded badge -->
            <span
              v-if="isAwarded(item.id)"
              class="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-lime/40 bg-ink/80 px-2.5 py-1 text-[9px] font-medium text-lime backdrop-blur-md transition-all duration-300"
              :style="{ boxShadow: '0 0 12px rgba(191,255,0,0.2)' }"
            >
              <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              в коллекции
            </span>
            <!-- Rarity indicator top-right -->
            <span
              v-if="isAwarded(item.id)"
              class="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider backdrop-blur-md"
              :class="rarityBadgeClass(item.rarity)"
            >
              {{ item.rarity }}
            </span>
          </div>
          <!-- Content -->
          <div class="p-4">
            <!-- Name -->
            <div class="flex items-start justify-between gap-2">
              <h3
                class="flex-1 text-[13px] font-medium leading-tight text-bone transition-colors duration-300"
                :class="isAwarded(item.id) ? 'text-bone' : 'text-moss/50'"
              >
                {{ item.name }}
              </h3>
            </div>
            <!-- Description -->
            <p
              class="mt-1.5 line-clamp-2 text-[11px] leading-relaxed transition-colors duration-300"
              :class="isAwarded(item.id) ? 'text-moss/70' : 'text-moss/40'"
            >
              {{ item.description }}
            </p>
            <!-- Type pill -->
            <div class="mt-3 flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-medium transition-all duration-300"
                :class="
                  isAwarded(item.id)
                    ? rarityPillClass(item.rarity)
                    : 'border-line/30 text-moss/40'
                "
              >
                <span class="text-[10px]">{{ typeIcon(item.type) }}</span>
                {{ typeLabel(item.type) }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { premiumCatalogRoute } from "../api/premium/catalog";

const props = defineProps<{ profileId?: string }>();

const items = ref<any[]>([]);
const loading = ref(true);
const hoveredCard = ref<string | null>(null);

const typeMap: Record<string, { label: string; icon: string }> = {
  seal: { label: "Печать", icon: "🔏" },
  shard: { label: "Осколок", icon: "💎" },
  frame: { label: "Кадр", icon: "🖼" },
  effect: { label: "Эффект", icon: "✨" },
  sticker: { label: "Наклейка", icon: "🏷" },
};

const rarityColors: Record<string, string> = {
  founder: "#bfff00",
  legendary: "#ffd700",
  epic: "#a855f7",
  rare: "#38bdf8",
  common: "#94a3b8",
};

function typeLabel(type: string): string {
  return typeMap[type]?.label ?? type;
}

function typeIcon(type: string): string {
  return typeMap[type]?.icon ?? "❓";
}

function rarityColor(rarity: string): string {
  return rarityColors[rarity] ?? "#94a3b8";
}

function isAwarded(itemId: string): boolean {
  return awardedIds.has(itemId);
}

const awardedIds = new Set<string>();

function rarityGlow(rarity: string): string {
  const base = "shadow-xl ";
  switch (rarity) {
    case "founder":
      return base + " shadow-[#bfff00]/20";
    case "legendary":
      return base + " shadow-[#ffd700]/20";
    case "epic":
      return base + " shadow-[#a855f7]/20";
    case "rare":
      return base + " shadow-[#38bdf8]/20";
    default:
      return base + " shadow-line/10";
  }
}

function rarityBorder(rarity: string): string {
  switch (rarity) {
    case "founder":
      return "bg-gradient-to-br from-[#bfff00]/30 via-[#bfff00]/10 to-transparent";
    case "legendary":
      return "bg-gradient-to-br from-[#ffd700]/30 via-[#ffd700]/10 to-transparent";
    case "epic":
      return "bg-gradient-to-br from-[#a855f7]/30 via-[#a855f7]/10 to-transparent";
    case "rare":
      return "bg-gradient-to-br from-[#38bdf8]/30 via-[#38bdf8]/10 to-transparent";
    default:
      return "bg-line/10";
  }
}

function rarityImageBg(rarity: string): string {
  switch (rarity) {
    case "founder":
      return "bg-gradient-to-b from-[#bfff00]/5 to-transparent";
    case "legendary":
      return "bg-gradient-to-b from-[#ffd700]/5 to-transparent";
    case "epic":
      return "bg-gradient-to-b from-[#a855f7]/5 to-transparent";
    case "rare":
      return "bg-gradient-to-b from-[#38bdf8]/5 to-transparent";
    default:
      return "bg-coal/40";
  }
}

function rarityBadgeClass(rarity: string): string {
  switch (rarity) {
    case "founder":
      return "bg-[#bfff00]/15 text-[#bfff00] border border-[#bfff00]/30";
    case "legendary":
      return "bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30";
    case "epic":
      return "bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30";
    case "rare":
      return "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30";
    default:
      return "bg-line/20 text-moss/60 border border-line/30";
  }
}

function rarityPillClass(rarity: string): string {
  switch (rarity) {
    case "founder":
      return "border-[#bfff00]/30 text-[#bfff00] bg-[#bfff00]/10";
    case "legendary":
      return "border-[#ffd700]/30 text-[#ffd700] bg-[#ffd700]/10";
    case "epic":
      return "border-[#a855f7]/30 text-[#a855f7] bg-[#a855f7]/10";
    case "rare":
      return "border-[#38bdf8]/30 text-[#38bdf8] bg-[#38bdf8]/10";
    default:
      return "border-line/30 text-moss/50 bg-line/10";
  }
}

onMounted(async () => {
  try {
    const query: Record<string, string | undefined> = {};
    if (props.profileId) query.profileId = props.profileId;
    const result = await premiumCatalogRoute.query(query).run(ctx);
    items.value = result.items ?? [];
    if (result.awards) {
      for (const award of result.awards) {
        awardedIds.add(award.id);
      }
    }
  } catch {
    items.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
@keyframes shimmer {
  0%,
  100% {
    background-position: -200% 0;
  }
  50% {
    background-position: 200% 0;
  }
}
@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}
@keyframes borderRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
