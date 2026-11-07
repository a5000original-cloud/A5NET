import { Heap } from '@app/heap'

const RateLimits = Heap.Table('t_a5_rate_limits_R8L2', {
  key: Heap.String({ customMeta: { title: 'Ключ лимита' } }),
  windowStart: Heap.DateTime({ customMeta: { title: 'Начало окна' } }),
  count: Heap.Number({ customMeta: { title: 'Счётчик' } }),
}, {
  customMeta: {
    title: 'A5NET · Лимиты',
    description: 'Fixed-window счётчики: инвайты, посты, комментарии, реакции, заявки',
  },
})

export default RateLimits
