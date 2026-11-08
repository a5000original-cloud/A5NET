import { Heap } from '@app/heap'

const OwnerDevices = Heap.Table('t_a5_owner_devices_D2S9', {
  profileId: Heap.String({ customMeta: { title: 'Профиль' } }),
  tokenHash: Heap.String({ customMeta: { title: 'Хэш токена' } }),
  label: Heap.String({ customMeta: { title: 'Устройство' } }),
  userAgent: Heap.String({ customMeta: { title: 'User-Agent' } }),
  revoked: Heap.Boolean({ customMeta: { title: 'Отозвано' } }),
  expiresAt: Heap.DateTime({ customMeta: { title: 'Действует до' } }),
  lastSeenAt: Heap.DateTime({ customMeta: { title: 'Последняя активность' } }),
}, {
  customMeta: {
    title: 'A5NET · Доверенные устройства',
    description: 'A5 Pass: устройства владельца, прошедшие личный пароль или код восстановления',
  },
})

export default OwnerDevices
