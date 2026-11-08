import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import ProfileSettingsPage from './components/ProfileSettingsPage.vue'
import { getProfileSettingsData } from './server/profile-settings'
import { ownerGateRedirect } from './server/security'
import { resolveMembership } from './server/page-helpers'

export const profileSettingsRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate

  const data = await getProfileSettingsData(ctx, membership.profile)

  return (
    <html lang="ru">
      <head>
        <title>Настройки профиля — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <ProfileSettingsPage ssr data={data} />
      </body>
    </html>
  )
})
