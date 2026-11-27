<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div
      class="relative overflow-hidden rounded-3xl border border-line/30 bg-gradient-to-br from-ink via-panel to-ink p-8 sm:p-12"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-lime/5 via-transparent to-violet/5"
      ></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">💎</span>
          <h1 class="text-3xl sm:text-4xl font-bold text-bone">
            Премиум и монеты
          </h1>
        </div>
        <p class="text-moss text-sm sm:text-base max-w-2xl">
          Получи эксклюзивные эффекты, бейджи и артефакты. Монеты трать на
          Premium и уникальные предметы.
        </p>
        <div
          class="mt-6 inline-flex items-center gap-3 rounded-2xl border border-lime/30 bg-lime/10 px-6 py-3"
        >
          <span class="text-2xl">🪙</span>
          <div>
            <div class="text-[10px] uppercase tracking-wider text-moss">
              Твои монеты
            </div>
            <div class="text-2xl font-bold text-lime">{{ balance }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Premium Plans -->
    <section class="mt-12">
      <h2 class="text-2xl font-bold text-bone mb-6 flex items-center gap-2">
        <span class="text-lime">◆</span> A5NET Premium
      </h2>
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Monthly -->
        <div
          class="group relative overflow-hidden rounded-3xl border border-line/30 bg-gradient-to-br from-panel via-ink to-panel p-6 transition-all hover:border-lime/50 hover:shadow-2xl hover:shadow-lime/10"
        >
          <div class="absolute top-4 right-4 text-3xl">⚡</div>
          <div class="relative z-10">
            <span
              class="inline-block rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-medium text-lime mb-4"
              >МЕСЯЦ</span
            >
            <div class="text-4xl font-bold text-bone mb-2">100 ₽</div>
            <div class="text-sm text-moss mb-6">в месяц</div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-sm text-bone">
                <span class="text-lime">✓</span> Бейдж Premium
              </li>
              <li class="flex items-center gap-2 text-sm text-bone">
                <span class="text-lime">✓</span> Эксклюзивные эффекты
              </li>
              <li class="flex items-center gap-2 text-sm text-bone">
                <span class="text-lime">✓</span> Приоритет в выдаче
              </li>
            </ul>
            <button
              type="button"
              class="w-full rounded-xl bg-lime px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:bg-[#d8ff7c] hover:shadow-lg hover:shadow-lime/30 active:scale-[0.97] disabled:opacity-50"
              :disabled="purchasing"
              @click="buyPremium('month', 100)"
            >
              {{ purchasing ? "Обработка..." : "Купить за 100 ₽" }}
            </button>
          </div>
        </div>

        <!-- Yearly -->
        <div
          class="group relative overflow-hidden rounded-3xl border border-violet/50 bg-gradient-to-br from-violet/10 via-ink to-panel p-6 transition-all hover:border-violet/70 hover:shadow-2xl hover:shadow-violet/10"
        >
          <div class="absolute top-4 right-4 text-3xl">👑</div>
          <div
            class="absolute top-4 right-16 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold text-white"
          >
            -34%
          </div>
          <div class="relative z-10">
            <span
              class="inline-block rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-medium text-violet mb-4"
              >ГОД</span
            >
            <div class="text-4xl font-bold text-bone mb-2">126 ₽</div>
            <div class="text-sm text-moss mb-6">в год · 10.5 ₽/мес</div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-sm text-bone">
                <span class="text-violet">✓</span> Всё из месячного
              </li>
              <li class="flex items-center gap-2 text-sm text-bone">
                <span class="text-violet">✓</span> Золотой бейдж
              </li>
              <li class="flex items-center gap-2 text-sm text-bone">
                <span class="text-violet">✓</span> Ранний доступ к фичам
              </li>
            </ul>
            <button
              type="button"
              class="w-full rounded-xl bg-violet px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#c9bcff] hover:shadow-lg hover:shadow-violet/30 active:scale-[0.97] disabled:opacity-50"
              :disabled="purchasing"
              @click="buyPremium('year', 126)"
            >
              {{ purchasing ? "Обработка..." : "Купить за 126 ₽" }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Coins Pack -->
    <section class="mt-12">
      <h2 class="text-2xl font-bold text-bone mb-6 flex items-center gap-2">
        <span class="text-amber">🪙</span> Пакеты монет
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="pack in coinPacks"
          :key="pack.amount"
          class="group rounded-2xl border border-line/30 bg-panel p-5 transition-all hover:border-amber/50 hover:shadow-lg hover:shadow-amber/10"
        >
          <div class="text-3xl mb-3">🪙</div>
          <div class="text-2xl font-bold text-bone mb-1">{{ pack.amount }}</div>
          <div class="text-xs text-moss mb-4">монет</div>
          <button
            type="button"
            class="w-full rounded-lg border border-amber/30 bg-amber/10 px-4 py-2.5 text-sm font-medium text-amber transition-all hover:bg-amber/20 active:scale-[0.97]"
            @click="buyCoins(pack.amount, pack.price)"
          >
            {{ pack.price }} ₽
          </button>
        </div>
      </div>
    </section>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-xl border border-lime/50 bg-lime/10 px-6 py-3 text-sm text-lime backdrop-blur-xl shadow-2xl shadow-lime/20"
    >
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
// TODO: Восстановить API purchase-requests в правильном синтаксисе Chatium
const createPurchaseRequestRoute = {
  run: async (_ctx: any, _body: any) => ({
    ok: false,
    error: "API временно недоступен",
  }),
};

const props = defineProps<{
  balance: number;
}>();

const purchasing = ref(false);
const successMessage = ref("");

const coinPacks = [
  { amount: 100, price: 50 },
  { amount: 500, price: 200 },
  { amount: 1000, price: 350 },
  { amount: 5000, price: 1500 },
];

async function buyPremium(type: "month" | "year", price: number) {
  if (purchasing.value) return;
  purchasing.value = true;

  try {
    const result = await createPurchaseRequestRoute.run(ctx, {
      type: type === "month" ? "premium_month" : "premium_year",
      amount: 1,
      price,
    });

    if (result.ok) {
      successMessage.value = "✓ Заявка отправлена владельцу. Ожидай одобрения!";
      setTimeout(() => {
        successMessage.value = "";
      }, 4000);
    }
  } catch (error) {
    console.error("Purchase error:", error);
  } finally {
    purchasing.value = false;
  }
}

async function buyCoins(amount: number, price: number) {
  if (purchasing.value) return;
  purchasing.value = true;

  try {
    const result = await createPurchaseRequestRoute.run(ctx, {
      type: "coins",
      amount,
      price,
    });

    if (result.ok) {
      successMessage.value = `✓ Заявка на ${amount} монет отправлена!`;
      setTimeout(() => {
        successMessage.value = "";
      }, 4000);
    }
  } catch (error) {
    console.error("Purchase error:", error);
  } finally {
    purchasing.value = false;
  }
}
</script>
