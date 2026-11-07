import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import ProfileSettingsPage from './components/ProfileSettingsPage.vue'
import { getProfileSettingsData } from './server/profile-settings'
import { resolveMembership } from './server/page-helpers'

export const profileSettingsRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')

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
