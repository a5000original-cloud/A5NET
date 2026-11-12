import { Heap } from "@app/heap";

const PremiumItems = Heap.Table(
  "t_a5_premium_items_M4R8",
  {
    name: Heap.String({ customMeta: { title: "Название" } }),
    description: Heap.String({ customMeta: { title: "Описание" } }),
    type: Heap.Enum(
      {
        seal: "seal",
        shard: "shard",
        frame: "frame",
        effect: "effect",
        sticker: "sticker",
      } as const,
      { customMeta: { title: "Тип" } },
    ),
    rarity: Heap.Enum(
      {
        common: "common",
        rare: "rare",
        epic: "epic",
        legendary: "legendary",
        founder: "founder",
      } as const,
      { customMeta: { title: "Редкость" } },
    ),
    imageUrl: Heap.String({ customMeta: { title: "Картинка" } }),
  },
  {
    customMeta: {
      title: "A5NET · Каталог товаров",
      description:
        "Каталог эксклюзивных товаров: печати, осколки, рамки, эффекты, наклейки",
    },
  },
);

export default PremiumItems;
