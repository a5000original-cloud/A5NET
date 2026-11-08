import { ownerGateRedirect } from './server/security'
import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import ProfilePage from './components/ProfilePage.vue'
import { getProfilePageData } from './server/feed'
import { toAuthorCard } from './server/social'
import { queryString, resolveMembership } from './server/page-helpers'

export const profilePageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  const gate = await ownerGateRedirect(ctx)
  if (gate) return gate

  const id = queryString(ctx, 'id') || membership.profile.id
  const page = await getProfilePageData(ctx, id, membership.profile)
  if (!page) return ctx.resp.redirect('/')

  const data = {
    ...page,
    viewer: toAuthorCard(membership.profile),
    viewerRole: membership.role,
  }

  return (
    <html lang="ru">
      <head>
        <title>{page.profile.name} — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <ProfilePage ssr data={data} />
      </body>
    </html>
  )
})
