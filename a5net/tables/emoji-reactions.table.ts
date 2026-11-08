import { Heap } from '@app/heap'

export const EMOJI_VALUES = ['fire', 'heart', 'lol', 'wow', 'sad', 'respect'] as const

const EmojiReactions = Heap.Table('t_a5_emoji_reactions_E9R2', {
  postId: Heap.String({ customMeta: { title: 'Пост' } }),
  profileId: Heap.String({ customMeta: { title: 'Профиль' } }),
  emoji: Heap.Enum({
    fire: 'fire',
    heart: 'heart',
    lol: 'lol',
    wow: 'wow',
    sad: 'sad',
    respect: 'respect',
  } as const, { customMeta: { title: 'Реакция' } }),
}, {
  customMeta: {
    title: 'A5NET · Реакции-эмодзи',
    description: '🔥 ❤️ 😂 😮 😢 🫡 на посты, видео и музыку; одна реакция каждого типа от профиля',
  },
})

export default EmojiReactions
