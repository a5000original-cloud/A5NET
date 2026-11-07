import { jsx } from '@app/html-jsx'
import { Styles } from './styles'
import PostPage from './components/PostPage.vue'
import { loadPostPage } from './server/post-page'
import { queryString, resolveMembership } from './server/page-helpers'

export const postPageRoute = app.get('/post', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')

  const id = queryString(ctx, 'id')
  const data = id ? await loadPostPage(ctx, id, membership.profile, membership.role) : null
  if (!data) return ctx.resp.redirect('/')

  return (
    <html lang="ru">
      <head>
        <title>{data.post.title} — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <PostPage ssr data={data} />
      </body>
    </html>
  )
})
