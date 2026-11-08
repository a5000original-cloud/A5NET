import { ownerGateRedirect } from './server/security'
import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import InboxPage from './components/InboxPage.vue'
import { getInboxData } from './server/messages'
import { queryString, resolveMembership } from './server/page-helpers'

export const inboxPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate

  const data = await getInboxData(ctx, membership.profile, membership.role, queryString(ctx, 'peer') || undefined)

  return (
    <html lang="ru">
      <head>
        <title>Сообщения — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <InboxPage ssr data={data} />
      </body>
    </html>
  )
})
