import { Heap } from "@app/heap";

const Events = Heap.Table(
  "t_a5_events_K7N2",
  {
    title: Heap.String({ customMeta: { title: "Название ивента" } }),
    hashtag: Heap.String({ customMeta: { title: "Хэштег" } }),
    eventType: Heap.Enum(
      {
        challenge: "challenge",
        vote: "vote",
      } as const,
      { customMeta: { title: "Тип ивента" } },
    ),
    prizeItemId: Heap.Optional(
      Heap.String({ customMeta: { title: "ID призового артефакта" } }),
    ),
    prizeSubscribers: Heap.Number({
      customMeta: { title: "Бонус подписчиков" },
    }),
    isActive: Heap.Boolean({ customMeta: { title: "Активен" } }),
    createdAt: Heap.DateTime({ customMeta: { title: "Создан" } }),
  },
  {
    customMeta: {
      title: "A5NET · Ивенты",
      description: "Челленджи и голосования сообщества",
    },
  },
);

export default Events;
