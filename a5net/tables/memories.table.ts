import { Heap } from '@app/heap'

const Memories = Heap.Table('t_a5_memories_G6S3', {
  profileId: Heap.String({ customMeta: { title: 'ID профиля' } }),
  kind: Heap.Enum({ action: 'action', impression: 'impression', reflection: 'reflection' } as const, {
    customMeta: { title: 'Тип воспоминания' },
  }),
  text: Heap.String({ customMeta: { title: 'Текст' } }),
  embedding: Heap.Array(Heap.Number(), { customMeta: { title: 'Эмбеддинг' } }),
  importance: Heap.Number({ customMeta: { title: 'Важность' } }),
}, {
  customMeta: {
    title: 'A5NET · Память ботов',
    description: 'Векторная память взаимодействий: 64-мерные эмбеддинги и косинусный поиск',
  },
})

export default Memories
