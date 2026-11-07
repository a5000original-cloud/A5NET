import type { PersonaDraft } from './personas'
import { topicAncestors } from '../taxonomy'
import { cosine, jaccard, postVector } from '../vec'
import { hashSeed, mulberry32, pick, weighted } from '../rng'
import { trackAsset, videoAsset } from '../media'

export type BotAction =
  | 'POST'
  | 'LIKE'
  | 'DISLIKE'
  | 'COMMENT'
  | 'FRIEND_REQUEST'
  | 'FOLLOW'
  | 'WATCH_VIDEO'
  | 'JOIN_COLLAB'
  | 'WAIT'

export interface LocalPost {
  id: string
  authorId: string
  kind: string
  title: string
  body: string
  topics: string[]
  durationSec: number
  hypeScore: number
}

export interface DecisionContext {
  persona: PersonaDraft
  feed: LocalPost[]
  friends: Set<string>
  following: Set<string>
  pending: Set<string>
  authorInterests: Map<string, string[]>
  likeCounts: Map<string, number>
  aggressiveness: number
  hasCollabs: boolean
}

export interface LocalDecision {
  action: BotAction
  targetId?: string
  content: string
  watchTimeSeconds?: number
  reason: string
}

const VOICE_OPENERS: Record<string, string[]> = {
  sardonic: [
    '«{detail}» — это, конечно, заявка.',
    'Не думал, что мне понадобится «{detail}», но вот.',
    'Кто-то тут очень старался, и это заметно.',
    'Ну, «{detail}». Дальше можно не продолжать.',
    'Смотрю и понимаю: без этого можно было жить. Но уже поздно.',
    '«{detail}» звучит дороже, чем стоит. И всё равно работает.',
  ],
  enthusiastic: [
    '«{detail}» — и я пропал.',
    'Вот это я понимаю. «{detail}» — лучшее за сегодня.',
    'Не ожидал, что меня так зацепит.',
    '«{detail}» — это уже событие.',
    'Пересматриваю третий раз и нахожу новое.',
    'Такое хочется показать кому-то ещё, немедленно.',
  ],
  analytical: [
    '«{detail}» работает не за счёт идеи, а за счёт паузы перед ней.',
    'Интересно, как здесь собран контраст: «{detail}» и всё, что вокруг.',
    'Похоже на попытку поймать момент, когда всё ещё не решило, чем станет.',
    'Если убрать «{detail}», останется структура. Она держится.',
    'Здесь два слоя, и верхний — самый необязательный. Но именно он запоминается.',
    '«{detail}» — хороший тест: без звука остаётся каркас, и он честный.',
  ],
  melancholic: [
    '«{detail}» — и сразу почему-то ноябрь.',
    'Такое лучше смотреть один.',
    'Красиво и немного невыносимо.',
    '«{detail}» звучит как то, что уже было, но ты всё равно рад.',
    'Сохранил. Вернусь, когда будет настроение, которого сейчас нет.',
    'Смотрю и вспоминаю дорогу домой, которую давно не выбирал.',
  ],
  deadpan: [
    '«{detail}». Нормально.',
    'Посмотрел. Не сломалось.',
    'Без восторгов, но запомнил.',
    'Ожидал хуже. Это комплимент.',
    'Ок. В следующий раз добавь тишины в конце.',
    '«{detail}» — единственное, что тут держит.',
  ],
  warm: [
    '«{detail}» — очень тёплая штука.',
    'Люблю, когда не пытаются никого впечатлить.',
    'Смотрю и почему-то успокаиваюсь. Хороший знак.',
    '«{detail}» — то самое место, где становится тихо.',
    'Спасибо, что поделился. Правда.',
    'Береги это. И показывай ещё.',
  ],
}

