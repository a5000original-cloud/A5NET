import { TRACKS, VIDEOS } from './media'

export interface SeedText {
  title: string
  body: string
  topics: string[]
  ageHours: number
}

export interface SeedCollab {
  title: string
  brief: string
  topics: string[]
  ageHours: number
}

export const SEED_TEXTS: SeedText[] = [
  {
    title: 'Почему я перестал слушать альбомы по порядку',
    body: 'Раньше думал, что порядок треков — это заявление. Теперь ставлю на шаффл и не чувствую потери. Возможно, дело во мне.',
    topics: ['music', 'indie'],
    ageHours: 6,
  },
  {
    title: 'Кнопка, которая делает слишком много',
    body: 'Вчера полчаса искал, как отключить одну функцию. В итоге выключил приложение. Хороший интерфейс не должен требовать квеста.',
    topics: ['interfaces', 'tech'],
    ageHours: 9,
  },
  {
    title: 'Город в шесть утра принадлежит курьерам и дворникам',
    body: 'Проехал на велосипеде через центр. Никого, кроме людей, которые делают город пригодным для жизни. Снял пару кадров.',
    topics: ['city', 'bikes'],
    ageHours: 14,
  },
  {
    title: 'Кадр, в котором ничего не происходит',
    body: 'Пересматриваю фильм ради сцены, где герой просто сидит у окна. Всё остальное можно было не снимать.',
    topics: ['arthouse', 'cinema'],
    ageHours: 20,
  },
  {
    title: 'Сноски важнее текста',
    body: 'Дочитал книгу и понял, что самое честное было внизу страницы, мелким шрифтом. Автор там не притворялся.',
    topics: ['nonfiction', 'literature'],
    ageHours: 26,
  },
  {
    title: 'Агент, который не спешит',
    body: 'Собрал себе помощника, который сначала задаёт вопрос, а потом делает. Пока он медленнее меня, но ошибается реже.',
    topics: ['ai-agents', 'tech'],
    ageHours: 33,
  },
  {
    title: 'Про пустой угол в композиции',
    body: 'Хороший кадр — это не то, что попало в объектив, а то, что осталось за краем. Учусь не заполнять пустоту.',
    topics: ['photography', 'art'],
    ageHours: 39,
  },
  {
    title: 'Вино, которое не стыдно открыть в среду',
    body: 'Никакого повода. Просто среда оказалась достаточно длинной.',
    topics: ['wine', 'food'],
    ageHours: 44,
  },
  {
    title: 'Уровень без врагов',
    body: 'В этой игре можно час ходить по лесу и ничего не делать. Это лучшие полчаса за неделю.',
    topics: ['indie-games', 'games'],
    ageHours: 51,
  },
  {
    title: 'Масштаб, который не помещается в голову',
    body: 'Прочитал про расстояние до ближайшей экзопланеты. Помогает не переживать из-за дедлайна.',
    topics: ['space', 'science'],
    ageHours: 58,
  },
  {
    title: 'Свет в семь вечера',
    body: 'Если встать в правильном месте набережной, город на пятнадцать минут становится открыткой. Потом всё портит ветер.',
    topics: ['photography', 'city'],
    ageHours: 63,
  },
  {
    title: 'Почему мне нравится шугейз',
    body: 'Потому что там можно не разбирать слова и всё равно всё понимать.',
    topics: ['shoegaze', 'indie'],
    ageHours: 70,
  },
  {
    title: 'Про дыхание на подъёме',
    body: 'Сегодня впервые за месяц не сбился. Кажется, дело не в форме, а в том, что перестал считать шаги.',
    topics: ['running', 'sport'],
    ageHours: 76,
  },
  {
    title: 'Типографика в вывесках умирает',
    body: 'Сфотографировал двадцать старых вывесок, пока их не заменили на одинаковые. Одна была с ошибкой, и я её люблю больше всех.',
    topics: ['typography', 'art'],
    ageHours: 82,
  },
  {
    title: 'Ночная смена',
    body: 'Работал до трёх, вышел на улицу — и город был мой. Такое чувство не купишь за деньги, но за него платишь сном.',
    topics: ['nightlife', 'city'],
    ageHours: 88,
  },
  {
    title: 'Плёнка заканчивается в самый неподходящий момент',
    body: 'Осталось два кадра, и я потратил их на что-то совершенно неважное. Через месяц оказалось, что важное.',
    topics: ['photography', 'art'],
    ageHours: 94,
  },
  {
    title: 'Разговор о климате без истерики',
    body: 'Прочитал отчёт целиком. Самое страшное там — не цифры, а сноска про то, что мы уже не можем отменить.',
    topics: ['climate', 'science'],
    ageHours: 100,
  },
  {
    title: 'Плейлист для поезда',
    body: 'Собрал на 40 минут: без резких переходов, без любимых песен. Чтобы дорога не запомнилась.',
    topics: ['music', 'ambient'],
    ageHours: 106,
  },
  {
    title: 'Двор, куда не хочется приводить людей',
    body: 'Есть места, которые держатся на суеверии. Я туда хожу один и никому не рассказываю. Кроме вас.',
    topics: ['city', 'architecture'],
    ageHours: 112,
  },
  {
    title: 'Современное искусство и его защитники',
    body: 'Половина спора — про то, кто громче объяснит. Вторая половина — про то, кто первый устанет.',
    topics: ['contemporary', 'art'],
    ageHours: 118,
  },
  {
    title: 'Кофе в гараже лучше кофе в центре',
    body: 'Потому что там не нужно делать вид, что тебе важно происхождение зерна.',
    topics: ['coffee', 'city'],
    ageHours: 124,
  },
  {
    title: 'Почему я удалил соцсети (и вернулся)',
    body: 'Две недели было тихо. Потом понял, что скучаю не по ленте, а по людям, которых там встречал.',
    topics: ['interfaces', 'tech'],
    ageHours: 130,
  },
  {
    title: 'Скалолазание учит не думать о вершине',
    body: 'На стене всё равно, какой у тебя план. Важен следующий зацеп.',
    topics: ['climbing', 'sport'],
    ageHours: 136,
  },
  {
    title: 'Фантастика, которую я перечитываю',
    body: 'Там нет пророчеств, зато есть люди, которые делают неправильный выбор по правильным причинам.',
    topics: ['fiction', 'literature'],
    ageHours: 142,
  },
]

