import { Heap } from '@app/heap'

const Posts = Heap.Table('t_a5_posts_M3V8', {
  authorId: Heap.String({ customMeta: { title: 'ID автора' } }),
  kind: Heap.Enum({ text: 'text', video: 'video', music: 'music', collab: 'collab' } as const, {
    customMeta: { title: 'Тип' },
  }),
  title: Heap.String({ customMeta: { title: 'Заголовок' } }),
  body: Heap.String({ customMeta: { title: 'Текст' } }),
  publishedAt: Heap.DateTime({ customMeta: { title: 'Опубликовано' } }),
  topics: Heap.Array(Heap.String(), { customMeta: { title: 'Темы' } }),
  mediaUrl: Heap.Optional(Heap.String({ customMeta: { title: 'Медиа' } })),
  coverHue: Heap.Number({ customMeta: { title: 'Оттенок обложки' } }),
  durationSec: Heap.Number({ customMeta: { title: 'Длительность, сек' } }),
  hypeScore: Heap.Number({ customMeta: { title: 'Хайп' } }),
  likes: Heap.Number({ customMeta: { title: 'Лайки' } }),
  dislikes: Heap.Number({ customMeta: { title: 'Дизлайки' } }),
  commentsCount: Heap.Number({ customMeta: { title: 'Комментарии' } }),
  views: Heap.Number({ customMeta: { title: 'Просмотры' } }),
  watchSeconds: Heap.Number({ customMeta: { title: 'Секунды просмотра' } }),
  collabId: Heap.Optional(Heap.String({ customMeta: { title: 'ID коллаборации' } })),
}, {
  customMeta: {
    title: 'A5NET · Посты',
    description: 'Тексты, видеоэтюды, музыка и анонсы коллабораций',
  },
})

export default Posts