const ROOT_TAILS: Record<string, string[]> = {
  music: [
    'Поставил в очередь на повтор.',
    'Теперь ищу, где это можно послушать целиком.',
    'Напомнило кассету, которую я стёр в 2016-м и до сих пор жалею.',
    'В наушниках звучит совсем иначе, чем на колонке.',
  ],
  tech: [
    'Проверил на себе: работает ровно наполовину, и это уже успех.',
    'Главное — не превратить это в культ.',
    'Забрал в закладки, вернусь через месяц.',
    'Хороший инструмент не требует объяснять, что ты с ним делаешь.',
  ],
  cinema: [
    'Пересмотрел дважды, второй раз без звука.',
    'Кадр с отражением — лучший, спорить бесполезно.',
    'Хочется, чтобы это было началом чего-то длинного.',
    'Титры тут важнее половины сцен.',
  ],
  city: [
    'Знаю это место, но никогда не видел его таким.',
    'Пойду проверю вечером, если не забуду.',
    'Город умеет быть тише, чем кажется.',
    'В семь вечера там совсем другой свет.',
  ],
  art: [
    'Плёнка всё ещё честнее пикселя, и это не ностальгия.',
    'Хочется потрогать, хотя нельзя.',
    'Композиция держится на одном пустом углу.',
    'Такую работу хочется видеть на стене, а не в ленте.',
  ],
  literature: [
    'Перечитал дважды, второй раз медленнее.',
    'Вот такие фразы хочется украсть, но нельзя.',
    'Книжка, которую я откладывал, снова в списке.',
    'Сноска тут важнее абзаца.',
  ],
  science: [
    'Люблю, когда сложное объясняют без снисхождения.',
    'Проверил по своим заметкам — сходится.',
    'Масштаб всё ещё не укладывается в голове.',
    'После такого хочется читать первоисточник.',
  ],
  games: [
    'Сохранился бы перед этим моментом.',
    'Вот за такие тихие сцены я и играю.',
    'Ретро ощущается честнее новых движков.',
    'Тут бы ещё полсекунды паузы, и было бы идеально.',
  ],
  food: [
    'Записал, попробую в выходные.',
    'Главное — не пережарить, я всегда пережариваю.',
    'Пахнет даже через экран, что странно.',
    'Такому не нужен рецепт, нужно настроение.',
  ],
  sport: [
    'После такого хочется выйти на улицу, но я подожду до утра.',
    'Уважаю темп, а не результат.',
    'Тело понимает раньше головы, это факт.',
    'На подъёме главное — не считать шаги.',
  ],
  default: [
    'Сохранил. Вернусь к этому вечером.',
    'Хорошая штука, без лишнего.',
    'Редко такое досматриваю до конца.',
    'Есть в этом что-то, что не хочется объяснять.',
  ],
}

const QUESTIONS = [
  'А ты сам как это нашёл?',
  'Что было дальше?',
  'Стоит идти на это живьём?',
  'Это ведь не последняя часть?',
  'Скинь ещё что-нибудь в этом духе.',
  'А как это выглядит без обработки?',
]

const CRITIQUES = [
  'Не моё. «{detail}» симпатичное, но всё остальное — как будто уже видел.',
  'Спорно. Красиво, но в середине пусто.',
  'Не хватило одного решения. Одного, но своего.',
  'Слишком гладко. Хочется шероховатости, как в живой записи.',
  'Похоже на черновик, который показали раньше времени.',
]

const EMOJI = ['🙂', '🫠', '🔥', '🌫️', '🎧', '📼', '🌃', '🧩']

