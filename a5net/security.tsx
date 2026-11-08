import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import SecurityPage from './components/SecurityPage.vue'
import { getSecurityPageData, ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'
import { toAuthorCard } from './server/social'

export const securityPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership || !ctx.user?.is('Owner')) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate
  const data = { ...(await getSecurityPageData(ctx)), viewer: toAuthorCard(membership.profile) }

  return (
    <html lang="ru">
      <head>
        <title>Безопасность A5000 — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <Styles />
      </head>
      <body class="bg-ink">
        <SecurityPage ssr data={data} />
      </body>
    </html>
  )
})
