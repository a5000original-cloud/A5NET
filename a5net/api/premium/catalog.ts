import PremiumItems from "../../tables/premium-items.table";
import PremiumAwards from "../../tables/premium-awards.table";

const SEED_ITEMS: Array<{
  id: string;
  name: string;
  description: string;
  type: "seal" | "shard" | "frame" | "effect" | "sticker";
  rarity: "common" | "rare" | "epic" | "legendary" | "founder";
  imageUrl: string;
  animationType: "pulse" | "rotate" | "fog" | "shimmer" | "none";
}> = [
  {
    id: "founder-seal",
    name: "Печать Основателя",
    description: "Пульсирующая лаймовая аура. Вечный статус первого круга.",
    type: "seal",
    rarity: "founder",
    imageUrl: "",
    animationType: "pulse",
  },
  {
    id: "legendary-shard",
    name: "Осколок Легенды",
    description: "Вращающееся золотое сияние. Раритетный артефакт платформы.",
    type: "shard",
    rarity: "legendary",
    imageUrl: "",
    animationType: "rotate",
  },
  {
    id: "epic-frame",
    name: "Рамка Эпика",
    description: "Фиолетовый туман окутывает профиль. Властелин контента.",
    type: "frame",
    rarity: "epic",
    imageUrl: "",
    animationType: "fog",
  },
  {
    id: "rare-effect",
    name: "Эффект Редкости",
    description: "Лёгкий голубой шиммер. Для активных участников.",
    type: "effect",
    rarity: "rare",
    imageUrl: "",
    animationType: "shimmer",
  },
  {
    id: "common-sticker",
    name: "Наклейка Новичка",
    description: "Базовый стикер для первого шага в коллекции.",
    type: "sticker",
    rarity: "common",
    imageUrl: "",
    animationType: "none",
  },
];

async function seedItems(ctx: app.Ctx): Promise<void> {
  const existing = await PremiumItems.findAll(ctx, { limit: 1 });
  if (existing.length > 0) return;
  for (const item of SEED_ITEMS) {
    await PremiumItems.create(ctx, item);
  }
}

export const premiumCatalogRoute = app
  .get("/")
  .query((q) => ({ profileId: q.string().max(64).optional() }))
  .handle(async (ctx, req) => {
    await seedItems(ctx);
    const items = await PremiumItems.findAll(ctx, { limit: 100 });
    const result: {
      items: (typeof PremiumItems.T)[];
      awards?: (typeof PremiumItems.T)[];
    } = { items };

    if (req.query.profileId) {
      const awards = await PremiumAwards.findAll(ctx, {
        where: { profileId: req.query.profileId, isActive: true },
        limit: 100,
      });
      const itemById = new Map(items.map((i) => [i.id, i]));
      result.awards = awards
        .map((a) => itemById.get(a.itemId))
        .filter((i): i is typeof PremiumItems.T => i != null);
    }

    return result;
  });
