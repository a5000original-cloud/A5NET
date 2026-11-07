import { Heap } from '@app/heap'

const ModerationActions = Heap.Table('t_a5_moderation_actions_T6M1', {
  targetType: Heap.Enum({ post: 'post', comment: 'comment', profile: 'profile' } as const, {
    customMeta: { title: 'Тип цели' },
  }),
  targetId: Heap.String({ customMeta: { title: 'ID цели' } }),
  action: Heap.Enum({ hide: 'hide', restore: 'restore', delete: 'delete', mute: 'mute', warn: 'warn' } as const, {
    customMeta: { title: 'Действие' },
  }),
  moderatorId: Heap.String({ customMeta: { title: 'Модератор' } }),
  reason: Heap.String({ customMeta: { title: 'Причина' } }),
}, {
  customMeta: {
    title: 'A5NET · Действия модерации',
    description: 'История hide/restore/delete/mute/warn',
  },
})

export default ModerationActions
