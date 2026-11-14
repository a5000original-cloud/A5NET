<template>
  <div>
    <SiteHeader :viewer="viewer" :role="role" active="control" />
    <main class="a5-shell pb-24 pt-8">
      <section
        class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <p class="a5-mono text-[9px] text-violet/70">пульт управления</p>
          <h1
            class="a5-display mt-3 text-4xl font-medium leading-[1.05] sm:text-5xl"
          >
            A5000 <span class="text-violet">пульт</span>
          </h1>
        </div>
        <div
          class="flex items-center gap-2 rounded-full border border-line bg-panel2/60 px-3 py-1.5"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span>
          <span class="a5-mono text-[9px] text-moss"
            >{{ bots.length }} ботов</span
          >
        </div>
      </section>

      <!-- Tabs -->
      <div
        class="mb-6 flex gap-1 rounded-full border border-line bg-panel2/60 p-1"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="flex-1 rounded-full px-4 py-2 text-sm font-medium transition"
          :class="
            activeTab === tab.key
              ? 'bg-violet text-bone shadow-lg'
              : 'text-moss hover:text-bone'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Fleet Tab -->
      <div v-if="activeTab === 'fleet'" class="space-y-4">
        <section class="a5-card p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="a5-display text-xl">Флот ботов</h2>
            <div class="flex items-center gap-3">
              <span class="a5-mono text-[10px] text-moss"
                >онлайн: <span class="text-lime">{{ onlineCount }}</span></span
              >
              <button
                type="button"
                class="a5-btn !py-1.5 text-[11px]"
                :class="
                  fleet.enabled
                    ? 'border-lime/40 text-lime'
                    : 'border-line text-moss'
                "
                @click="toggleFleet"
              >
                {{ fleet.enabled ? "Остановить" : "Запустить" }} флот
              </button>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="bot in bots"
              :key="bot.id"
              class="rounded-xl border border-line/70 bg-panel2/50 p-4 transition-all duration-200 hover:border-violet/30"
            >
              <div class="flex items-start gap-3">
                <Avatar
                  :name="bot.name"
                  :hue="bot.avatarHue"
                  :accent="bot.avatarAccent"
                  :src="bot.avatarUrl"
                  size="sm"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="truncate text-sm font-medium text-bone">{{
                      bot.name
                    }}</span>
                    <span
                      class="shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold"
                      :class="
                        bot.enabled
                          ? 'bg-lime/15 text-lime'
                          : 'bg-line/20 text-moss/50'
                      "
                    >
                      {{ bot.enabled ? "ON" : "OFF" }}
                    </span>
                  </div>
                  <p class="mt-0.5 text-[11px] text-moss">
                    {{ bot.statusLabel }}
                  </p>
                  <p v-if="bot.lastActionAt" class="text-[10px] text-moss/50">
                    последнее: {{ bot.lastActionAt }}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Recent logs -->
        <section class="a5-card p-5">
          <h3 class="a5-mono mb-3 text-[9px] text-moss">последние действия</h3>
          <div class="space-y-2">
            <div
              v-for="log in logs.slice(0, 20)"
              :key="log.id"
              class="flex items-center gap-3 rounded-lg border border-line/50 bg-panel2/30 p-3 text-xs"
            >
              <span
                class="shrink-0 h-2 w-2 rounded-full"
                :style="{
                  background: log.status === 'ok' ? '#c9f75a' : '#ff8a5c',
                }"
              ></span>
              <span class="font-mono text-[10px] text-moss/60">{{
                log.ago
              }}</span>
              <span class="font-medium text-bone">{{ log.botName }}</span>
              <span class="text-moss">—</span>
              <span class="text-moss/80"
                >{{ log.action }}: {{ log.content }}</span
              >
            </div>
            <p v-if="!logs.length" class="text-center text-sm text-moss/50">
              логов пока нет
            </p>
          </div>
        </section>
      </div>

      <!-- Artifacts Tab -->
      <div v-if="activeTab === 'artifacts'" class="space-y-4">
        <section class="a5-card p-5">
          <h2 class="a5-display mb-4 text-xl">Выдача артефактов</h2>
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="a5-label" for="artifact-profile"
                >Никнейм или ID профиля</label
              >
              <input
                id="artifact-profile"
                v-model="artifactForm.profileId"
                class="a5-input !py-2.5 font-mono text-[11px]"
                placeholder="Например: a5000"
              />
            </div>
            <div>
              <label class="a5-label" for="artifact-item">Предмет</label>
              <select
                id="artifact-item"
                v-model="artifactForm.itemId"
                class="a5-input !py-2.5 font-mono text-[11px]"
              >
                <option value="" disabled>Выбери предмет</option>
                <option
                  v-for="item in premiumItems"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }} · {{ typeLabel(item.type) }} ·
                  {{ item.rarity }}
                </option>
              </select>
            </div>
          </div>

          <!-- Item description -->
          <div
            v-if="selectedItem"
            class="mt-4 rounded-xl border border-violet/20 bg-violet/5 p-4"
          >
            <p class="text-sm text-bone">{{ selectedItem.description }}</p>
            <div class="mt-2 flex items-center gap-2">
              <span class="a5-mono text-[9px] text-violet/70">{{
                selectedItem.rarity
              }}</span>
              <span class="a5-mono text-[9px] text-violet/70">{{
                animationLabel(selectedItem.animationType)
              }}</span>
            </div>
          </div>

          <div
            v-if="artifactError"
            class="mt-3 rounded-xl border border-ember/30 bg-ember/10 px-3 py-2 text-xs text-ember"
          >
            {{ artifactError }}
          </div>

          <div class="mt-4 flex gap-3">
            <button
              type="button"
              class="a5-btn-primary !py-2.5 text-xs"
              :disabled="
                !artifactForm.profileId ||
                !artifactForm.itemId ||
                artifactLoading
              "
              @click="issueArtifact"
            >
              {{ artifactLoading ? "Выдаю..." : "Выдать" }}
            </button>
            <button
              type="button"
              class="a5-btn !py-2.5 text-xs"
              :disabled="
                !artifactForm.profileId ||
                !artifactForm.itemId ||
                artifactLoading
              "
              @click="revokeArtifact"
            >
              Забрать
            </button>
          </div>
        </section>

        <!-- Awards list -->
        <section class="a5-card p-5">
          <h3 class="a5-mono mb-3 text-[9px] text-moss">последние выдачи</h3>
          <div v-if="awards.length" class="space-y-2">
            <div
              v-for="award in awards.slice(0, 30)"
              :key="award.id"
              class="flex items-center gap-3 rounded-lg border border-line/50 bg-panel2/30 p-3 text-xs"
            >
              <span>{{ award.itemName }}</span>
              <span class="text-moss">→</span>
              <span class="font-medium text-bone">{{ award.awardedBy }}</span>
              <span class="ml-auto font-mono text-[10px] text-moss/50">{{
                award.awardedAt
              }}</span>
            </div>
          </div>
          <p v-else class="text-center text-sm text-moss/50">
            выдач пока не было
          </p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { ControlData, AuthorCard } from "../shared/types";
