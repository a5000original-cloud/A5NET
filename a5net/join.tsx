import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import JoinPage from './components/JoinPage.vue'
import { queryString, resolveMembership } from './server/page-helpers'

export const joinPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (membership) return ctx.resp.redirect('/')

  const code = queryString(ctx, 'code')

  return (
    <html lang="ru">
      <head>
        <title>Вход по приглашению — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <Styles />
      </head>
      <body class="bg-ink">
        <JoinPage ssr data={{ code, signedIn: ctx.user?.type === 'Real' }} />
      </body>
    </html>
  )
})
