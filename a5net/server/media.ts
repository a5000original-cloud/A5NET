export interface VideoAsset {
  title: string
  url: string
  duration: number
  hue: number
}

export interface TrackAsset {
  title: string
  artist: string
  url: string
  duration: number
  hue: number
}

export const VIDEOS: VideoAsset[] = [
  { title: 'Плёнка закончилась в Калининграде', url: 'https://fs.chatium.ru/get/video_msk_POYuWmEl9s.d15.960x540.mp4', duration: 15, hue: 168 },
  { title: 'Медленный свет', url: 'https://fs.chatium.ru/get/video_msk_cwNK7oxBwJ.d14.960x540.mp4', duration: 14, hue: 32 },
  { title: 'Как звучит пустой бассейн', url: 'https://fs.chatium.ru/get/video_msk_WCnYmoOLBg.d16.960x540.mp4', duration: 16, hue: 192 },
  { title: 'Шум трамвайных рельсов', url: 'https://fs.chatium.ru/get/video_msk_YbnrZXTTo3.d13.960x540.mp4', duration: 13, hue: 204 },
  { title: 'Аналоговый закат', url: 'https://fs.chatium.ru/get/video_msk_WwTbLxqpHF.d15.960x540.mp4', duration: 15, hue: 12 },
  { title: 'Комната, в которой не выключили лампу', url: 'https://fs.chatium.ru/get/video_msk_AC23dOSOoq.d12.960x540.mp4', duration: 12, hue: 48 },
  { title: 'Зима без снега', url: 'https://fs.chatium.ru/get/video_msk_NNudAfp9aF.d14.960x540.mp4', duration: 14, hue: 210 },
  { title: 'Тишина после вечеринки', url: 'https://fs.chatium.ru/get/video_msk_BI14aZT9ae.d15.960x540.mp4', duration: 15, hue: 96 },
  { title: 'Черновик на 4 утра', url: 'https://fs.chatium.ru/get/video_msk_Pybit5Fj0N.d16.960x540.mp4', duration: 16, hue: 140 },
  { title: 'Стеклянный двор', url: 'https://fs.chatium.ru/get/video_msk_n3qiAL6u74.d13.960x540.mp4', duration: 13, hue: 184 },
]

export const TRACKS: TrackAsset[] = [
  { title: 'Пыль на виниле', artist: 'Костя Ланге', url: 'https://fs.chatium.ru/get/audio_msk_Y9LFrTYS3P.d45.mpga', duration: 45, hue: 268 },
  { title: 'Северный широтный', artist: 'Оля Ветрова', url: 'https://fs.chatium.ru/get/audio_msk_LY3tOwmTm1.d45.mpga', duration: 45, hue: 208 },
  { title: 'Полутон', artist: 'Monooka', url: 'https://fs.chatium.ru/get/audio_msk_ImzQ00stsf.d45.mpga', duration: 45, hue: 288 },
  { title: 'Второй трамвай', artist: 'Гриша Дождь', url: 'https://fs.chatium.ru/get/audio_msk_BbJwIBMKDI.d45.mpga', duration: 45, hue: 196 },
  { title: 'Стекло', artist: 'Аврора', url: 'https://fs.chatium.ru/get/audio_msk_xhDsy2ndr0.d45.mpga', duration: 45, hue: 184 },
  { title: 'Суббота в подвале', artist: 'Дэн Слепой', url: 'https://fs.chatium.ru/get/audio_msk_4LFKpQHm5B.d45.mpga', duration: 45, hue: 24 },
  { title: 'Тихий час', artist: 'Марина Ноль', url: 'https://fs.chatium.ru/get/audio_msk_s4NHda8x35.d45.mpga', duration: 45, hue: 320 },
  { title: 'После дождя', artist: 'Ким и Оркестр', url: 'https://fs.chatium.ru/get/audio_msk_weVjOhYHPd.d45.mpga', duration: 45, hue: 140 },
]

export function videoAsset(index: number): VideoAsset {
  return VIDEOS[index % VIDEOS.length] as VideoAsset
}

export function trackAsset(index: number): TrackAsset {
  return TRACKS[index % TRACKS.length] as TrackAsset
}

export const HERO_VIDEO = VIDEOS[7] as VideoAsset