import SiteHeader from "./SiteHeader.vue";
import Avatar from "./Avatar.vue";
import { controlUpdateRoute } from "../api/control/update";
import { premiumCatalogRoute } from "../api/premium/catalog";
import { premiumIssueRoute } from "../api/premium/issue";

const props = defineProps<{
  data: ControlData;
  viewer: AuthorCard;
  role: "owner" | "admin" | "member";
}>();

const tabs = [
  { key: "fleet" as const, label: "Флот ботов" },
  { key: "artifacts" as const, label: "Артефакты" },
];
const activeTab = ref("fleet");

const fleet = computed(() => props.data.fleet);
const bots = computed(() => props.data.bots);
const logs = computed(() => props.data.logs);
const onlineCount = computed(() => props.data.onlineNow);

async function toggleFleet() {
  try {
    await controlUpdateRoute.run(ctx, {
      action: fleet.value.enabled ? "stop" : "start",
    });
  } catch {
    // silent
  }
}

// Premium items
const premiumItems = ref<any[]>([]);
const awards = ref<any[]>([]);
const artifactForm = ref({ profileId: "", itemId: "" });
const artifactLoading = ref(false);
const artifactError = ref("");

const typeMap: Record<string, { label: string }> = {
  seal: { label: "Печать" },
  shard: { label: "Осколок" },
  frame: { label: "Кадр" },
  effect: { label: "Эффект" },
  sticker: { label: "Наклейка" },
};

const animMap: Record<string, string> = {
  pulse: "пульсация",
  rotate: "вращение",
  fog: "туман",
  shimmer: "блик",
  none: "нет",
};

function typeLabel(type: string): string {
  return typeMap[type]?.label ?? type;
}

function animationLabel(anim: string): string {
  return animMap[anim] ?? anim;
}

const selectedItem = computed(() => {
  if (!artifactForm.value.itemId) return null;
  return (
    premiumItems.value.find((i) => i.id === artifactForm.value.itemId) ?? null
  );
});

async function loadPremiumData() {
  try {
    const result = await premiumCatalogRoute.query({}).run(ctx);
    premiumItems.value = result.items ?? [];
  } catch {
    premiumItems.value = [];
  }
}

async function issueArtifact() {
  artifactError.value = "";
  if (!artifactForm.value.profileId || !artifactForm.value.itemId) {
    artifactError.value = "Заполни оба поля.";
    return;
  }
  artifactLoading.value = true;
  try {
    const result = await premiumIssueRoute.run(ctx, {
      profileId: artifactForm.value.profileId,
      itemId: artifactForm.value.itemId,
      action: "issue",
    });
    if (!result.ok) {
      artifactError.value = result.error;
      return;
    }
    artifactForm.value = { profileId: "", itemId: "" };
  } catch {
    artifactError.value = "Не удалось выдать.";
  } finally {
    artifactLoading.value = false;
  }
}

async function revokeArtifact() {
  artifactError.value = "";
  if (!artifactForm.value.profileId || !artifactForm.value.itemId) {
    artifactError.value = "Заполни оба поля.";
    return;
  }
  artifactLoading.value = true;
  try {
    const result = await premiumIssueRoute.run(ctx, {
      profileId: artifactForm.value.profileId,
      itemId: artifactForm.value.itemId,
      action: "revoke",
    });
    if (!result.ok) {
      artifactError.value = result.error;
      return;
    }
    artifactForm.value = { profileId: "", itemId: "" };
  } catch {
    artifactError.value = "Не удалось забрать.";
  } finally {
    artifactLoading.value = false;
  }
}

onMounted(() => {
  loadPremiumData();
});
</script>
