import { Heap } from '@app/heap'

const Invites = Heap.Table('t_a5_invites_Q2Y7', {
  code: Heap.String({ customMeta: { title: 'Код (legacy, только до миграции)' } }),
  codeHash: Heap.Optional(Heap.String({ customMeta: { title: 'Хэш кода' } })),
  note: Heap.String({ customMeta: { title: 'Комментарий' } }),
  maxUses: Heap.Number({ customMeta: { title: 'Максимум использований' } }),
  uses: Heap.Number({ customMeta: { title: 'Использовано' } }),
  active: Heap.Boolean({ customMeta: { title: 'Активен' } }),
  createdByProfileId: Heap.String({ customMeta: { title: 'Создал профиль' } }),
  expiresAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Истекает' } })),
}, {
  customMeta: { title: 'A5NET · Инвайты', description: 'Закрытый вход: коды, лимиты и история использования' },
})

export default Invites
