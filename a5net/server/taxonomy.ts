export interface TopicNode {
  id: string
  label: string
  parent: string | null
  hue: number
}

export const TOPICS: TopicNode[] = [
  { id: 'music', label: 'Музыка', parent: null, hue: 268 },
  { id: 'indie', label: 'Инди', parent: 'music', hue: 276 },
  { id: 'shoegaze', label: 'Шугейз', parent: 'indie', hue: 288 },
  { id: 'techno', label: 'Техно', parent: 'music', hue: 250 },
  { id: 'jazz', label: 'Джаз', parent: 'music', hue: 38 },
  { id: 'hiphop', label: 'Хип-хоп', parent: 'music', hue: 18 },
  { id: 'ambient', label: 'Эмбиент', parent: 'music', hue: 196 },
  { id: 'classical', label: 'Классика', parent: 'music', hue: 44 },
  { id: 'lofi', label: 'Лоу-фай', parent: 'music', hue: 154 },

  { id: 'tech', label: 'Технологии', parent: null, hue: 168 },
  { id: 'ai-agents', label: 'ИИ и агенты', parent: 'tech', hue: 162 },
  { id: 'security', label: 'Кибербезопасность', parent: 'tech', hue: 140 },
  { id: 'gadgets', label: 'Гаджеты', parent: 'tech', hue: 184 },
  { id: 'opensource', label: 'Опенсорс', parent: 'tech', hue: 128 },
  { id: 'interfaces', label: 'Интерфейсы', parent: 'tech', hue: 208 },

  { id: 'cinema', label: 'Кино', parent: null, hue: 344 },
  { id: 'arthouse', label: 'Артхаус', parent: 'cinema', hue: 336 },
  { id: 'documentary', label: 'Документалки', parent: 'cinema', hue: 24 },
  { id: 'scifi', label: 'Sci-fi', parent: 'cinema', hue: 220 },
  { id: 'anime', label: 'Аниме', parent: 'cinema', hue: 312 },

  { id: 'literature', label: 'Литература', parent: null, hue: 32 },
  { id: 'poetry', label: 'Поэзия', parent: 'literature', hue: 350 },
  { id: 'nonfiction', label: 'Нон-фикшн', parent: 'literature', hue: 48 },
  { id: 'fiction', label: 'Фантастика', parent: 'literature', hue: 214 },

  { id: 'city', label: 'Город', parent: null, hue: 96 },
  { id: 'architecture', label: 'Архитектура', parent: 'city', hue: 84 },
  { id: 'bikes', label: 'Велосипеды', parent: 'city', hue: 108 },
  { id: 'coffee', label: 'Кофе', parent: 'city', hue: 28 },
  { id: 'nightlife', label: 'Ночная жизнь', parent: 'city', hue: 300 },

  { id: 'games', label: 'Игры', parent: null, hue: 190 },
  { id: 'indie-games', label: 'Инди-игры', parent: 'games', hue: 174 },
  { id: 'retro-games', label: 'Ретро-игры', parent: 'games', hue: 46 },

  { id: 'science', label: 'Наука', parent: null, hue: 204 },
  { id: 'space', label: 'Космос', parent: 'science', hue: 232 },
  { id: 'neuro', label: 'Нейробиология', parent: 'science', hue: 320 },
  { id: 'climate', label: 'Климат', parent: 'science', hue: 118 },

  { id: 'art', label: 'Искусство', parent: null, hue: 280 },
  { id: 'photography', label: 'Фотография', parent: 'art', hue: 264 },
  { id: 'contemporary', label: 'Современное искусство', parent: 'art', hue: 302 },
  { id: 'typography', label: 'Типографика', parent: 'art', hue: 0 },

  { id: 'food', label: 'Еда', parent: null, hue: 12 },
  { id: 'wine', label: 'Вино', parent: 'food', hue: 348 },
  { id: 'homecooking', label: 'Домашняя кухня', parent: 'food', hue: 22 },

  { id: 'sport', label: 'Спорт', parent: null, hue: 150 },
  { id: 'running', label: 'Бег', parent: 'sport', hue: 136 },
  { id: 'skate', label: 'Скейт', parent: 'sport', hue: 52 },
  { id: 'climbing', label: 'Скалолазание', parent: 'sport', hue: 88 },
]

export const TOPIC_MAP: Record<string, TopicNode> = Object.fromEntries(
  TOPICS.map(topic => [topic.id, topic]),
)

export const LEAF_TOPICS = TOPICS.filter(topic => !TOPICS.some(child => child.parent === topic.id))

export function topicById(id: string): TopicNode {
  return TOPIC_MAP[id] ?? { id, label: id, parent: null, hue: 120 }
}

export function topicLabel(id: string): string {
  return topicById(id).label
}

export function topicPath(id: string): string {
  const parts: string[] = []
  let current = TOPIC_MAP[id]
  let guard = 0
  while (current && guard < 6) {
    parts.unshift(current.label)
    current = current.parent ? TOPIC_MAP[current.parent] : undefined
    guard += 1
  }
  return parts.join(' → ') || id
}

export function topicAncestors(id: string): string[] {
  const result: string[] = []
  let current = TOPIC_MAP[id]
  let guard = 0
  while (current && guard < 6) {
    result.push(current.id)
    current = current.parent ? TOPIC_MAP[current.parent] : undefined
    guard += 1
  }
  return result
}
