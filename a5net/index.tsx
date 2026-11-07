import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import LandingPage from './components/LandingPage.vue'
import { feedPageRoute } from './feed'
import { getStats } from './server/feed'
import { HERO_VIDEO } from './server/media'
import { LEAF_TOPICS } from './server/taxonomy'
import { queryString, resolveMembership } from './server/page-helpers'

export const indexPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (membership) return ctx.resp.redirect(feedPageRoute.url())

  const stats = await getStats(ctx)
  const code = queryString(ctx, 'code')

  return (
    <html lang="ru">
      <head>
        <title>A5NET — закрытая сеть по приглашениям</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A5NET — закрытая сеть с видео, музыкой, текстами и коллаборациями. Доступ только по приглашениям." />
        <Styles />
      </head>
      <body class="bg-ink">
        <LandingPage
          ssr
          data={{
            stats,
            topics: LEAF_TOPICS.slice(0, 18).map(topic => topic.label),
            signedIn: ctx.user?.type === 'Real',
            isMember: false,
            displayName: ctx.user?.displayName ?? '',
            heroUrl: HERO_VIDEO.url,
            hasInviteParam: Boolean(code),
            codeParam: code,
          }}
        />
      </body>
    </html>
  )
})