export const SEED_VIDEOS: Array<{ index: number; body: string; topics: string[]; ageHours: number }> = [
  { index: 0, body: 'Снимал на плёнку в апреле. Половина кадров не получилась, но эти остались.', topics: ['photography', 'city', 'ambient'], ageHours: 4 },
  { index: 1, body: 'Про свет, который живёт минут двадцать. Дальше становится слишком обычным.', topics: ['photography', 'art', 'ambient'], ageHours: 11 },
  { index: 2, body: 'Записал звук пустого бассейна. Видео — просто чтобы был повод слушать.', topics: ['ambient', 'architecture', 'city'], ageHours: 17 },
  { index: 3, body: 'Ночная смена, последний трамвай. Снял на телефон, не стал чистить.', topics: ['city', 'ambient', 'nightlife'], ageHours: 23 },
  { index: 4, body: 'Плёнка кончилась на самом интересном. Публикую то, что успел.', topics: ['photography', 'art', 'indie'], ageHours: 30 },
  { index: 5, body: 'Снял комнату после вечеринки, пока никто не вернулся.', topics: ['arthouse', 'photography', 'nightlife'], ageHours: 37 },
  { index: 6, body: 'Декабрь, а снега нет. Снял то, что осталось вместо зимы.', topics: ['photography', 'climate', 'city'], ageHours: 45 },
  { index: 7, body: 'Звук после того, как все ушли. Свет я оставил специально.', topics: ['nightlife', 'ambient', 'arthouse'], ageHours: 55 },
  { index: 8, body: 'Черновик, который я не стану дописывать. Пусть останется так.', topics: ['poetry', 'art', 'indie'], ageHours: 66 },
  { index: 9, body: 'Двор, в котором всё отражается и ничего не происходит.', topics: ['architecture', 'city', 'photography'], ageHours: 79 },
]

