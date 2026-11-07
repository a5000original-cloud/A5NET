import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import WatchPage from './components/WatchPage.vue'
import { getWatchData } from './server/video-data'
import { queryString, resolveMembership } from './server/page-helpers'
import { videoHubRoute } from './video'

export const watchPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')

  const id = queryString(ctx, 'id')
  const data = id ? await getWatchData(ctx, id, membership.profile, membership.role) : null
  if (!data) return ctx.resp.redirect(videoHubRoute.url())

  return (
    <html lang="ru">
      <head>
        <title>{data.post.title} — A5NET Видео</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <WatchPage ssr data={data} />
      </body>
    </html>
  )
})
