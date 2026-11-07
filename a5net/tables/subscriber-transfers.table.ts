import { Heap } from '@app/heap'

const SubscriberTransfers = Heap.Table('t_a5_subscriber_transfers_P4W8', {
  profileId: Heap.String({ customMeta: { title: 'Профиль' } }),
  platform: Heap.Enum({ telegram: 'telegram', youtube: 'youtube', tiktok: 'tiktok', vk: 'vk', other: 'other' } as const, {
    customMeta: { title: 'Площадка' },
  }),
  channelUrl: Heap.String({ customMeta: { title: 'Ссылка на канал' } }),
  screenshotUrl: Heap.Optional(Heap.String({ customMeta: { title: 'Скриншот статистики (URL)' } })),
  claimedCount: Heap.Number({ customMeta: { title: 'Заявленное число' } }),
  approvedCount: Heap.NonRequired(Heap.Number({ customMeta: { title: 'Подтверждено' } }), 0),
  status: Heap.Enum({ pending: 'pending', approved: 'approved', rejected: 'rejected' } as const, {
    customMeta: { title: 'Статус' },
  }),
  note: Heap.String({ customMeta: { title: 'Комментарий' } }),
  submittedBy: Heap.String({ customMeta: { title: 'Кто подал' } }),
  reviewedBy: Heap.Optional(Heap.String({ customMeta: { title: 'Кто проверил' } })),
  reviewedAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Проверено' } })),
}, {
  customMeta: {
    title: 'A5NET · Перенос подписчиков',
    description: 'Заявки на перенос аудитории с Telegram/YouTube: скриншот, число, ручное подтверждение A5000',
  },
})

export default SubscriberTransfers