const POST_TITLES: Record<string, string[]> = {
  music: ['Плейлист для медленного утра', 'Один трек, который держит неделю', 'Про шум, который лечит', 'Запись, которую я слушаю неправильно'],
  tech: ['Кнопка, которая делает слишком много', 'Агент, который не спешит', 'Заметки о том, как машины ошибаются красиво', 'Интерфейс без объяснений'],
  cinema: ['Кадр, в котором ничего не происходит', 'Фильм, который я пересматриваю раз в год', 'Про титры, которые лучше фильма', 'Сцена без слов'],
  city: ['Маршрут без цели', 'Город в шесть утра', 'Место, где всегда тихо', 'Двор, который не показывают на открытках'],
  art: ['Свет в семь вечера', 'Плёнка, которую я боюсь проявлять', 'Про пустой угол в композиции', 'Вывеска, которую скоро снимут'],
  literature: ['Книга, которую я откладываю третий год', 'Про сноски, которые важнее текста', 'Страница, которую хочется вырвать', 'Пометки на полях'],
  science: ['Масштаб, который не помещается в голову', 'Про погрешность в виде человека', 'Заметки после лекции', 'Тишина между сигналами'],
  games: ['Сцена, ради которой стоит сохраниться', 'Игра, которая не боится тишины', 'Пиксели, которые всё ещё работают', 'Уровень без врагов'],
  food: ['Ужин без рецепта', 'Вино, которое не стыдно открыть в среду', 'Про пережаренный лук', 'Завтрак в неправильное время'],
  sport: ['Утро, которое начинается с темпа', 'Про дыхание на подъёме', 'Склон, на котором не хочется говорить', 'Круг, который не считается'],
}

const POST_BODIES: Record<string, string[]> = {
  music: [
    'Собрал подборку для тех, кто не может начать день без вступления длиннее минуты.',
    'Вчера поставил на повтор и забыл выключить. В итоге дослушал до конца три раза.',
    'Кажется, я наконец понял, зачем нужны паузы между треками.',
  ],
  tech: [
    'Чем больше смотрю на интерфейсы, тем больше верю в маленькие кнопки и большие отступы.',
    'Сегодня объяснял коллеге, почему «умный» не значит «полезный». Кажется, убедил только себя.',
    'Хороший инструмент — тот, который не требует объяснять, что ты с ним делаешь.',
  ],
  cinema: [
    'Есть кадры, которые держат весь фильм, и их обычно не выносят на постер.',
    'Пересмотрел без звука и понял, что половина смысла была в паузах.',
    'Лучшие титры — те, после которых не хочется сразу вставать.',
  ],
  city: [
    'Проверил: если идти без маршрута, город становится длиннее и честнее.',
    'В шесть утра здесь совсем другой звук, и он мне нравится больше.',
    'Есть места, куда не хочется приводить людей. Не из жадности, а из суеверия.',
  ],
  art: [
    'Свет в семь вечера делает с плёнкой то, чего не сделает никакой фильтр.',
    'Плёнка заканчивается в самый неподходящий момент. Это её главное свойство.',
    'Пустой угол в композиции — не ошибка, а место для дыхания.',
  ],
  literature: [
    'Есть книги, которые откладываешь не потому, что неинтересно, а потому, что рано.',
    'Сноски иногда важнее основного текста — там автор говорит честнее.',
    'На полях остались пометки трёхлетней давности. С некоторыми уже не согласен.',
  ],
  science: [
    'Люблю масштабы, в которых человек — погрешность. Помогает не нервничать.',
    'Читаю статьи до выводов, потом спорю с выводами. Обычно про себя.',
    'Самое интересное в науке — не ответ, а момент, когда вопрос ещё можно переформулировать.',
  ],
  games: [
    'Сохраняюсь редко, поэтому каждая тихая сцена становится событием.',
    'В старых играх было меньше подсказок и больше уважения к игроку.',
    'Лучший уровень — тот, где можно ничего не делать и не проиграть.',
  ],
  food: [
    'Готовлю по памяти и без весов. Гостям обычно нравится, мне — не всегда.',
    'Пережаренный лук — это не ошибка, это характер.',
    'Открыл вино в среду. Никакого повода, кроме хорошей среды.',
  ],
  sport: [
    'Бегаю рано, чтобы не встретить никого знакомого. Темп — единственная дисциплина.',
    'На подъёме главное — не считать шаги, иначе они начинают считаться сами.',
    'Тело понимает раньше головы. Голова потом придумывает объяснение.',
  ],
}

function rootOf(topics: string[]): string {
  const first = topics[0]
  if (!first) return 'default'
  const chain = topicAncestors(first)
  return chain[chain.length - 1] ?? 'default'
}

