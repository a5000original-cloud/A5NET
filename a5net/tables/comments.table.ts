import { Heap } from '@app/heap'

const Comments = Heap.Table('t_a5_comments_H4T1', {
  postId: Heap.String({ customMeta: { title: 'ID поста' } }),
  authorId: Heap.String({ customMeta: { title: 'ID автора' } }),
  text: Heap.String({ customMeta: { title: 'Текст' } }),
  publishedAt: Heap.DateTime({ customMeta: { title: 'Опубликовано' } }),
  likes: Heap.Number({ customMeta: { title: 'Лайки' } }),
  parentId: Heap.Optional(Heap.String({ customMeta: { title: 'ID родительского комментария' } })),
}, {
  customMeta: { title: 'A5NET · Комментарии', description: 'Живые реакции участников' },
})

export default Comments
