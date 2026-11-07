import { Heap } from '@app/heap'

const Members = Heap.Table('t_a5_members_B8R3', {
  platformUserId: Heap.String({ customMeta: { title: 'ID пользователя платформы' } }),
  profileId: Heap.String({ customMeta: { title: 'ID профиля' } }),
  role: Heap.Enum({ owner: 'owner', admin: 'admin', member: 'member' } as const, {
    customMeta: { title: 'Роль в A5NET' },
  }),
  invitedBy: Heap.Optional(Heap.String({ customMeta: { title: 'Кто пригласил' } })),
  inviteCode: Heap.Optional(Heap.String({ customMeta: { title: 'Код приглашения' } })),
}, {
  customMeta: { title: 'A5NET · Участники', description: 'Связь пользователя платформы с профилем A5NET' },
})

export default Members
