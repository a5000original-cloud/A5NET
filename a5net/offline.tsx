import { jsx } from '@app/html-jsx'
import { Styles } from './styles'

export const offlinePageRoute = app.get('/', async ctx => {
  return (
    <html lang="ru">
      <head>
        <title>A5NET — офлайн</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <main class="flex min-h-screen items-center justify-center p-6">
          <div class="max-w-md text-center">
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lime text-lg font-bold text-ink">A5</span>
            <h1 class="a5-display mt-6 text-3xl">Связь пропала.</h1>
            <p class="mt-3 text-sm leading-relaxed text-moss">A5NET останется здесь. Вернись, когда появится сеть — лента, музыка и сообщения никуда не денутся.</p>
            <a href="/a5net/feed" class="a5-btn-primary mt-6 inline-flex">Попробовать снова</a>
          </div>
        </main>
      </body>
    </html>
  )
})
