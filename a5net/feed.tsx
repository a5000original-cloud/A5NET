import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import FeedPage from './components/FeedPage.vue'
import { getFeedData } from './server/feed'
import { ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'

export const feedPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate

  const data = await getFeedData(ctx, membership.profile, membership.role)

  return (
    <html lang="ru">
      <head>
        <title>A5NET — лента</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <FeedPage ssr data={data} />
      </body>
    </html>
  )
})
