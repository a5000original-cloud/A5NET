import { LEAF_TOPICS, topicById } from '../taxonomy'
import { hashSeed, mulberry32, pick, pickMany } from '../rng'
import { embedTopics } from '../vec'

export type VoiceTone = 'sardonic' | 'enthusiastic' | 'analytical' | 'melancholic' | 'deadpan' | 'warm'
export type Chronotype = 'lark' | 'nightowl' | 'steady'

export interface PersonaDraft {
  handle: string
  name: string
  age: number
  city: string
  bio: string
  voiceTone: VoiceTone
  commentLength: 'short' | 'medium' | 'long'
  slang: boolean
  emoji: boolean
  argumentative: number
  gender: 'm' | 'f' | 'x'
  typoRate: number
  politicalLeaning: 'neutral' | 'progressive' | 'conservative'
  interests: string[]
  interestVector: number[]
  chronotype: Chronotype
  avatarHue: number
  avatarAccent: number
}

const NAMES: string[] = [
  'Марта Ковалёва', 'Тимур Асланов', 'Ника Ершова', 'Саша Гринберг', 'Лёва Крылов',
  'Аня Штерн', 'Гоша Мельник', 'Дина Ветрова', 'Кирилл Морев', 'Соня Лебедева',
  'Артём Гущин', 'Лиза Ткачук', 'Рома Дождь', 'Вера Соловьёва', 'Миша Кот',
  'Настя Полякова', 'Илья Руденко', 'Катя Ян', 'Феликс Орлов', 'Майя Суркова',
  'Дэн Слепой', 'Оля Ветрова', 'Костя Ланге', 'Женя Мир', 'Аля Черных',
  'Боря Ким', 'Надя Шульц', 'Гриша Полянский', 'Ким Астахов', 'Юля Мост',
  'Стас Кравцов', 'Милана Гоц', 'Егор Пименов', 'Тася Ворон', 'Ваня Дуб',
  'Соня Райх', 'Лёша Бирюк', 'Марина Ноль', 'Сева Гром', 'Арина Лунная',
  'Полина Вереск', 'Слава Кот', 'Гриша Тихонов', 'Майя Гром', 'Ефим Ларс',
  'Зоя Мель', 'Родион Бах', 'Ася Пламя', 'Лев Сомов', 'Нина Ветер',
  'Оскар Ли', 'Даша Рай', 'Тимур Волк', 'Ева Соль', 'Марк Ночь',
  'Вера Клён', 'Игнат Мор', 'Соня Пик', 'Адам Тень', 'Лида Свет',
]

const CITIES = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Калининград',
  'Нижний Новгород', 'Тбилиси', 'Ереван', 'Алматы', 'Берлин', 'Белград', 'Варшава', 'Вильнюс',
]

const BIOS: Record<string, string[]> = {
  music: [
    'Собираю пластинки, которые никто не хочет слушать целиком. Иногда пишу об этом.',
    'Играю на четырёх аккордах и одной педали. Этого, как правило, хватает.',
    'Хожу на концерты, где меньше ста человек, и потом месяц о них рассказываю.',
    'Записываю звуки города на телефон. Потом собираю из них что-то похожее на музыку.',
  ],
  tech: [
    'Днём собираю интерфейсы, ночью читаю про агентов. Считаю, что кнопка — это тоже текст.',
    'Пишу код, который никто не просил. Зато он работает и не задаёт вопросов.',
    'Слежу за тем, как машины учатся врать, и веду об этом отдельный блокнот.',
    'Верю в маленькие инструменты и большие паузы между релизами.',
  ],
  cinema: [
    'Смотрю по два фильма в неделю и ещё неделю думаю, зачем. Пишу коротко.',
    'Люблю титры больше самих фильмов. Спорю с этим утверждением при каждом удобном случае.',
    'Собираю кадры, в которых никто не говорит. Кажется, там всё и происходит.',
  ],
  literature: [
    'Читаю медленно, пишу ещё медленнее. Зато почти всегда дописываю.',
    'Держу дома слишком много книг и слишком мало полок. Это принципиально.',
    'Люблю сноски, маргиналии и людей, которые дочитывают до конца.',
  ],
  city: [
    'Хожу пешком без маршрута. Город считаю самым честным собеседником.',
    'Знаю, где в городе лучший свет в семь вечера. Иногда показываю.',
    'Езжу на велосипеде там, где нельзя, и потом извиняюсь. Мысленно.',
  ],
  art: [
    'Снимаю на плёнку, потому что не умею удалять. Печатаю редко, показываю ещё реже.',
    'Коллекционирую вывески и чужие ошибки в вёрстке. Это тоже искусство.',
    'Делаю объекты из найденного. Дома уже негде ходить.',
  ],
  science: [
    'Читаю статьи до раздела с выводами, потом спорю с выводами. Обычно про себя.',
    'Люблю масштабы, в которых человек — погрешность. Помогает не нервничать.',
    'Веду заметки о том, как мозг придумывает причинность. Ирония не ускользает.',
  ],
  games: [
    'Прохожу медленно, сохраняюсь редко. Уважаю игры, которые не боятся тишины.',
    'Собираю старые картриджи и новые впечатления. Иногда наоборот.',
  ],
  food: [
    'Готовлю по памяти и без весов. Гостям обычно нравится, мне — не всегда.',
    'Ищу вино, которое не стыдно открыть в среду. Пока безуспешно, но я стараюсь.',
  ],
  sport: [
    'Бегаю рано, чтобы не встретить никого знакомого. Темп — единственная дисциплина.',
    'Считаю, что лучший разговор — на склоне, когда оба уже устали.',
  ],
}

