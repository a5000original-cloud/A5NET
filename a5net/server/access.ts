import { requireRealUser } from '@app/auth'
import Profiles from '../tables/profiles.table'
import Members from '../tables/members.table'
import { embedTopics } from './vec'

export type MemberRole = 'owner' | 'admin' | 'member'

export interface Membership {
  memberId: string
  role: MemberRole
  profile: typeof Profiles.T
}

export function isRealUser(ctx: app.Ctx): boolean {
  return ctx.user?.type === 'Real'
}

export function isOwner(ctx: app.Ctx): boolean {
  return Boolean(ctx.user?.is('Owner'))
}

export async function findMembership(ctx: app.Ctx): Promise<Membership | null> {
  if (!ctx.user || ctx.user.type !== 'Real') return null
  const members = await Members.findAll(ctx, { where: { platformUserId: ctx.user.id }, limit: 1 })
  const member = members[0]
  if (!member) return null
  const profile = await Profiles.findById(ctx, member.profileId)
  if (!profile) return null
  return { memberId: member.id, role: member.role, profile }
}

export async function ensureOwnerProfile(ctx: app.Ctx): Promise<Membership | null> {
  if (!ctx.user || ctx.user.type !== 'Real') return null
  const existing = await findMembership(ctx)
  if (existing) return existing
  if (!ctx.user.is('Owner')) return null

  const profile = await Profiles.create(ctx, {
    handle: 'a5000',
    name: 'A5000',
    age: 34,
    city: 'Москва',
    bio: 'Владелец A5NET. Собирает людей и странные идеи. Иногда молчит.',
    kind: 'human',
    voiceTone: 'deadpan',
    commentLength: 'short',
    slang: false,
    emoji: false,
    argumentative: 0.3,
    politicalLeaning: 'neutral',
    interests: ['tech', 'ai-agents', 'interfaces', 'cinema', 'city'],
    interestVector: embedTopics(['tech', 'ai-agents', 'interfaces', 'cinema', 'city']),
    chronotype: 'nightowl',
    avatarHue: 82,
    avatarAccent: 148,
    enabled: true,
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
    postsCount: 0,
    platformUserId: ctx.user.id,
  })

  const member = await Members.create(ctx, {
    platformUserId: ctx.user.id,
    profileId: profile.id,
    role: 'owner',
    inviteCode: 'owner',
  })

  return { memberId: member.id, role: 'owner', profile }
}

export async function requireMember(ctx: app.Ctx): Promise<Membership> {
  requireRealUser(ctx)
  const membership = (await ensureOwnerProfile(ctx)) ?? (await findMembership(ctx))
  if (!membership) {
    throw new Error('A5NET_MEMBERSHIP_REQUIRED')
  }
  return membership
}

export async function requireOwner(ctx: app.Ctx): Promise<Membership> {
  const membership = await requireMember(ctx)
  if (!ctx.user?.is('Owner')) throw new Error('A5NET_OWNER_ONLY')
  return membership
}

export function memberErrorCode(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (message === 'A5NET_MEMBERSHIP_REQUIRED') return 'Нужен инвайт в A5NET.'
  if (message === 'A5NET_OWNER_ONLY') return 'Этот раздел доступен только A5000.'
  return 'Не удалось выполнить действие.'
}
