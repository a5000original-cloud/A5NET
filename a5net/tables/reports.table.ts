import { Heap } from '@app/heap'

const Reports = Heap.Table('t_a5_reports_S3D7', {
  targetType: Heap.Enum({ post: 'post', comment: 'comment', profile: 'profile' } as const, {
    customMeta: { title: 'Тип цели' },
  }),
  targetId: Heap.String({ customMeta: { title: 'ID цели' } }),
  reason: Heap.Enum({ spam: 'spam', abuse: 'abuse', offtopic: 'offtopic', other: 'other' } as const, {
    customMeta: { title: 'Причина' },
  }),
  note: Heap.String({ customMeta: { title: 'Комментарий' } }),
  reporterId: Heap.String({ customMeta: { title: 'Кто пожаловался' } }),
  status: Heap.Enum({ open: 'open', resolved: 'resolved', dismissed: 'dismissed' } as const, {
    customMeta: { title: 'Статус' },
  }),
  handledBy: Heap.Optional(Heap.String({ customMeta: { title: 'Кто обработал' } })),
  resolution: Heap.Optional(Heap.String({ customMeta: { title: 'Решение' } })),
}, {
  customMeta: {
    title: 'A5NET · Жалобы',
    description: 'Очередь модерации: посты, комментарии и профили',
  },
})

export default Reports