const VOICES: VoiceTone[] = ['sardonic', 'enthusiastic', 'analytical', 'melancholic', 'deadpan', 'warm']

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map(char => TRANSLIT[char] ?? (/[a-z0-9]/.test(char) ? char : ''))
    .join('')
}

function handleFor(name: string, index: number): string {
  const parts = name.split(' ')
  const first = transliterate(parts[0] ?? 'a5')
  const last = transliterate(parts[1] ?? '')
  const base = last ? `${first}.${last}` : first
  return index > 39 ? `${base}${index}` : base
}

export function generatePersona(index: number): PersonaDraft {
  const rng = mulberry32(hashSeed(`a5net-persona:${index}`))
  const name = NAMES[index % NAMES.length] as string
  const city = pick(rng, CITIES)
  const roots = ['music', 'tech', 'cinema', 'literature', 'city', 'art', 'science', 'games', 'food', 'sport']
  const primaryRoot = roots[index % roots.length] as string
  const primaryLeaves = LEAF_TOPICS.filter(topic => topic.parent === primaryRoot)
  const secondaryRoot = pick(rng, roots.filter(root => root !== primaryRoot))
  const secondaryLeaves = LEAF_TOPICS.filter(topic => topic.parent === secondaryRoot)

  const chosen: string[] = pickMany(rng, primaryLeaves, Math.min(2, primaryLeaves.length)).map(topic => topic.id)
  if (secondaryLeaves.length) chosen.push(pick(rng, secondaryLeaves).id)
  if (rng() > 0.35 && primaryLeaves.length > 2) {
    const extra = pickMany(rng, primaryLeaves, 1)[0]?.id
    if (extra && !chosen.includes(extra)) chosen.push(extra)
  }
  if (rng() > 0.72) {
    const thirdRoot = pick(rng, roots.filter(root => root !== primaryRoot && root !== secondaryRoot))
    const thirdLeaves = LEAF_TOPICS.filter(topic => topic.parent === thirdRoot)
    const third = thirdLeaves.length ? pick(rng, thirdLeaves) : null
    if (third && !chosen.includes(third.id)) chosen.push(third.id)
  }

  const voice = pick(rng, VOICES)
  const female = ['Марта','Ника','Аня','Дина','Соня','Лиза','Вера','Настя','Катя','Майя','Оля','Аля','Надя','Юля','Милана','Тася','Марина','Арина','Полина','Зоя','Ася','Нина','Даша','Ева','Лида']
  const male = ['Тимур','Лёва','Гоша','Кирилл','Артём','Рома','Миша','Илья','Феликс','Дэн','Костя','Боря','Гриша','Ким','Стас','Егор','Ваня','Лёша','Сева','Слава','Ефим','Родион','Лев','Оскар','Марк','Игнат','Адам']
  const firstName = name.split(' ')[0] ?? ''
  const gender: 'm' | 'f' | 'x' = female.includes(firstName) ? 'f' : male.includes(firstName) ? 'm' : (rng() > 0.5 ? 'f' : 'm')
  const bio = pick(rng, BIOS[primaryRoot] ?? BIOS['music']!)
  const age = 19 + Math.floor(rng() * 24)
  const chronoRoll = rng()
  const chronotype: Chronotype = chronoRoll < 0.28 ? 'lark' : chronoRoll < 0.62 ? 'nightowl' : 'steady'
  const hueBase = topicById(chosen[0] ?? 'music').hue

  return {
    handle: handleFor(name, index),
    name,
    age,
    city,
    bio,
    voiceTone: voice,
    commentLength: voice === 'analytical' || voice === 'melancholic'
      ? (rng() > 0.5 ? 'long' : 'medium')
      : voice === 'deadpan'
        ? 'short'
        : (rng() > 0.5 ? 'medium' : 'short'),
    slang: rng() > 0.45,
    emoji: rng() > 0.66,
    argumentative: Math.round(rng() * 100) / 100,
    gender,
    typoRate: Math.round((0.02 + rng() * 0.07) * 100) / 100,
    politicalLeaning: rng() < 0.55 ? 'neutral' : rng() < 0.5 ? 'progressive' : 'conservative',
    interests: chosen,
    interestVector: embedTopics(chosen),
    chronotype,
    avatarHue: (hueBase + Math.floor(rng() * 26) - 13 + 360) % 360,
    avatarAccent: (hueBase + 40 + Math.floor(rng() * 80)) % 360,
  }
}

export function botCount(): number {
  return NAMES.length
}
