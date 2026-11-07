import { Heap } from '@app/heap'

const Edges = Heap.Table('t_a5_edges_W8N4', {
  fromId: Heap.String({ customMeta: { title: 'От профиля' } }),
  toId: Heap.String({ customMeta: { title: 'К профилю или теме' } }),
  kind: Heap.Enum(
    {
      follow: 'follow',
      like: 'like',
      dislike: 'dislike',
      comment: 'comment',
      friend_request: 'friend_request',
      collab: 'collab',
      topic: 'topic',
    } as const,
    { customMeta: { title: 'Тип ребра' } },
  ),
  postId: Heap.Optional(Heap.String({ customMeta: { title: 'ID поста' } })),
  weight: Heap.Number({ customMeta: { title: 'Вес' } }),
}, {
  customMeta: {
    title: 'A5NET · Граф интересов',
    description: 'Рёбра FOLLOWS / LIKED / COMMENTED_ON / FRIEND_REQUEST_SENT / COLLAB',
  },
})

export default Edges
