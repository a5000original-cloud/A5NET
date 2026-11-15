<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      @click.self="close"
    >
      <!-- Modal -->
      <div
        class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-panel shadow-2xl"
      >
        <!-- Header -->
        <div
          class="sticky top-0 z-10 flex items-center justify-between border-b border-line/60 bg-panel/95 px-6 py-4 backdrop-blur-xl"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-lime/15"
            >
              <span class="text-lg">🛒</span>
            </div>
            <div>
              <h2 class="text-base font-semibold text-bone">Магазин A5NET</h2>
              <p class="text-[10px] text-moss/60">Premium и монеты</p>
            </div>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-moss/60 transition hover:bg-panel2 hover:text-bone"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- User coins badge -->
        <div class="px-6 pt-4">
          <div
            class="flex items-center justify-between rounded-2xl border border-line bg-panel2 px-4 py-3"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">🪙</span>
              <span class="text-xs text-moss">твои монеты</span>
            </div>
            <span class="text-lg font-bold text-amber">{{ userCoins }}</span>
          </div>
        </div>

        <div class="p-6 pt-5 space-y-6">
          <!-- Premium Monthly -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-lime/20 bg-gradient-to-br from-panel to-panel2 p-5 transition-all hover:border-lime/50 hover:shadow-lg hover:shadow-lime/5"
          >
            <div
              class="absolute inset-0 opacity-0 transition group-hover:opacity-100"
              style="
                background: radial-gradient(
                  circle at top right,
                  rgba(201, 247, 90, 0.06) 0%,
                  transparent 60%
                );
              "
            ></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-3">
                <span class="a5-pill !border-lime/25 !text-lime/80 text-[10px]">
                  Месяц
                </span>
                <span class="text-xl">⚡</span>
              </div>
              <p class="a5-display text-xl font-medium text-bone">100 ₽</p>
              <p class="mt-0.5 text-[10px] text-moss/50">в месяц</p>
              <ul class="mt-3 space-y-1.5 text-[11px] text-bone/60">
                <li class="flex items-center gap-1.5">
                  <span class="text-lime">✓</span> Бейдж Premium
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="text-lime">✓</span> Эксклюзивные эффекты
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="text-lime">✓</span> Приоритет в выдаче
                </li>
              </ul>
              <button
                type="button"
                class="mt-4 w-full rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-lime/20 transition hover:bg-[#d8ff7c] hover:shadow-xl disabled:opacity-30"
                :disabled="buying !== null"
                @click="buyPremium('month')"
              >
                {{ buying === "month" ? "Обработка..." : "Оплатить 100 ₽" }}
              </button>
            </div>
          </div>

          <!-- Premium Yearly -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-amber/25 bg-gradient-to-br from-panel to-panel2 p-5 transition-all hover:border-amber/50 hover:shadow-lg hover:shadow-amber/5"
          >
            <div
              class="absolute top-2 right-2 rounded-full bg-amber/15 px-2 py-0.5 text-[9px] font-bold text-amber"
            >
              -34%
            </div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-3">
                <span
                  class="a5-pill !border-amber/25 !text-amber/80 text-[10px]"
                >
                  Год
                </span>
                <span class="text-xl">👑</span>
              </div>
              <p class="a5-display text-xl font-medium text-amber">126 ₽</p>
              <p class="mt-0.5 text-[10px] text-moss/50">в год · 10,5 ₽/мес</p>
              <ul class="mt-3 space-y-1.5 text-[11px] text-bone/60">
                <li class="flex items-center gap-1.5">
                  <span class="text-amber">✓</span> Всё из месячного
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="text-amber">✓</span> Золотой бейдж
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="text-amber">✓</span> Ранний доступ к фичам
                </li>
              </ul>
              <button
                type="button"
                class="mt-4 w-full rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-amber/20 transition hover:bg-[#ffe44d] hover:shadow-xl disabled:opacity-30"
                :disabled="buying !== null"
                @click="buyPremium('year')"
              >
                {{ buying === "year" ? "Обработка..." : "Оплатить 126 ₽" }}
              </button>
            </div>
          </div>

          <!-- Premium for coins -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-violet/20 bg-gradient-to-br from-panel to-panel2 p-5 transition-all hover:border-violet/40 hover:shadow-lg hover:shadow-violet/5"
          >
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-3">
                <span
                  class="a5-pill !border-violet/25 !text-violet/80 text-[10px]"
                >
                  За монеты
                </span>
                <span class="text-xl">💎</span>
              </div>
              <p class="a5-display text-xl font-medium text-bone">
                3 000 A5 Coins
              </p>
              <p class="mt-0.5 text-[10px] text-moss/50">Premium на 1 год</p>
              <div
                class="mt-3 flex items-center gap-2 text-[11px] text-moss/60"
              >
                <span>У тебя:</span>
                <span class="font-medium text-amber">{{ userCoins }}</span>
                <span>монет</span>
              </div>
              <button
                type="button"
                class="mt-4 w-full rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet/20 transition hover:bg-[#8b5cf6] disabled:opacity-30"
                :disabled="buying !== null || userCoins < 3000"
                @click="buyPremiumWithCoins"
              >
                {{
                  buying === "premium_coins"
                    ? "Активирую..."
                    : userCoins < 3000
                      ? "Недостаточно монет"
                      : "Активировать Premium"
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer messages -->
        <div class="px-6 pb-5 space-y-2">
          <div
            v-if="error"
            class="rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-xs text-ember"
          >
            {{ error }}
          </div>
          <div
            v-if="success"
            class="rounded-xl border border-lime/30 bg-lime/10 px-4 py-2.5 text-xs text-lime"
          >
            {{ success }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { AuthorCard } from "../shared/types";
import { storePurchaseRoute } from "../api/store/purchase";

const props = defineProps<{
  open: boolean;
  viewer: AuthorCard;
  userCoins: number;
}>();

const emit = defineEmits<{
  close: [];
  "update:coins": [coins: number];
}>();

const buying = ref<string | null>(null);
const error = ref("");
const success = ref("");

function close() {
  emit("close");
  error.value = "";
  success.value = "";
}

async function buyPremium(plan: "month" | "year") {
  error.value = "";
  success.value = "";
  buying.value = plan;
  try {
    const result = await storePurchaseRoute.run(ctx, {
      action: "buy_premium_stripe",
      profileId: props.viewer.id,
      plan,
    });
    if (!result.ok) {
      error.value = result.error;
    } else {
      success.value = result.message || "Premium активирован!";
      setTimeout(() => close(), 1500);
    }
  } catch {
    error.value = "Не удалось оплатить.";
  } finally {
    buying.value = null;
  }
}

async function buyPremiumWithCoins() {
  error.value = "";
  success.value = "";
  buying.value = "premium_coins";
  try {
    const result = await storePurchaseRoute.run(ctx, {
      action: "buy_premium_coins",
      profileId: props.viewer.id,
    });
    if (!result.ok) {
      error.value = result.error;
    } else {
      success.value = result.message || "Premium активирован!";
      emit("update:coins", props.userCoins - 3000);
      setTimeout(() => close(), 1500);
    }
  } catch {
    error.value = "Не удалось активировать.";
  } finally {
    buying.value = null;
  }
}
</script>
