import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import ControlPage from './components/ControlPage.vue'
import { getControlData } from './server/control-data'
import { resolveMembership } from './server/page-helpers'

export const controlPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')
  if (!ctx.user?.is('Owner')) return ctx.resp.redirect('/')

  const data = await getControlData(ctx)

  return (
    <html lang="ru">
      <head>
        <title>Пульт флота — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <ControlPage ssr data={data} />
      </body>
    </html>
  )
})
