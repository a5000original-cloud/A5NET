import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import CommunitiesPage from './components/CommunitiesPage.vue'
import { getCommunitiesData } from './server/communities'
import { ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'

export const communitiesPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate
  const data = await getCommunitiesData(ctx, membership.profile, membership.role)

  return (
    <html lang="ru">
      <head>
        <title>Сообщества — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <CommunitiesPage ssr data={data} />
      </body>
    </html>
  )
})
