import PremiumItems from "../tables/premium-items.table";

const SEED_ITEMS: Array<{
  name: string;
  description: string;
  type: "seal" | "shard" | "frame" | "effect" | "sticker";
  rarity: "common" | "rare" | "epic" | "legendary" | "founder";
}> = [
  {
    name: "Печать Основателя",
    description: "Уникальная печать Основателя. Только для ранней поддержки.",
    type: "seal",
    rarity: "founder",
  },
  {
    name: "Печать Ночи",
    description: "Печать ночного сообщества. Редкость — легендарная.",
    type: "seal",
    rarity: "legendary",
  },
  {
    name: "Печать Стали",
    description: "Печать стабильности и силы. Легендарная редкость.",
    type: "seal",
    rarity: "legendary",
  },
  {
    name: "Печать Шёпота",
    description: "Печать тайн и полутеней. Легендарная редкость.",
    type: "seal",
    rarity: "legendary",
  },
  {
    name: "Осколок",
    description: "Осколок памяти. Эпическая редкость.",
    type: "shard",
    rarity: "epic",
  },
  {
    name: "Корона Пустоты",
    description: "Кадр-корона из глубин платформы. Легендарная рамка.",
    type: "frame",
    rarity: "legendary",
  },
  {
    name: "Хроно-фрагмент",
    description: "Фрагмент времени. Редкий визуальный эффект.",
    type: "effect",
    rarity: "rare",
  },
  {
    name: "Фрактальный Глаз",
    description: "Наблюдающий глаз фракталов. Эпическая наклейка.",
    type: "sticker",
    rarity: "epic",
  },
];

export async function seedPremiumItems(ctx: app.Ctx): Promise<number> {
  const existing = await PremiumItems.countBy(ctx, {});
  if (existing > 0) return 0;

  for (const item of SEED_ITEMS) {
    await PremiumItems.create(ctx, {
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      imageUrl: "",
    });
  }

  return SEED_ITEMS.length;
}
