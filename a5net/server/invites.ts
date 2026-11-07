import Invites from '../tables/invites.table'
import { getSetting, setSetting } from './settings'
import { randomToken, sha256Hex } from './crypto'

const PEPPER_KEY = 'invitePepper'

export async function getInvitePepper(ctx: app.Ctx): Promise<string> {
  const stored = await getSetting<string>(ctx, PEPPER_KEY, '')
  if (stored) return stored
  const pepper = randomToken(40)
  await setSetting(ctx, PEPPER_KEY, pepper, true)
  return pepper
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}

export async function hashInviteCode(ctx: app.Ctx, code: string): Promise<string> {
  const pepper = await getInvitePepper(ctx)
  return sha256Hex(`${pepper}:${normalizeInviteCode(code)}`)
}

export function generateInviteCode(): string {
  return `A5-${randomToken(8)}`
}

export async function createInviteRecord(
  ctx: app.Ctx,
  params: {
    code?: string
    note: string
    maxUses: number
    createdByProfileId: string
  },
): Promise<{ code: string; invite: typeof Invites.T }> {
  const code = normalizeInviteCode(params.code ?? generateInviteCode())
  const codeHash = await hashInviteCode(ctx, code)
  const invite = await Invites.create(ctx, {
    code: '',
    codeHash,
    note: params.note,
    maxUses: Math.max(1, Math.min(50, Math.round(params.maxUses))),
    uses: 0,
    active: true,
    createdByProfileId: params.createdByProfileId,
  })
  return { code, invite }
}

export async function findInviteByCode(ctx: app.Ctx, rawCode: string): Promise<typeof Invites.T | null> {
  const code = normalizeInviteCode(rawCode)
  if (!code) return null
  const codeHash = await hashInviteCode(ctx, code)
  const hashed = await Invites.findOneBy(ctx, { codeHash })
  if (hashed) return hashed

  // Legacy rows created before hashing: migrate on first successful lookup.
  const legacy = await Invites.findOneBy(ctx, { code })
  if (!legacy) return null
  await Invites.update(ctx, { id: legacy.id, code: '', codeHash })
  return { ...legacy, code: '', codeHash }
}

export async function consumeInviteUse(ctx: app.Ctx, invite: typeof Invites.T): Promise<number> {
  const uses = invite.uses + 1
  await Invites.update(ctx, {
    id: invite.id,
    uses,
    active: uses < invite.maxUses,
  })
  return uses
}

export function maskInviteCode(invite: typeof Invites.T): string {
  if (invite.code) return invite.code
  return 'A5-••••••'
}
