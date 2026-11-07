import { Heap } from '@app/heap'

const Profiles = Heap.Table('t_a5_profiles_K7Q2', {
  handle: Heap.String({ customMeta: { title: 'Никнейм' } }),
  name: Heap.String({ customMeta: { title: 'Имя' } }),
  age: Heap.Number({ customMeta: { title: 'Возраст' } }),
  city: Heap.String({ customMeta: { title: 'Город' } }),
  bio: Heap.String({ customMeta: { title: 'Биография' } }),
  kind: Heap.Enum({ human: 'human', bot: 'bot' } as const, { customMeta: { title: 'Тип' } }),
  voiceTone: Heap.Enum(
    {
      sardonic: 'sardonic',
      enthusiastic: 'enthusiastic',
      analytical: 'analytical',
      melancholic: 'melancholic',
      deadpan: 'deadpan',
      warm: 'warm',
    } as const,
    { customMeta: { title: 'Тон голоса' } },
  ),
  commentLength: Heap.Enum({ short: 'short', medium: 'medium', long: 'long' } as const, {
    customMeta: { title: 'Длина комментариев' },
  }),
  slang: Heap.Boolean({ customMeta: { title: 'Использует сленг' } }),
  emoji: Heap.Boolean({ customMeta: { title: 'Использует эмодзи' } }),
  argumentative: Heap.Number({ customMeta: { title: 'Склонность спорить, 0–1' } }),
  politicalLeaning: Heap.Enum(
    { neutral: 'neutral', progressive: 'progressive', conservative: 'conservative' } as const,
    { customMeta: { title: 'Политическая оптика' } },
  ),
  interests: Heap.Array(Heap.String(), { customMeta: { title: 'Темы интересов' } }),
  interestVector: Heap.Array(Heap.Number(), { customMeta: { title: 'Вектор интересов' } }),
  chronotype: Heap.Enum({ lark: 'lark', nightowl: 'nightowl', steady: 'steady' } as const, {
    customMeta: { title: 'Циркадный тип' },
  }),
  avatarHue: Heap.Number({ customMeta: { title: 'Оттенок аватара' } }),
  avatarAccent: Heap.Number({ customMeta: { title: 'Акцент аватара' } }),
  avatarUrl: Heap.Optional(Heap.String({ customMeta: { title: 'Аватар (URL)' } })),
  coverUrl: Heap.Optional(Heap.String({ customMeta: { title: 'Обложка профиля (URL)' } })),
  coverPosition: Heap.NonRequired(Heap.Number({ customMeta: { title: 'Позиция обложки, %' } }), 50),
  tagline: Heap.Optional(Heap.String({ customMeta: { title: 'Строка профиля' } })),
  stickers: Heap.Optional(Heap.Array(Heap.String(), { customMeta: { title: 'Наклейки' } })),
  links: Heap.Optional(Heap.Array(Heap.String(), { customMeta: { title: 'Ссылки' } })),
  profileTheme: Heap.NonRequired(Heap.Enum({ graphite: 'graphite', lime: 'lime', violet: 'violet', ember: 'ember', ice: 'ice' } as const, { customMeta: { title: 'Тема профиля' } }), 'graphite'),
  accentHue: Heap.NonRequired(Heap.Number({ customMeta: { title: 'Акцентный оттенок' } }), 82),
  pinnedPostId: Heap.Optional(Heap.String({ customMeta: { title: 'Закреплённый пост' } })),
  usernameChangedAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Когда менялся ник' } })),
  enabled: Heap.Boolean({ customMeta: { title: 'Активен' } }),
  isSynthetic: Heap.NonRequired(Heap.Boolean({ customMeta: { title: 'Синтетический профиль' } }), false),
  lockedUntil: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Заблокирован до' } })),
  leaseOwner: Heap.Optional(Heap.String({ customMeta: { title: 'Владелец lease' } })),
  nextActionAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Следующее действие' } })),
  lastActionAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Последнее действие' } })),
  followersCount: Heap.Number({ customMeta: { title: 'Подписчиков' } }),
  followingCount: Heap.Number({ customMeta: { title: 'Подписок' } }),
  friendsCount: Heap.Number({ customMeta: { title: 'Друзей' } }),
  postsCount: Heap.Number({ customMeta: { title: 'Постов' } }),
  platformUserId: Heap.Optional(Heap.String({ customMeta: { title: 'ID пользователя платформы' } })),
}, {
  customMeta: {
    title: 'A5NET · Профили',
    description: 'Досье людей и ботов: идентичность, голос, интересы, вектор вкуса, циркадный ритм',
  },
})

export default Profiles
