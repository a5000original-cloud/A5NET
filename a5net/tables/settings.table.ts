import { Heap } from '@app/heap'

const Settings = Heap.Table('t_a5_settings_V4K8', {
  key: Heap.String({ customMeta: { title: 'Ключ' } }),
  value: Heap.String({ customMeta: { title: 'Значение (JSON)' } }),
  isSecret: Heap.Boolean({ customMeta: { title: 'Секрет' } }),
}, {
  customMeta: { title: 'A5NET · Настройки', description: 'Пульт флота, пул LLM-провайдеров, состояние сида' },
})

export default Settings
