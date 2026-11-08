import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import MusicHubPage from './components/MusicHubPage.vue'
import { getMusicHubData } from './server/music-data'
import { ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'

export const musicHubRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate

  const data = await getMusicHubData(ctx, membership.profile, membership.role)

  return (
    <html lang="ru">
      <head>
        <title>Музыка — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A5 AUDIO: треки участников, полевые записи, полки и непрерывный плеер." />
        <Styles />
      </head>
      <body class="bg-ink">
        <MusicHubPage ssr data={data} />
      </body>
    </html>
  )
})
