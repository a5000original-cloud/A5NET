import PremiumItems from "../tables/premium-items.table";

const SEED_ITEMS: Array<{
  name: string;
  description: string;
  type: "seal" | "shard" | "frame" | "effect" | "sticker";
  rarity: "common" | "rare" | "epic" | "legendary" | "founder";
}> = [
  // ── Founder ──
  {
    name: "Печать Основателя",
    description: "Уникальная печать Основателя. Только для ранней поддержки.",
    type: "seal",
    rarity: "founder",
  },
  {
    name: "Печать Пустоты",
    description:
      "Оттиск, который видят только избранные. В ней — тишина между словами.",
    type: "seal",
    rarity: "founder",
  },

  // ── Legendary seals ──
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
    name: "Печать Угля",
    description: "Сгорает после прочтения. Остается только воспоминание о ней.",
    type: "seal",
    rarity: "legendary",
  },
  {
    name: "Печать Эха",
    description: "Повторяет твои слова через неделю — но уже чужим голосом.",
    type: "seal",
    rarity: "legendary",
  },
  {
    name: "Печать Рубина",
    description: "Краснеет, когда кто-то лжёт в твоём присутствии.",
    type: "seal",
    rarity: "legendary",
  },

  // ── Legendary shards ──
  {
    name: "Осколок",
    description: "Осколок памяти. Эпическая редкость.",
    type: "shard",
    rarity: "epic",
  },
  {
    name: "Осколок Рассвета",
    description: "Светится в руках первого, кто скажет правду.",
    type: "shard",
    rarity: "legendary",
  },
  {
    name: "Осколок Тени",
    description: "Показывает отражение, которое не совпадает с реальностью.",
    type: "shard",
    rarity: "legendary",
  },

  // ── Legendary frames ──
  {
    name: "Корона Пустоты",
    description: "Кадр-корона из глубин платформы. Легендарная рамка.",
    type: "frame",
    rarity: "legendary",
  },
  {
    name: "Ночной контур",
    description:
      "Обводит профиль невидимым светом. Видно только после полуночи.",
    type: "frame",
    rarity: "legendary",
  },
  {
    name: "Гравировка",
    description: "Надпись появляется и исчезает. Текст меняется каждый день.",
    type: "frame",
    rarity: "legendary",
  },

  // ── Epic frames ──
  {
    name: "Рамка A5",
    description: "Символ принадлежности. Минимализм, который узнают свои.",
    type: "frame",
    rarity: "epic",
  },
  {
    name: "Цифровой шум",
    description: "Профиль мерцает, будто сигнал из другого измерения.",
    type: "frame",
    rarity: "epic",
  },
  {
    name: "Серебряный узор",
    description: "Плетётся из строк кода. Видим только участники сети.",
    type: "frame",
    rarity: "epic",
  },

  // ── Legendary effects ──
  {
    name: "Хроно-фрагмент",
    description: "Фрагмент времени. Редкий визуальный эффект.",
    type: "effect",
    rarity: "rare",
  },
  {
    name: "Шум",
    description: "Поверх постов ложится зернистость — будто плёнка 1987 года.",
    type: "effect",
    rarity: "legendary",
  },
  {
    name: "Сканлайн",
    description:
      "Линия сканирования проходит через каждый пост. Эффект старого монитора.",
    type: "effect",
    rarity: "legendary",
  },
  {
    name: "Печать на лету",
    description: "Водяной знак появляется на экране зрителя и растворяется.",
    type: "effect",
    rarity: "legendary",
  },
  {
    name: "Тишина",
    description:
      "Убирает все анимации. Полная статика. Для тех, кто устал от движения.",
    type: "effect",
    rarity: "legendary",
  },

  // ── Epic effects ──
  {
    name: "Полёт частиц",
    description:
      "Мелкие точки поднимаются от нижнего края к верху. Как снег вверх.",
    type: "effect",
    rarity: "epic",
  },
  {
    name: "Двоение",
    description:
      "Каждый второй пиксель смещается на полпикселя. Эффект расфокуса.",
    type: "effect",
    rarity: "epic",
  },

  // ── Rare effects ──
  {
    name: "Свечение контуров",
    description: "Обводит текст тонкой неоновой линией. Видно в темноте.",
    type: "effect",
    rarity: "rare",
  },

  // ── Epic stickers ──
  {
    name: "Фрактальный Глаз",
    description: "Наблюдающий глаз фракталов. Эпическая наклейка.",
    type: "sticker",
    rarity: "epic",
  },
  {
    name: "Символ Связи",
    description: "Два кольца, переплетённые в узел. Символ участников A5NET.",
    type: "sticker",
    rarity: "epic",
  },
  {
    name: "Чёрный квадрат",
    description: "Ничего не показывает. Но каждый видит в нём что-то своё.",
    type: "sticker",
    rarity: "epic",
  },
  {
    name: "Маска Безмолвия",
    description: "Наклейка-фильтр. Скрывает эмоции и заменяет их символом.",
    type: "sticker",
    rarity: "epic",
  },

  // ── Rare stickers ──
  {
    name: "Значок Первого Голоса",
    description: "Для тех, кто написал первый комментарий в каждом топике.",
    type: "sticker",
    rarity: "rare",
  },
  {
    name: "Значок Ночного Стража",
    description: "Активен с 23:00 до 06:00. Видно только в ночную смену.",
    type: "sticker",
    rarity: "rare",
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
