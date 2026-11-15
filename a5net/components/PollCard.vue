<template>
  <div class="rounded-2xl border border-violet/30 bg-violet/5 p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-lg">🗳️</span>
        <div>
          <p class="a5-mono text-[9px] text-violet/80">
            голосование сообщества
          </p>
          <h3 class="text-sm font-medium text-bone mt-0.5">{{ poll.title }}</h3>
        </div>
      </div>
      <span class="a5-pill !text-[9px] !py-1"> {{ totalVotes }} голосов </span>
    </div>

    <!-- Options -->
    <div class="space-y-3">
      <button
        v-for="option in poll.options"
        :key="option.profileId"
        type="button"
        class="group w-full text-left rounded-xl border border-line/50 bg-panel2/40 p-3 transition-all hover:border-violet/40 hover:bg-violet/10"
        :class="
          votedOptions.includes(option.profileId)
            ? 'border-violet/40 bg-violet/10'
            : ''
        "
        @click="castVote(option.profileId)"
      >
        <div class="flex items-center justify-between relative z-10">
          <div class="flex items-center gap-2 min-w-0">
            <Avatar
              :name="option.name"
              :hue="option.hue"
              :accent="option.accent"
              size="xs"
            />
            <span class="truncate text-sm text-bone">{{ option.name }}</span>
          </div>
          <span
            class="font-mono text-[11px] text-moss/60 group-hover:text-violet"
          >
            {{ option.percent }}%
          </span>
        </div>

        <!-- Progress bar -->
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line/20">
          <div
            class="h-full rounded-full transition-all duration-700"
            :class="
              votedOptions.includes(option.profileId)
                ? 'bg-violet'
                : 'bg-violet/40'
            "
            :style="{ width: option.percent + '%' }"
          ></div>
        </div>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="mt-4 text-center text-sm text-moss/60">
      Загрузка результатов...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Avatar from "./Avatar.vue";
import { voteCastRoute, voteResultsRoute } from "../api/events/vote";
import Profiles from "../tables/profiles.table";

const props = defineProps<{
  eventId: string;
  title: string;
}>();

const poll = ref({
  title: props.title,
  options: [] as Array<{
    profileId: string;
    name: string;
    hue: number;
    accent: number;
    votes: number;
    percent: number;
  }>,
});

const votedOptions = ref<string[]>([]);
const loading = ref(false);
const totalVotes = ref(0);

async function loadResults() {
  loading.value = true;
  try {
    const result = await voteResultsRoute
      .query({ eventId: props.eventId })
      .run(ctx);
    if (result.ok && result.results) {
      const total = result.results.reduce(
        (s: number, r: any) => s + r.votes,
        0,
      );
      totalVotes.value = total;

      // Get profile details
      const options = await Promise.all(
        result.results.map(async (r: any) => {
          let hue = 120;
          let accent = 160;
          try {
            const profile = await Profiles.findById(ctx, r.profileId);
            if (profile) {
              hue = profile.avatarHue;
              accent = profile.avatarAccent;
            }
          } catch {
            // use defaults
          }
          return {
            profileId: r.profileId,
            name: r.name,
            hue,
            accent,
            votes: r.votes,
            percent: total > 0 ? Math.round((r.votes / total) * 100) : 0,
          };
        }),
      );
      poll.value.options = options;
    }
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
}

async function castVote(profileId: string) {
  try {
    const result = await voteCastRoute.run(ctx, {
      eventId: props.eventId,
      targetProfileId: profileId,
    });
    if (result.ok) {
      if (!votedOptions.value.includes(profileId)) {
        votedOptions.value.push(profileId);
      }
      // Reload results
      await loadResults();
    }
  } catch {
    // silent
  }
}

onMounted(() => {
  loadResults();
});
</script>
