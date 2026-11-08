import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import VideoHubPage from './components/VideoHubPage.vue'
import { getVideoHubData } from './server/video-data'
import { ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'

export const videoHubRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate

  const data = await getVideoHubData(ctx, membership.profile, membership.role)

  return (
    <html lang="ru">
      <head>
        <title>Видео — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Видео A5NET: ролики любой длины, обложки, каналы и просмотр без алгоритмической витрины." />
        <Styles />
      </head>
      <body class="bg-ink">
        <VideoHubPage ssr data={data} />
      </body>
    </html>
  )
})
