import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import AnalyticsPage from './components/AnalyticsPage.vue'
import { getProfileAnalytics } from './server/analytics-data'
import { queryString, resolveMembership } from './server/page-helpers'

export const analyticsPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')

  const id = queryString(ctx, 'id') || membership.profile.id
  if (id !== membership.profile.id && !ctx.user?.is('Owner')) return ctx.resp.redirect('/')
  const data = await getProfileAnalytics(ctx, id)
  if (!data) return ctx.resp.redirect('/')

  return (
    <html lang="ru">
      <head>
        <title>Статистика — {data.profile.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <AnalyticsPage ssr data={data} />
      </body>
    </html>
  )
})
