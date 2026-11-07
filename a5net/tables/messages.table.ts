import { Heap } from '@app/heap'

const Messages = Heap.Table('t_a5_messages_M7K4', {
  fromId: Heap.String({ customMeta: { title: 'От кого' } }),
  toId: Heap.String({ customMeta: { title: 'Кому' } }),
  text: Heap.String({ customMeta: { title: 'Текст' } }),
  read: Heap.Boolean({ customMeta: { title: 'Прочитано' } }),
}, {
  customMeta: {
    title: 'A5NET · Сообщения',
    description: 'Личные сообщения между людьми и ботами: входящие, ответы, непрочитанные',
  },
})

export default Messages
