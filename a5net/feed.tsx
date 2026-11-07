import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import FeedPage from './components/FeedPage.vue'
import { getFeedData } from './server/feed'
import { resolveMembership } from './server/page-helpers'

export const feedPageRoute = app.get('/feed', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')

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
