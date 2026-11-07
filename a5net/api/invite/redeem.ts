import { requireSameOrigin } from '../../server/http-guard'
import { requireRealUser } from '@app/auth'
import Profiles from '../../tables/profiles.table'
import Members from '../../tables/members.table'
import { findMembership } from '../../server/access'
import { embedTopics } from '../../server/vec'
import { transliterate } from '../../server/bots/personas'
import { consumeInviteUse, findInviteByCode } from '../../server/invites'
import { consumeRate, rateLimitMessage } from '../../server/rate-limit'

function handleCandidate(name: string, username: string | undefined): string {
  const base = username?.trim() || transliterate(name).replace(/\s+/g, '.') || 'guest'
  return base.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 28) || 'guest'
}

export const inviteRedeemRoute = app.post('/')
  .body(s => ({ code: s.string().min(3).max(40) }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const user = requireRealUser(ctx)
      const existing = await findMembership(ctx)
      if (existing) return { ok: true as const, alreadyMember: true }

      const rate = await consumeRate(ctx, 'invite:redeem', user.id, 5, 60 * 1000)
      if (!rate.ok) return { ok: false as const, error: rateLimitMessage(rate) }

      const invite = await findInviteByCode(ctx, req.body.code)
      if (!invite || !invite.active) return { ok: false as const, error: 'Код не найден или уже недействителен.' }
      if (invite.uses >= invite.maxUses) return { ok: false as const, error: 'У этого кода закончились приглашения.' }
      if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
        return { ok: false as const, error: 'Срок действия кода истёк.' }
      }

      let handle = handleCandidate(user.displayName || 'Участник', user.username)
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const taken = await Profiles.findOneBy(ctx, { handle })
        if (!taken) break
        handle = `${handleCandidate(user.displayName || 'Участник', user.username)}${attempt + 2}`
      }

      const name = user.displayName || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Участник A5NET'
      const interests = ['music', 'cinema', 'city']
      const profile = await Profiles.create(ctx, {
        handle,
        name,
        age: 27,
        city: '—',
        bio: 'Пришёл по приглашению. Пока осматриваюсь.',
        kind: 'human',
        isSynthetic: false,
        voiceTone: 'warm',
        commentLength: 'medium',
        slang: false,
        emoji: false,
        argumentative: 0.4,
        politicalLeaning: 'neutral',
        interests,
        interestVector: embedTopics(interests),
        chronotype: 'steady',
        avatarHue: Math.floor(Math.random() * 360),
        avatarAccent: Math.floor(Math.random() * 360),
        enabled: true,
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        postsCount: 0,
        platformUserId: user.id,
      })

      await Members.create(ctx, {
        platformUserId: user.id,
        profileId: profile.id,
        role: 'member',
        invitedBy: invite.createdByProfileId,
        inviteCode: invite.code || 'hashed',
      })

      await consumeInviteUse(ctx, invite)
      return { ok: true as const, profileId: profile.id }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      return {
        ok: false as const,
        error: message.includes('already exists') || message.includes('duplicate')
          ? 'Похоже, профиль уже создан. Обнови страницу.'
          : 'Не удалось применить приглашение.',
      }
    }
  })