export const SEED_TRACKS: Array<{ index: number; body: string; topics: string[]; ageHours: number }> = [
  { index: 0, body: 'Записал дома на четырёхдорожечный. Шум оставил, он тут главный.', topics: ['indie', 'lofi'], ageHours: 7 },
  { index: 1, body: 'Про север, где темно и от этого спокойно. Слушать в наушниках.', topics: ['ambient', 'indie'], ageHours: 19 },
  { index: 2, body: 'Полутон, который никак не хотел становиться припевом. В итоге стал.', topics: ['indie', 'shoegaze'], ageHours: 28 },
  { index: 3, body: 'Второй трамвай — это про возвращение домой в четыре утра.', topics: ['ambient', 'city'], ageHours: 41 },
  { index: 4, body: 'Стекло, записанное через контактный микрофон. Дальше добавил только тишину.', topics: ['ambient', 'art'], ageHours: 52 },
  { index: 5, body: 'Суббота в подвале. Бас писал на телефон, поэтому он такой грязный.', topics: ['techno', 'nightlife'], ageHours: 68 },
  { index: 6, body: 'Тихий час. Ничего не происходит, и это лучшее, что случилось за день.', topics: ['ambient', 'lofi'], ageHours: 84 },
  { index: 7, body: 'После дождя. Собрал из полевых записей и одной гитары.', topics: ['ambient', 'indie'], ageHours: 98 },
]

export const SEED_COLLABS: SeedCollab[] = [
  { title: 'Сборник про ночной город', brief: 'Ищу 4–6 фотографов и одного человека со звуком. Снимем Калининград от заката до первого трамвая. Нужны кадры, а не открытки.', topics: ['photography', 'city', 'nightlife'], ageHours: 12 },
  { title: 'Эмбиент-компиляция для сна', brief: '8 треков по 6 минут. Без бита, без резких переходов. Присылайте черновики, соберём на плёнку.', topics: ['ambient', 'music'], ageHours: 25 },
  { title: 'Зин про советские вывески', brief: 'Собираю 30 фотографий и 3 текста. Вёрстка уже есть, не хватает материала и корректора.', topics: ['typography', 'art', 'city'], ageHours: 34 },
  { title: 'Короткий метр про пустой бассейн', brief: 'Нужен человек, который умеет писать звук под водой, и актёр без реплик. Съёмки в конце месяца.', topics: ['cinema', 'arthouse'], ageHours: 48 },
  { title: 'Плейлист для коллаборации', brief: 'Собираем 12 треков от участников A5NET. По одному от человека, никаких ремиксов.', topics: ['music', 'indie'], ageHours: 61 },
  { title: 'Текстовая коллаборация: 4 утра', brief: 'Пишем по одному абзацу с 4 до 6 утра. Потом собираем в один текст. Без имён.', topics: ['poetry', 'literature'], ageHours: 74 },
  { title: 'Клип на трек «Стекло»', brief: 'Нужен режиссёр и человек с плёночной камерой. Бюджета нет, есть полная свобода.', topics: ['cinema', 'music', 'art'], ageHours: 90 },
  { title: 'Исследование: как вы читаете ленту', brief: 'Нужны 10 человек на короткое интервью. Про привычки, а не про интерфейс.', topics: ['interfaces', 'science'], ageHours: 108 },
]

export const SEED_INVITES: Array<{ code: string; note: string; maxUses: number }> = [
  { code: 'A5-ORIGIN', note: 'Первая волна: друзья A5000', maxUses: 12 },
  { code: 'A5-NIGHT', note: 'Ночная смена', maxUses: 6 },
  { code: 'A5-STUDIO', note: 'Для коллабораций и студий', maxUses: 4 },
]

export function totalSeedPosts(): number {
  return SEED_TEXTS.length + SEED_VIDEOS.length + SEED_TRACKS.length + SEED_COLLABS.length
}

export const SEED_TOTAL_MEDIA = VIDEOS.length + TRACKS.length
