
export const manifestRoute = app.get('/', async ctx => {
  const manifest = {
    id: '/a5net/',
    name: 'A5NET — закрытая сеть',
    short_name: 'A5NET',
    description: 'Поток, видео, музыка и коллаборации. Только по приглашениям.',
    start_url: '/a5net/feed',
    scope: '/a5net/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#070806',
    theme_color: '#070806',
    lang: 'ru',
    categories: ['social', 'music', 'video'],
    icons: [
      { src: 'https://fs.chatium.ru/get/image_msk_abI7qVATB7.192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'https://fs.chatium.ru/get/image_msk_ZlvB2xkIpw.512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'https://fs.chatium.ru/get/image_msk_ZlvB2xkIpw.512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Поток', url: '/a5net/feed', icons: [{ src: 'https://fs.chatium.ru/get/image_msk_abI7qVATB7.192x192.png', sizes: '192x192' }] },
      { name: 'Видео', url: '/a5net/video', icons: [{ src: 'https://fs.chatium.ru/get/image_msk_abI7qVATB7.192x192.png', sizes: '192x192' }] },
      { name: 'Музыка', url: '/a5net/music', icons: [{ src: 'https://fs.chatium.ru/get/image_msk_abI7qVATB7.192x192.png', sizes: '192x192' }] },
    ],
  }
  return ctx.resp
    .setHeader('Content-Type', 'application/manifest+json')
    .setHeader('Cache-Control', 'public, max-age=3600')
    .plain(JSON.stringify(manifest))
})
