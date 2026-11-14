<template>
  <div>
    <SiteHeader :viewer="viewer" :role="role" active="control" />
    <main class="a5-shell pb-24 pt-8">
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
        v-else
        :items="premiumItems"
        :awards="awards"
        :error="artifactError"
        :loading="artifactLoading"
        @issue="issueArtifact"
        @revoke="revokeArtifact"
        @select-item="artifactForm.itemId = $event?.id ?? ''"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { ControlData, AuthorCard, PremiumItem } from "../shared/types";
import SiteHeader from "./SiteHeader.vue";
import FleetControl from "./FleetControl.vue";
import ArtifactControl from "./ArtifactControl.vue";
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
