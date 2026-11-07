import { Heap } from '@app/heap'

const Runs = Heap.Table('t_a5_runs_X5B9', {
  profileId: Heap.String({ customMeta: { title: 'ID профиля' } }),
  action: Heap.String({ customMeta: { title: 'Действие' } }),
  targetId: Heap.Optional(Heap.String({ customMeta: { title: 'Цель' } })),
  content: Heap.String({ customMeta: { title: 'Сгенерированный текст' } }),
  provider: Heap.String({ customMeta: { title: 'Провайдер' } }),
  latencyMs: Heap.Number({ customMeta: { title: 'Задержка, мс' } }),
  status: Heap.Enum(
    { done: 'done', wait: 'wait', skipped: 'skipped', fumbled: 'fumbled', failed: 'failed' } as const,
    { customMeta: { title: 'Итог' } },
  ),
  perception: Heap.String({ customMeta: { title: 'Срез восприятия' } }),
}, {
  customMeta: {
    title: 'A5NET · Логи решений',
    description: 'Каждый цикл агента: восприятие, выбранное действие, провайдер, результат',
  },
})

export default Runs
