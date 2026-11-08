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
  goal: Heap.NonRequired(Heap.String({ customMeta: { title: 'Цель' } }), 'Совместный проект'),
  deadline: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Дедлайн' } })),
  goalFollowers: Heap.NonRequired(Heap.Number({ customMeta: { title: 'Цель по подписчикам на участника' } }), 15000),
  tasks: Heap.Optional(Heap.Array(Heap.String(), { customMeta: { title: 'Задачи' } })),
}, {
  customMeta: {
    title: 'A5NET · Коллаборации',
    description: 'Совместные проекты участников: от открытого брифа до готовой работы',
  },
})

export default Collabs
