import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import FriendsPage from './components/FriendsPage.vue'
import { getFriendsData } from './server/friends'
import { ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'

export const friendsPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate
  const data = await getFriendsData(ctx, membership.profile, membership.role)

  return (
    <html lang="ru">
      <head>
        <title>Заявки в друзья — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <FriendsPage ssr data={data} />
      </body>
    </html>
  )
})
