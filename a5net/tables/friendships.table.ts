import { Heap } from '@app/heap'

const Friendships = Heap.Table('t_a5_friendships_D1F6', {
  aId: Heap.String({ customMeta: { title: 'Первый профиль' } }),
  bId: Heap.String({ customMeta: { title: 'Второй профиль' } }),
  status: Heap.Enum({ pending: 'pending', accepted: 'accepted', declined: 'declined' } as const, {
    customMeta: { title: 'Статус' },
  }),
  requestedBy: Heap.String({ customMeta: { title: 'Кто запросил' } }),
}, {
  customMeta: { title: 'A5NET · Дружба', description: 'Заявки и подтверждённые связи между профилями' },
})

export default Friendships
