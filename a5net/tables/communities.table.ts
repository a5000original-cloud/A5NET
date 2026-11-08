import { Heap } from '@app/heap'

const Communities = Heap.Table('t_a5_communities_C6M1', {
  name: Heap.String({ customMeta: { title: 'Название' } }),
  slug: Heap.String({ customMeta: { title: 'Слаг' } }),
  description: Heap.String({ customMeta: { title: 'Описание' } }),
  topicId: Heap.String({ customMeta: { title: 'Тема' } }),
  coverHue: Heap.Number({ customMeta: { title: 'Оттенок' } }),
  creatorId: Heap.String({ customMeta: { title: 'Создатель' } }),
  memberIds: Heap.Array(Heap.String(), { customMeta: { title: 'Участники' } }),
}, {
  customMeta: {
    title: 'A5NET · Сообщества',
    description: 'Тематические круги: участники, последние публикации, вход и выход',
  },
})

export default Communities
