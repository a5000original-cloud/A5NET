<template>
  <div>
    <SiteHeader :viewer="data.viewer" :role="data.viewerRole" active="none" />

    <main class="a5-shell pb-28 pt-8">
      <!-- Hero -->
      <section
        class="mb-10 rounded-3xl border border-line bg-gradient-to-br from-panel via-panel2 to-panel p-6 sm:p-10"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="a5-mono text-[9px] text-lime">магазин A5NET</p>
            <h1 class="a5-display mt-2 text-3xl font-medium sm:text-4xl">
              Premium и <span class="text-amber">монеты</span>
            </h1>
            <p class="mt-2 max-w-lg text-sm leading-relaxed text-moss/80">
              Получи эксклюзивные эффекты, бейджи и артефакты. Монеты трать на
              Premium и уникальные предметы.
            </p>
          </div>
          <div
            class="flex items-center gap-3 rounded-2xl border border-line bg-panel2 px-5 py-4"
          >
            <span class="text-2xl">🪙</span>
            <div>
              <p class="a5-mono text-[8px] text-moss">твои монеты</p>
              <p class="text-xl font-bold text-amber">{{ userCoins }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Premium Plans -->
      <section class="mb-10">
        <h2 class="a5-display mb-5 text-2xl">
          <span class="text-lime">◆</span> A5NET Premium
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Monthly -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition-all hover:border-lime/40 hover:shadow-lg hover:shadow-lime/5"
          >
            <div
              class="absolute inset-0 opacity-0 transition group-hover:opacity-100"
              style="
                background: radial-gradient(
                  circle at top right,
                  rgba(201, 247, 90, 0.08) 0%,
                  transparent 60%
                );
              "
            ></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between">
                <span class="a5-pill !border-lime/25 !text-lime/80">Месяц</span>
                <span class="text-2xl">⚡</span>
              </div>
              <p class="a5-display mt-4 text-2xl font-medium">100 ₽</p>
              <p class="mt-1 text-xs text-moss/60">в месяц</p>
              <ul class="mt-5 space-y-2 text-xs text-bone/70">
                <li class="flex items-center gap-2">
                  <span class="text-lime">✓</span> Бейдж Premium
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-lime">✓</span> Эксклюзивные эффекты
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-lime">✓</span> Приоритет в выдаче
                </li>
              </ul>
              <button
                type="button"
                class="mt-6 w-full rounded-xl bg-lime px-4 py-3 text-sm font-semibold text-ink shadow-lg shadow-lime/20 transition hover:bg-[#d8ff7c] hover:shadow-xl"
                :disabled="buying"
                @click="buyPremium('prem_month')"
              >
                {{
                  buying === "prem_month" ? "Обработка..." : "Оплатить 100 ₽"
                }}
              </button>
            </div>
          </div>

          <!-- Yearly -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-amber/30 bg-panel p-6 transition-all hover:border-amber/60 hover:shadow-lg hover:shadow-amber/10"
          >
            <div
              class="absolute top-3 right-3 rounded-full bg-amber/15 px-2.5 py-1 text-[9px] font-bold text-amber"
            >
              -34%
            </div>
            <div
              class="absolute inset-0 opacity-0 transition group-hover:opacity-100"
              style="
                background: radial-gradient(
                  circle at top right,
                  rgba(255, 215, 0, 0.08) 0%,
                  transparent 60%
                );
              "
            ></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between">
                <span class="a5-pill !border-amber/25 !text-amber/80">Год</span>
                <span class="text-2xl">👑</span>
              </div>
              <p class="a5-display mt-4 text-2xl font-medium text-amber">
                126 ₽
              </p>
              <p class="mt-1 text-xs text-moss/60">в год · 10.5 ₽/мес</p>
              <ul class="mt-5 space-y-2 text-xs text-bone/70">
                <li class="flex items-center gap-2">
                  <span class="text-amber">✓</span> Всё из месячного
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-amber">✓</span> Золотой бейдж
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-amber">✓</span> Ранний доступ к фичам
                </li>
              </ul>
              <button
                type="button"
                class="mt-6 w-full rounded-xl bg-amber px-4 py-3 text-sm font-semibold text-ink shadow-lg shadow-amber/20 transition hover:bg-[#ffe44d] hover:shadow-xl"
                :disabled="buying"
                @click="buyPremium('prem_year')"
              >
                {{ buying === "prem_year" ? "Обработка..." : "Оплатить 126 ₽" }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Coins -->
      <section class="mb-10">
        <h2 class="a5-display mb-5 text-2xl">
          <span class="text-amber">◆</span> A5 Coins
        </h2>
        <div class="grid gap-4 sm:grid-cols-3">
          <div
            v-for="coin in coinPackages"
            :key="coin.id"
            class="rounded-2xl border border-line bg-panel p-5 transition-all hover:border-amber/30 hover:shadow-lg hover:shadow-amber/5"
          >
            <div class="flex items-center gap-3">
              <span class="text-3xl">🪙</span>
              <div>
                <p class="text-sm font-medium text-bone">{{ coin.label }}</p>
                <p class="text-[10px] text-moss/60">{{ coin.priceText }}</p>
              </div>
            </div>
            <button
              type="button"
              class="mt-4 w-full rounded-xl border border-line/60 bg-panel2 px-4 py-2.5 text-xs font-medium text-bone transition hover:border-amber/40 hover:text-amber"
              :disabled="buying"
              @click="buyCoins(coin.id, coin.amount)"
            >
              Купить
            </button>
          </div>
        </div>
      </section>

      <!-- Buy Premium with Coins -->
      <section class="mb-10">
        <h2 class="a5-display mb-5 text-2xl">
          <span class="text-violet">◆</span> Купить Premium за монеты
        </h2>
        <div
          class="rounded-2xl border border-violet/20 bg-panel p-6 transition-all hover:border-violet/40"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-base font-medium text-bone">Premium на 1 год</p>
              <p class="mt-1 text-xs text-moss/60">
                Стоимость:
                <span class="text-amber font-bold">3000 A5 Coins</span>
              </p>
              <p class="mt-1 text-[11px] text-moss/50">
                У тебя: <span class="text-bone">{{ userCoins }}</span> монет
              </p>
            </div>
            <button
              type="button"
              class="rounded-xl bg-violet px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet/20 transition hover:bg-[#8b5cf6] disabled:opacity-30"
              :disabled="buying || userCoins < 3000"
              @click="buyPremiumWithCoins"
            >
              {{
                buying === "premium_coins"
                  ? "Активирую..."
                  : "Активировать Premium"
              }}
            </button>
          </div>
        </div>
      </section>

      <!-- Error / Success -->
      <div
        v-if="error"
        class="mb-6 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember"
      >
        {{ error }}
      </div>
      <div
        v-if="success"
        class="mb-6 rounded-xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-lime"
      >
        {{ success }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { AuthorCard } from "../shared/types";
import SiteHeader from "./SiteHeader.vue";
import { storeListRoute } from "../api/store/list";
import { storePurchaseRoute } from "../api/store/purchase";

const props = defineProps<{
  data: { viewer: AuthorCard; viewerRole: string };
}>();

const viewer = computed(() => props.data.viewer);

// State
const products = ref<any[]>([]);
const userCoins = ref(0);
const buying = ref<string | null>(null);
const error = ref("");
const success = ref("");

async function loadStore() {
  try {
    const result = await storeListRoute.run(ctx);
    if (result.products) {
      products.value = result.products;
    }
  } catch {
    // silent
  }
}

async function buyPremium(planId: string) {
  error.value = "";
  success.value = "";
  buying.value = planId;
  try {
    const result = await storePurchaseRoute.run(ctx, {
      action: "buy_premium_stripe",
      profileId: viewer.value.id,
      plan: planId === "prem_year" ? "year" : "month",
    });
    if (!result.ok) {
      error.value = result.error;
    } else {
      success.value = result.message || "Premium активирован!";
    }
  } catch {
    error.value = "Не удалось оплатить.";
  } finally {
    buying.value = null;
  }
}

async function buyCoins(productId: string, amount: number) {
  error.value = "";
  success.value = "";
  buying.value = productId;
  try {
    const result = await storePurchaseRoute.run(ctx, {
      action: "buy_coins",
      profileId: viewer.value.id,
      plan: String(amount),
    });
    if (!result.ok) {
      error.value = result.error;
    } else {
      userCoins.value = result.coins ?? userCoins.value;
      success.value = `+${amount} монет! Всего: ${userCoins.value}`;
    }
  } catch {
    error.value = "Не удалось купить монеты.";
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
      profileId: viewer.value.id,
    });
    if (!result.ok) {
      error.value = result.error;
    } else {
      success.value = result.message || "Premium активирован!";
    }
  } catch {
    error.value = "Не удалось активировать.";
  } finally {
    buying.value = null;
  }
}

// Coin packages
const coinPackages = [
  { id: "coins_1000", label: "1 000 монет", priceText: "100 ₽", amount: 1000 },
  { id: "coins_3000", label: "3 000 монет", priceText: "300 ₽", amount: 3000 },
  {
    id: "coins_5000",
    label: "5 000 монет",
    priceText: "500 ₽ (+1000 бонус)",
    amount: 6000,
  },
];

loadStore();
</script>
