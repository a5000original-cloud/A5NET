import { Heap } from "@app/heap";

const TrustedDevices = Heap.Table(
  "t_a5_trusted_devices_T4W7",
  {
    userId: Heap.String({ customMeta: { title: "ID пользователя" } }),
    deviceHash: Heap.String({ customMeta: { title: "Хэш устройства" } }),
    label: Heap.Optional(
      Heap.String({ customMeta: { title: "Метка устройства" } }),
    ),
    userAgent: Heap.Optional(
      Heap.String({ customMeta: { title: "User-Agent" } }),
    ),
    lastLogin: Heap.DateTime({ customMeta: { title: "Последний вход" } }),
    createdAt: Heap.DateTime({ customMeta: { title: "Создано" } }),
    revoked: Heap.Boolean({ customMeta: { title: "Отозвано" } }),
  },
  {
    customMeta: {
      title: "A5NET · Доверенные устройства",
      description: "A5PASS PRO: устройства для быстрого переключения аккаунтов",
    },
  },
);

export default TrustedDevices;
