import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import InvitesPage from './components/InvitesPage.vue'
import { getInvitesData } from './server/invite-data'
import { ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'

export const invitesPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate
  const canOpen = membership.role === 'owner' || membership.role === 'admin' || Boolean(ctx.user?.is('Staff'))
  if (!canOpen) return ctx.resp.redirect('/')

  const data = await getInvitesData(ctx, membership.profile, membership.role)

  return (
    <html lang="ru">
      <head>
        <title>Приглашения — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <InvitesPage ssr data={data} />
      </body>
    </html>
  )
})
