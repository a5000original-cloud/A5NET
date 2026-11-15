import { requireMember, memberErrorCode } from "../../server/access";

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: "premium" | "coins";
  duration?: number;
  amount?: number;
}

export interface StoreListResult {
  products: StoreProduct[];
}

export const storeListRoute = app.get("/").handle(async (ctx) => {
  try {
    await requireMember(ctx);
    return {
      products: [
        {
          id: "prem_month",
          name: "A5NET PREM (Месяц)",
          description:
            "Бейдж Premium, эксклюзивные эффекты, приоритет в выдаче.",
          price: 100,
          currency: "RUB",
          type: "premium",
          duration: 30,
        },
        {
          id: "prem_year",
          name: "A5NET PREM (Год)",
          description: "Год Premium со скидкой 34%. Золотой бейдж.",
          price: 126,
          currency: "RUB",
          type: "premium",
          duration: 365,
        },
        {
          id: "coins_3000",
          name: "3000 A5 Coins",
          description: "Валюта для покупки Premium и артефактов.",
          price: 3000,
          currency: "COINS",
          type: "coins",
          amount: 3000,
        },
        {
          id: "coins_1000",
          name: "1000 A5 Coins",
          description: "Стартовый пакет монет.",
          price: 1000,
          currency: "COINS",
          type: "coins",
          amount: 1000,
        },
        {
          id: "coins_5000",
          name: "5000 A5 Coins",
          description: "Выгодный пакет — +1000 монет бонусом.",
          price: 5000,
          currency: "COINS",
          type: "coins",
          amount: 6000,
        },
      ],
    };
  } catch (error) {
    return { ok: false as const, error: memberErrorCode(error) };
  }
});
