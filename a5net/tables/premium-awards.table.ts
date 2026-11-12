import { Heap } from "@app/heap";

const PremiumAwards = Heap.Table(
  "t_a5_premium_awards_K7T2",
  {
    profileId: Heap.String({ customMeta: { title: "ID профиля" } }),
    itemId: Heap.String({ customMeta: { title: "ID товара" } }),
    awardedBy: Heap.String({ customMeta: { title: "Кто выдал" } }),
    awardedAt: Heap.DateTime({ customMeta: { title: "Дата выдачи" } }),
    isActive: Heap.Boolean({ customMeta: { title: "Активен" } }),
  },
  {
    customMeta: {
      title: "A5NET · Выданные товары",
      description: "История выдачи эксклюзивных товаров профилям",
    },
  },
);

export default PremiumAwards;
