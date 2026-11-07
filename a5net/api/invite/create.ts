import Invites from '../../tables/invites.table'
import { memberErrorCode, requireMember } from '../../server/access'

function makeCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `A5-${code}`
}

export const inviteCreateRoute = app.post('/')
  .body(s => ({
    note: s.string().max(120).optional(),
    maxUses: s.number().int().min(1).max(25).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx)
      const canCreate = membership.role === 'owner' || membership.role === 'admin' || Boolean(ctx.user?.is('Staff'))
      if (!canCreate) return { ok: false as const, error: 'Инвайты создают только администраторы.' }

      let code = makeCode()
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const existing = await Invites.findOneBy(ctx, { code })
        if (!existing) break
        code = makeCode()
      }

      const invite = await Invites.create(ctx, {
        code,
        note: req.body.note?.trim() || 'Без комментария',
        maxUses: req.body.maxUses ?? 3,
        uses: 0,
        active: true,
        createdByProfileId: membership.profile.id,
      })
      return { ok: true as const, code: invite.code, id: invite.id }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
