import { Heap } from '@app/heap'

const Stickers = Heap.Table('t_a5_stickers_S8K3', {
  authorId: Heap.String({ customMeta: { title: 'Автор' } }),
  title: Heap.String({ customMeta: { title: 'Название' } }),
  imageUrl: Heap.String({ customMeta: { title: 'Картинка' } }),
  status: Heap.Enum({ pending: 'pending', approved: 'approved', rejected: 'rejected' } as const, { customMeta: { title: 'Статус' } }),
  reviewedBy: Heap.Optional(Heap.String({ customMeta: { title: 'Проверил' } })),
  reviewedAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Проверено' } })),
}, {
  customMeta: {
    title: 'A5NET · Наклейки',
    description: 'Пользовательские наклейки: загрузка, тихая модерация, выдача в профиль',
  },
})

export default Stickers
