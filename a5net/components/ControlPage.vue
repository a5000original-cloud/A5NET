<template>
  <div>
    <SiteHeader :viewer="viewer" :role="role" active="control" />
    <main class="a5-shell pb-[140px] sm:pb-24 pt-8">
      <!-- Page Header -->
      <section class="mb-8">
        <p class="a5-mono text-[9px] text-violet/70">пульт управления</p>
        <h1
          class="a5-display mt-3 text-4xl font-medium leading-[1.05] text-bone sm:text-5xl"
        >
          A5000 <span class="text-violet">пульт</span>
        </h1>
      </section>

      <!-- Tabs -->
      <div
        class="mb-6 flex gap-1 rounded-full border border-line bg-panel/60 p-1 backdrop-blur-xl"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200"
          :class="
            activeTab === tab.key
              ? 'bg-violet text-bone shadow-lg shadow-violet/20'
              : 'text-moss/70 hover:text-bone'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Fleet Tab -->
      <FleetControl
        v-if="activeTab === 'fleet'"
        :bots="bots"
        :logs="logs"
        :fleet="fleet"
        :online-count="onlineCount"
        @toggle-fleet="toggleFleet"
        @adjust-bots="adjustBots"
        @toggle-bot-ban="toggleBotBan"
      />

      <!-- Artifacts Tab -->
      <ArtifactControl
        v-else-if="activeTab === 'artifacts'"
        :items="premiumItems"
        :awards="awards"
        :error="artifactError"
        :loading="artifactLoading"
        @issue="issueArtifact"
        @revoke="revokeArtifact"
        @select-item="
          (item) => {
            artifactForm.itemId = item?.id ?? '';
          }
        "
        @profile-input="
          (val) => {
            artifactForm.profileId = val;
          }
        "
      />

      <!-- Economy Tab -->
      <section v-else-if="activeTab === 'economy'" class="space-y-6">
        <div
          class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-5"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/15"
            >
              <span class="text-xl">🪙</span>
            </div>
            <div>
              <h2 class="text-base font-medium text-bone">
                Управление монетами
              </h2>
              <p class="text-[11px] text-moss/60">
                начисление и списание A5 Coins
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <!-- Coins -->
          <div
            class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-5"
          >
            <h3 class="text-sm font-medium text-bone mb-4">A5 Coins</h3>
            <div class="space-y-3">
              <div>
                <label class="a5-label" for="eco-profile">Профиль</label>
                <input
                  id="eco-profile"
                  v-model="ecoProfile"
                  class="a5-input !py-3 font-mono text-[12px]"
                  placeholder="@handle или ID"
                />
              </div>
              <div>
                <label class="a5-label" for="eco-coins">Количество</label>
                <input
                  id="eco-coins"
                  v-model.number="ecoCoins"
                  type="number"
                  class="a5-input !py-3 font-mono text-[12px]"
                  placeholder="1000"
                  min="0"
                />
              </div>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-lime px-6 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-lime/20 transition-all hover:bg-[#d8ff7c] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="!ecoCanAction || ecoLoading"
                  @click="ecoAdjustCoins(1)"
                >
                  {{ ecoLoading ? "..." : "+ Начислить" }}
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-xl border border-line/60 bg-panel2/60 px-6 py-3.5 text-sm font-semibold text-bone transition-all hover:border-ember/40 hover:bg-ember/10 hover:text-ember disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="!ecoCanAction || ecoLoading"
                  @click="ecoAdjustCoins(-1)"
                >
                  {{ ecoLoading ? "..." : "− Списать" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Premium -->
          <div
            class="rounded-2xl border border-line/70 bg-panel/80 backdrop-blur-xl p-5"
          >
            <h3 class="text-sm font-medium text-bone mb-4">Premium</h3>
            <div class="space-y-3">
              <div>
                <label class="a5-label" for="prem-profile">Профиль</label>
                <input
                  id="prem-profile"
                  v-model="premProfile"
                  class="a5-input !py-3 font-mono text-[12px]"
                  placeholder="@handle или ID"
                />
              </div>
              <div>
                <label class="a5-label" for="prem-days">Дней</label>
                <input
                  id="prem-days"
                  v-model.number="premDays"
                  type="number"
                  class="a5-input !py-3 font-mono text-[12px]"
                  placeholder="30"
                  min="1"
                />
              </div>
              <button
                type="button"
                class="w-full rounded-xl bg-amber px-6 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-amber/20 transition-all hover:bg-[#ffe44d] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30"
                :disabled="!premCanAction || premLoading"
                @click="premIssue"
              >
                {{ premLoading ? "Выдаю..." : "✦ Выдать Premium" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Economy Error/Success -->
        <div
          v-if="ecoError"
          class="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember"
        >
          {{ ecoError }}
        </div>
        <div
          v-if="ecoSuccess"
          class="rounded-xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-lime"
        >
          {{ ecoSuccess }}
        </div>
      </section>

      <!-- Events Tab -->
      <EventControl v-else-if="activeTab === 'events'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { ControlData, AuthorCard, PremiumItem } from "../shared/types";
import SiteHeader from "./SiteHeader.vue";
import FleetControl from "./FleetControl.vue";
import ArtifactControl from "./ArtifactControl.vue";
import EventControl from "./EventControl.vue";
import { controlUpdateRoute } from "../api/control/update";
import { premiumCatalogRoute } from "../api/premium/catalog";
import { premiumIssueRoute } from "../api/premium/issue";
import { storePurchaseRoute } from "../api/store/purchase";

const props = defineProps<{
  data: ControlData;
  viewer: AuthorCard;
  role: "owner" | "admin" | "member";
}>();

const tabs = [
  { key: "fleet" as const, label: "Флот ботов" },
  { key: "artifacts" as const, label: "Артефакты" },
  { key: "economy" as const, label: "Экономика" },
  { key: "events" as const, label: "Ивенты" },
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

function adjustBots(_delta: number) {
  // placeholder: implement bot scaling logic
}

function toggleBotBan(_botId: string) {
  // placeholder: implement ban/unban logic
}

// Premium items
const premiumItems = ref<PremiumItem[]>([]);
const awards = ref<
  Array<{
    id: string;
    itemName: string;
    itemType: string;
    awardedAt: string;
  }>
>([]);
const artifactForm = ref({ profileId: "", itemId: "" });
const artifactLoading = ref(false);
const artifactError = ref("");

// Economy
const ecoProfile = ref("");
const ecoCoins = ref(0);
const ecoLoading = ref(false);
const ecoError = ref("");
const ecoSuccess = ref("");

const premProfile = ref("");
const premDays = ref(30);
const premLoading = ref(false);

const ecoCanAction = computed(
  () => ecoProfile.value.trim() && ecoCoins.value > 0 && !ecoLoading.value,
);
const premCanAction = computed(
  () => premProfile.value.trim() && premDays.value > 0 && !premLoading.value,
);

async function ecoAdjustCoins(direction: 1 | -1) {
  ecoError.value = "";
  ecoSuccess.value = "";
  ecoLoading.value = true;
  try {
    const result = await storePurchaseRoute.run(ctx, {
      action: "buy_coins",
      profileId: ecoProfile.value.trim(),
      plan: String(Math.abs(ecoCoins.value) * direction),
    });
    if (!result.ok) {
      ecoError.value = result.error;
    } else {
      ecoSuccess.value =
        direction > 0
          ? `+${ecoCoins.value} монет начислено.`
          : `-${ecoCoins.value} монет списано.`;
      ecoCoins.value = 0;
    }
  } catch {
    ecoError.value = "Не удалось выполнить.";
  } finally {
    ecoLoading.value = false;
  }
}

async function premIssue() {
  ecoError.value = "";
  ecoSuccess.value = "";
  premLoading.value = true;
  try {
    const result = await storePurchaseRoute.run(ctx, {
      action: "buy_premium_stripe",
      profileId: premProfile.value.trim(),
      plan: premDays.value >= 365 ? "year" : "month",
    });
    if (!result.ok) {
      ecoError.value = result.error;
    } else {
      ecoSuccess.value = result.message || "Premium выдан!";
      premDays.value = 30;
    }
  } catch {
    ecoError.value = "Не удалось выдать.";
  } finally {
    premLoading.value = false;
  }
}

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
