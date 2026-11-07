import { jsx } from '@app/html-jsx'
import { findCurrentWorkspaceAgents } from '@ai-agents/sdk/process'
import { generateChatClientAgentToken } from '@start/sdk'
import { Styles } from './styles'
import AssistantPage from './components/AssistantPage.vue'
import { toAuthorCard } from './server/social'
import { resolveMembership } from './server/page-helpers'

const TRANSPORT_KEY = 'a5net-manager'

export const assistantPageRoute = app.get('/', async ctx => {
  const membership = await resolveMembership(ctx)
  if (!membership) return ctx.resp.redirect('/')

  let agentId = ''
  let agentToken = ''

  try {
    const agents = await findCurrentWorkspaceAgents(ctx)
    const agent = agents.find(item => item.workspaceAgentKey === 'a5000-manager')
    if (agent) {
      agentId = agent.id
      agentToken = await generateChatClientAgentToken(ctx, {
        agentId,
        transportKey: TRANSPORT_KEY,
      })
    }
  } catch {
    // Агент ещё не опубликован — страница покажет спокойную заглушку.
  }

  return (
    <html lang="ru">
      <head>
        <title>A5000_Менеджер — помощник A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Цифровой менеджер-помощник A5NET: аккаунт, инвайты, публикации, баги и вопросы по платформе."
        />
        <Styles />
      </head>
      <body class="bg-ink">
        <AssistantPage
          agentId={agentId}
          agentToken={agentToken}
          transportKey={TRANSPORT_KEY}
          viewer={toAuthorCard(membership.profile)}
          role={membership.role}
        />
      </body>
    </html>
  )
})
