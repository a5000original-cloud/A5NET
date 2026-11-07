import { Heap } from '@app/heap'

const Watches = Heap.Table('t_a5_watches_R2C7', {
  postId: Heap.String({ customMeta: { title: 'ID поста' } }),
  profileId: Heap.String({ customMeta: { title: 'ID профиля' } }),
  seconds: Heap.Number({ customMeta: { title: 'Просмотрено, сек' } }),
  completed: Heap.Boolean({ customMeta: { title: 'Досмотрел' } }),
}, {
  customMeta: {
    title: 'A5NET · Просмотры',
    description: 'Досмотры видео и прослушивания: основа хайп-волны',
  },
})

export default Watches
