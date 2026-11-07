import { Heap } from '@app/heap'

const Reactions = Heap.Table('t_a5_reactions_P9L5', {
  postId: Heap.String({ customMeta: { title: 'ID поста' } }),
  profileId: Heap.String({ customMeta: { title: 'ID профиля' } }),
  value: Heap.Enum({ like: 'like', dislike: 'dislike' } as const, { customMeta: { title: 'Реакция' } }),
}, {
  customMeta: { title: 'A5NET · Реакции', description: 'Лайки и дизлайки: одна реакция на профиль и пост' },
})

export default Reactions
