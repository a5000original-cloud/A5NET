import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import AssistantPage from './components/AssistantPage.vue'
import { loadManagerHistory } from './server/manager-data'
import { suggestionsForIntent } from './server/manager-bot'
import { resolveMembership } from './server/page-helpers'
import { toAuthorCard } from './server/social'

export const assistantPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership || !ctx.user) return ctx.resp.redirect('/')

  const history = await loadManagerHistory(ctx, ctx.user.id, 40)
  const lastBot = [...history].reverse().find(message => message.role === 'bot')

  return (
    <html lang="ru">
      <head>
        <title>A5000_Менеджер — бот-помощник A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Бот-помощник A5NET: вход, инвайты, профиль, публикации, жалобы и ошибки. Отвечает по правилам площадки."
        />
        <Styles />
      </head>
      <body class="bg-ink">
        <AssistantPage
          ssr
          initialMessages={history}
          initialSuggestions={suggestionsForIntent(lastBot?.intent ?? null)}
          viewer={toAuthorCard(membership.profile)}
          role={membership.role}
        />
      </body>
    </html>
  )
})
