import { Heap } from '@app/heap'

const Notifications = Heap.Table('t_a5_notifications_N3W7', {
  recipientId: Heap.String({ customMeta: { title: 'Кому' } }),
  actorId: Heap.String({ customMeta: { title: 'От кого' } }),
  type: Heap.Enum(
    {
      like: 'like',
      comment: 'comment',
      reply: 'reply',
      mention: 'mention',
      friend_request: 'friend_request',
      friend_accept: 'friend_accept',
      subscriber: 'subscriber',
      system: 'system',
    } as const,
    { customMeta: { title: 'Тип' } },
  ),
  postId: Heap.Optional(Heap.String({ customMeta: { title: 'Пост' } })),
  commentId: Heap.Optional(Heap.String({ customMeta: { title: 'Комментарий' } })),
  text: Heap.String({ customMeta: { title: 'Текст' } }),
  read: Heap.Boolean({ customMeta: { title: 'Прочитано' } }),
}, {
  customMeta: {
    title: 'A5NET · Уведомления',
    description: 'Лайки, комментарии, ответы, заявки в друзья и важные события',
  },
})

export default Notifications
