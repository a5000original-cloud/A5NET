<template>
  <section>
    <div v-if="loading" class="py-16 text-center text-sm text-moss/60">
      загрузка каталога…
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="a5-card a5-grain overflow-hidden transition hover:border-lime/30"
      >
        <div
          class="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-line/70 bg-coal/40"
        >
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.name"
            class="h-full w-full object-contain"
          />
          <span
            v-else
            class="text-4xl sm:text-5xl"
            :style="{
              filter:
                'drop-shadow(0 0 12px ' + rarityColor(item.rarity) + '66)',
            }"
          >
            {{ typeIcon(item.type) }}
          </span>
          <span
            v-if="isAwarded(item.id)"
            class="absolute left-2 top-2 rounded-full border border-lime/40 bg-ink/85 px-2 py-0.5 text-[9px] text-lime backdrop-blur"
          >
            в коллекции
          </span>
        </div>

        <div class="p-3 sm:p-4">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-sm font-medium text-bone">
              {{ item.name }}
            </p>
            <span
              class="shrink-0 text-[9px]"
              :style="{ color: rarityColor(item.rarity) }"
              >{{ item.rarity }}</span
            >
          </div>
          <p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-moss/70">
            {{ item.description }}
          </p>
          <div class="mt-2 flex items-center gap-2">
            <span
              class="a5-pill !text-[8px]"
              :style="{
                borderColor: rarityColor(item.rarity) + '40',
                color: rarityColor(item.rarity),
              }"
            >
              {{ typeLabel(item.type) }}
            </span>
          </div>
        </div>
      </article>
    </div>
    <p
      v-if="!loading && items.length === 0"
      class="py-12 text-center text-sm text-moss/60"
    >
      Каталог пуст.
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { premiumCatalogRoute } from "../api/premium/catalog";

const props = defineProps<{ profileId?: string }>();

const items = ref<any[]>([]);
const loading = ref(true);

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
