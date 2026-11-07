import { requireSameOrigin } from '../../server/http-guard'
import { memberErrorCode, requireMember } from '../../server/access'
import { updateProfileSettings } from '../../server/profile-settings'

export const profileUpdateRoute = app.post('/')
  .body(s => ({
    name: s.string().max(40).optional(),
    handle: s.string().max(30).optional(),
    city: s.string().max(40).optional(),
    bio: s.string().max(300).optional(),
    tagline: s.string().max(60).optional(),
    links: s.array(s.string()).max(4).optional(),
    stickers: s.array(s.string()).max(8).optional(),
    profileTheme: s.enum(['graphite', 'lime', 'violet', 'ember', 'ice'] as const).optional(),
    accentHue: s.number().min(0).max(360).optional(),
    coverPosition: s.number().min(0).max(100).optional(),
    pinnedPostId: s.string().max(80).optional(),
    avatarHash: s.string().max(300).optional(),
    coverHash: s.string().max(300).optional(),
    removeAvatar: s.boolean().optional(),
    removeCover: s.boolean().optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx)
      if (guard) return { ok: false as const, error: guard }
      const membership = await requireMember(ctx)
      const result = await updateProfileSettings(
        ctx,
        membership.profile,
        req.body,
        Boolean(ctx.user?.is('Owner')),
      )
      if (!result.ok) return { ok: false as const, error: result.error }
      return { ok: true as const, handle: result.profile.handle }
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) }
    }
  })
