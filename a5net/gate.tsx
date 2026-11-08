import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import OwnerGatePage from './components/OwnerGatePage.vue'
import { getOwnerSecurity, getSecurityPageData, ownerDeviceTrusted } from './server/security'
import { queryString, resolveMembership } from './server/page-helpers'

function safeBack(value: string): string {
  return value.startsWith('/a5net/') ? value : '/a5net/feed'
}

export const ownerGateRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership || !ctx.user?.is('Owner')) return ctx.resp.redirect('/')

  const back = safeBack(queryString(ctx, 'back'))
  const security = await getOwnerSecurity(ctx)
  if (!security.enabled || await ownerDeviceTrusted(ctx)) return ctx.resp.redirect(back)
  const data = await getSecurityPageData(ctx)

  return (
    <html lang="ru">
      <head>
        <title>A5 Pass — вход владельца</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="noindex" />
        <Styles />
      </head>
      <body class="bg-ink">
        <OwnerGatePage ssr data={{ back, email: data.recoveryEmail, phone: data.recoveryPhone, recoveryLeft: data.recoveryLeft }} />
      </body>
    </html>
  )
})