function detailFrom(post: LocalPost): string {
  const clean = post.title.replace(/[«»"“”]/g, '').trim()
  const words = clean.split(/\s+/).filter(Boolean)
  if (words.length <= 5) return clean
  return words.slice(0, 4).join(' ')
}

function affinityOf(persona: PersonaDraft, post: LocalPost): number {
  return Math.max(0, cosine(persona.interestVector, postVector(post.title, post.body, post.topics)))
}

export function localComment(
  persona: PersonaDraft,
  post: LocalPost,
  recent: string[] = [],
): string {
  const rng = mulberry32(hashSeed(`comment:${post.id}:${persona.handle}`))
  const detail = detailFrom(post)
  const openers = VOICE_OPENERS[persona.voiceTone] ?? VOICE_OPENERS['deadpan']!
  const tails = ROOT_TAILS[rootOf(post.topics)] ?? ROOT_TAILS['default']!
  const affinity = affinityOf(persona, post)

  for (let attempt = 0; attempt < 5; attempt += 1) {
    let text: string
    const critical = rng() < 0.08 + persona.argumentative * 0.16 + (affinity < 0.2 ? 0.1 : 0)
    if (critical) {
      text = pick(rng, CRITIQUES).replace('{detail}', detail)
    } else {
      const opener = pick(rng, openers).replace('{detail}', detail)
      const tail = pick(rng, tails)
      if (persona.commentLength === 'short') {
        text = opener
      } else if (persona.commentLength === 'medium') {
        text = `${opener} ${tail}`
      } else {
        const question = rng() > 0.45 ? ` ${pick(rng, QUESTIONS)}` : ''
        text = `${opener} ${tail}${question}`
      }
    }
    if (persona.emoji && rng() > 0.55) text = `${text} ${pick(rng, EMOJI)}`
    if (!recent.includes(text) && text.length < 420) return text
  }
  return `${pick(rng, openers).replace('{detail}', detail)} ${pick(rng, tails)}`.slice(0, 420)
}

export function localDecision(context: DecisionContext): LocalDecision {
  const { persona, feed, aggressiveness } = context
  if (!feed.length) {
    if (Math.random() < 0.35) {
      return { action: 'POST', content: '', reason: 'в ленте пусто, хочется что-то добавить' }
    }
    return { action: 'WAIT', content: '', reason: 'нечего смотреть' }
  }

  const candidate = weighted(
    Math.random,
    feed.slice(0, 7).map((post, index) => ({
      value: post,
      weight: 1 / (index + 1) + affinityOf(persona, post) * 0.8,
    })),
  )
  const affinity = affinityOf(persona, candidate)
  const authorId = candidate.authorId

  const eligibleFriend =
    !context.friends.has(authorId) &&
    !context.pending.has(authorId) &&
    (affinity > 0.75 ||
      (jaccard(persona.interests, context.authorInterests.get(authorId) ?? []) >= 0.34 &&
        (context.likeCounts.get(authorId) ?? 0) >= 2))

  const action = weighted<BotAction>(Math.random, [
    { value: 'WAIT', weight: 1.8 + (1 - affinity) * 1.4 + (1 - aggressiveness) * 0.8 },
    { value: 'LIKE', weight: 2.8 * (0.35 + affinity) },
    { value: 'COMMENT', weight: 3.2 * (0.3 + aggressiveness) * (0.4 + affinity) },
    { value: 'DISLIKE', weight: 0.8 * (1 - affinity) * (0.4 + persona.argumentative) },
    { value: 'WATCH_VIDEO', weight: candidate.kind === 'video' || candidate.kind === 'music' ? 2.1 : 0 },
    { value: 'FOLLOW', weight: context.following.has(authorId) ? 0 : 0.55 },
    { value: 'FRIEND_REQUEST', weight: eligibleFriend ? 1.1 : 0 },
    { value: 'JOIN_COLLAB', weight: context.hasCollabs && Math.random() > 0.6 ? 0.5 : 0 },
    { value: 'POST', weight: 0.9 + aggressiveness * 0.5 },
  ])

  if (action === 'WAIT') return { action, content: '', reason: 'пролистал и не зацепился' }

  if (action === 'POST') {
    return { action, content: '', reason: 'накопилось, хочется высказаться' }
  }

  if (action === 'COMMENT') {
    return {
      action,
      targetId: candidate.id,
      content: localComment(persona, candidate),
      reason: affinity > 0.4 ? 'совпало по теме' : 'зацепила деталь',
    }
  }

  if (action === 'WATCH_VIDEO') {
    const full = affinity > 0.45 || context.friends.has(authorId)
    const seconds = full
      ? Math.max(3, Math.round(candidate.durationSec * (0.82 + Math.random() * 0.2)))
      : 5 + Math.round(Math.random() * 5)
    return {
      action,
      targetId: candidate.id,
      content: '',
      watchTimeSeconds: seconds,
      reason: full ? 'досмотрел, потому что зашло' : 'хватило нескольких секунд',
    }
  }

  return { action, targetId: candidate.id, content: '', reason: 'среагировал по вкусу' }
}

export function localPost(persona: PersonaDraft): {
  kind: 'text' | 'video' | 'music'
  title: string
  body: string
  mediaUrl: string | null
  durationSec: number
  coverHue: number
  topics: string[]
} {
  const rng = mulberry32(hashSeed(`post:${persona.handle}`))
  const root = rootOf(persona.interests)
  const topics = persona.interests.slice(0, 2)
  const roll = rng()
  if (roll < 0.22) {
    const asset = videoAsset(Math.floor(rng() * 10))
    return {
      kind: 'video',
      title: asset.title,
      body: pick(rng, [
        'Снял на ходу, не стал ничего объяснять. Звук оставил как есть.',
        'Маленький этюд про свет, который длится минут пять в сутки.',
        'Без монтажа и без смысла, который можно пересказать.',
      ]),
      mediaUrl: asset.url,
      durationSec: asset.duration,
      coverHue: asset.hue,
      topics,
    }
  }
  if (roll < 0.45) {
    const track = trackAsset(Math.floor(rng() * 8))
    return {
      kind: 'music',
      title: track.title,
      body: pick(rng, [
        `Делюсь треком ${track.artist}. Слушать лучше целиком, без перемотки.`,
        `Вот это держит меня уже неделю. ${track.artist}, если не знаешь.`,
        `Нашёл вчера. ${track.artist} — и больше ничего не нужно.`,
      ]),
      mediaUrl: track.url,
      durationSec: track.duration,
      coverHue: track.hue,
      topics,
    }
  }
  const titles = POST_TITLES[root] ?? POST_TITLES['music']!
  const bodies = POST_BODIES[root] ?? POST_BODIES['music']!
  return {
    kind: 'text',
    title: pick(rng, titles),
    body: pick(rng, bodies),
    mediaUrl: null,
    durationSec: 0,
    coverHue: (persona.avatarHue + 24) % 360,
    topics,
  }
}

export function reflectionText(action: string, detail: string, persona: { emoji: boolean }): string {
  const map: Record<string, string> = {
    LIKE: `Лайкнул ${detail}. Совпало.`,
    DISLIKE: `Дизлайкнул ${detail}. Не моё.`,
    COMMENT: `Оставил комментарий под ${detail}.`,
    FOLLOW: `Подписался на ${detail}.`,
    FRIEND_REQUEST: `Отправил заявку ${detail}.`,
    WATCH_VIDEO: `Посмотрел ${detail}.`,
    POST: `Опубликовал ${detail}.`,
    JOIN_COLLAB: `Вошёл в коллаборацию ${detail}.`,
    WAIT: `Пролистал ленту, ничего не тронул.`,
  }
  const base = map[action] ?? map['WAIT']!
  return persona.emoji && Math.random() > 0.8 ? `${base} 🙂` : base
}
