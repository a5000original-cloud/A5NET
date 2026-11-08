import { Heap } from "@app/heap";

const Posts = Heap.Table(
  "t_a5_posts_M3V8",
  {
    authorId: Heap.String({ customMeta: { title: "ID автора" } }),
    kind: Heap.Enum(
      {
        text: "text",
        video: "video",
        music: "music",
        collab: "collab",
        photo: "photo",
      } as const,
      {
        customMeta: { title: "Тип" },
      },
    ),
    title: Heap.String({ customMeta: { title: "Заголовок" } }),
    body: Heap.String({ customMeta: { title: "Текст" } }),
    publishedAt: Heap.DateTime({ customMeta: { title: "Опубликовано" } }),
    visibility: Heap.NonRequired(
      Heap.Enum({ visible: "visible", hidden: "hidden" } as const, {
        customMeta: { title: "Видимость" },
      }),
      "visible",
    ),
    topics: Heap.Array(Heap.String(), { customMeta: { title: "Темы" } }),
    mediaUrl: Heap.Optional(Heap.String({ customMeta: { title: "Медиа" } })),
    coverHue: Heap.Number({ customMeta: { title: "Оттенок обложки" } }),
    durationSec: Heap.Number({ customMeta: { title: "Длительность, сек" } }),
    hypeScore: Heap.Number({ customMeta: { title: "Хайп" } }),
    likes: Heap.Number({ customMeta: { title: "Лайки" } }),
    dislikes: Heap.Number({ customMeta: { title: "Дизлайки" } }),
    commentsCount: Heap.Number({ customMeta: { title: "Комментарии" } }),
    views: Heap.Number({ customMeta: { title: "Просмотры" } }),
    watchSeconds: Heap.Number({ customMeta: { title: "Секунды просмотра" } }),
    collabId: Heap.Optional(
      Heap.String({ customMeta: { title: "ID коллаборации" } }),
    ),
    mediaHash: Heap.Optional(
      Heap.String({ customMeta: { title: "Хэш медиа" } }),
    ),
    coverUrl: Heap.Optional(
      Heap.String({ customMeta: { title: "Обложка (URL)" } }),
    ),
    mimeType: Heap.Optional(Heap.String({ customMeta: { title: "MIME-тип" } })),
    sizeBytes: Heap.NonRequired(
      Heap.Number({ customMeta: { title: "Размер, байт" } }),
      0,
    ),
    mediaStatus: Heap.NonRequired(
      Heap.Enum(
        { ready: "ready", processing: "processing", failed: "failed" } as const,
        { customMeta: { title: "Статус медиа" } },
      ),
      "ready",
    ),
    source: Heap.NonRequired(
      Heap.Enum({ upload: "upload", seed: "seed", link: "link" } as const, {
        customMeta: { title: "Источник" },
      }),
      "seed",
    ),
    aspectRatio: Heap.Optional(
      Heap.Number({ customMeta: { title: "Соотношение сторон" } }),
    ),
    orientation: Heap.NonRequired(
      Heap.Enum({ horizontal: "horizontal", vertical: "vertical" } as const, {
        customMeta: { title: "Ориентация" },
      }),
      "horizontal",
    ),
    album: Heap.Optional(
      Heap.String({ customMeta: { title: "Альбом / серия" } }),
    ),
    pinned: Heap.NonRequired(
      Heap.Boolean({ customMeta: { title: "Закреплён" } }),
      false,
    ),
    promotedBy: Heap.Optional(
      Heap.String({ customMeta: { title: "Кто продвинул" } }),
    ),
    promoteLevel: Heap.Optional(
      Heap.Number({ customMeta: { title: "Уровень продвижения" } }),
    ),
    pollOptions: Heap.Optional(
      Heap.Array(Heap.String(), { customMeta: { title: "Варианты опроса" } }),
    ),
    pollVotes: Heap.Optional(
      Heap.Array(Heap.Number(), {
        customMeta: { title: "Голоса по вариантам" },
      }),
    ),
    pollExpiresAt: Heap.Optional(
      Heap.DateTime({ customMeta: { title: "Опрос истекает" } }),
    ),
  },
  {
    customMeta: {
      title: "A5NET · Посты",
      description: "Тексты, видеоэтюды, музыка и анонсы коллабораций",
    },
  },
);

export default Posts;
