import { Heap } from '@app/heap'

const Collabs = Heap.Table('t_a5_collabs_T7E2', {
  title: Heap.String({ customMeta: { title: 'Название' } }),
  brief: Heap.String({ customMeta: { title: 'Бриф' } }),
  initiatorId: Heap.String({ customMeta: { title: 'Инициатор' } }),
  participantIds: Heap.Array(Heap.String(), { customMeta: { title: 'Участники' } }),
  status: Heap.Enum({ open: 'open', active: 'active', done: 'done' } as const, {
    customMeta: { title: 'Статус' },
  }),
  postId: Heap.Optional(Heap.String({ customMeta: { title: 'ID поста-анонса' } })),
}, {
  customMeta: {
    title: 'A5NET · Коллаборации',
    description: 'Совместные проекты участников: от открытого брифа до готовой работы',
  },
})

export default Collabs
