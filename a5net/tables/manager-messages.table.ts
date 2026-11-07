import { Heap } from '@app/heap'

const ManagerMessages = Heap.Table('t_a5_manager_messages_M8R4', {
  userId: Heap.String({ customMeta: { title: 'ID пользователя платформы' } }),
  profileId: Heap.String({ customMeta: { title: 'ID профиля A5NET' } }),
  role: Heap.Enum({ user: 'user', bot: 'bot' } as const, { customMeta: { title: 'Кто написал' } }),
  text: Heap.String({ customMeta: { title: 'Текст сообщения' } }),
  intent: Heap.Optional(Heap.String({ customMeta: { title: 'Тема ответа бота' } })),
}, {
  customMeta: {
    title: 'A5NET · Менеджер',
    description: 'История диалогов с ботом-помощником: вопрос участника, ответ бота и тема',
  },
})

export default ManagerMessages
