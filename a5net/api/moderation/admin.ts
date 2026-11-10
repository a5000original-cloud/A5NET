import { requireSameOrigin } from "../../server/http-guard";
import { memberErrorCode, requireOwner } from "../../server/access";
import Profiles from "../../tables/profiles.table";
import Posts from "../../tables/posts.table";
import Members from "../../tables/members.table";

export const moderationRoute = app
  .post("/")
  .body((s) => ({
    action: s.enum([
      "ban_user",
      "unban_user",
      "pin_post",
      "unpin_post",
      "promote_post",
      "demote_post",
      "hide_post",
      "delete_post",
      "set_followers",
      "grant_premium",
      "revoke_premium",
      "assign_stamp",
    ] as const),
    profileId: s.string().max(100).optional(),
    postId: s.string().max(100).optional(),
    banDuration: s.number().optional(), // minutes, 0 = permanent
    followersCount: s.number().optional(),
    premiumUntil: s.string().max(50).optional(),
    stamp: s.string().max(50).optional(),
    promoteLevel: s.number().min(1).max(3).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const guard = requireSameOrigin(ctx);
      if (guard) return { ok: false as const, error: guard };
      await requireOwner(ctx);

      const {
        action,
        profileId,
        postId,
        banDuration,
        followersCount,
        premiumUntil,
        stamp,
        promoteLevel,
      } = req.body;

      // === BAN / UNBAN USER ===
      if (action === "ban_user" && profileId) {
        const profile = await Profiles.findById(ctx, profileId);
        if (!profile) return { ok: false as const, error: "Профиль не найден" };
        const member = await Members.findOneBy(ctx, {
          platformUserId: profile.platformUserId ?? "",
        });
        const lockedUntil =
          banDuration && banDuration > 0
            ? new Date(Date.now() + banDuration * 60000)
            : new Date("2099-12-31"); // permanent
        await Profiles.update(ctx, { id: profileId, lockedUntil });
        return {
          ok: true as const,
          message: `Пользователь ${profile.name} заблокирован${banDuration && banDuration > 0 ? ` на ${banDuration} мин` : " навсегда"}`,
        };
      }

      if (action === "unban_user" && profileId) {
        await Profiles.update(ctx, { id: profileId, lockedUntil: undefined });
        const profile = await Profiles.findById(ctx, profileId);
        return {
          ok: true as const,
          message: `Пользователь ${profile?.name ?? "разблокирован"}`,
        };
      }

      // === PIN / UNPIN POST ===
      if (action === "pin_post" && postId) {
        const post = await Posts.findById(ctx, postId);
        if (!post) return { ok: false as const, error: "Пост не найден" };
        await Posts.update(ctx, { id: postId, pinned: true });
        return { ok: true as const, message: `Пост «${post.title}» закреплён` };
      }

      if (action === "unpin_post" && postId) {
        await Posts.update(ctx, { id: postId, pinned: false });
        return { ok: true as const, message: "Пост откреплён" };
      }

      // === PROMOTE / DEMOTE POST ===
      if (action === "promote_post" && postId && promoteLevel) {
        const post = await Posts.findById(ctx, postId);
        if (!post) return { ok: false as const, error: "Пост не найден" };
        const boost = promoteLevel * 50;
        await Posts.update(ctx, {
          id: postId,
          hypeScore: post.hypeScore + boost,
          promotedBy: "a5000",
          promoteLevel,
        });
        return {
          ok: true as const,
          message: `Пост «${post.title}» продвинут (уровень ${promoteLevel})`,
        };
      }

      if (action === "demote_post" && postId) {
        const post = await Posts.findById(ctx, postId);
        if (!post) return { ok: false as const, error: "Пост не найден" };
        await Posts.update(ctx, {
          id: postId,
          hypeScore: Math.max(0, post.hypeScore - 30),
          promoteLevel: undefined,
          promotedBy: undefined,
        });
        return { ok: true as const, message: "Пост демотирован" };
      }

      // === HIDE / DELETE POST ===
      if (action === "hide_post" && postId) {
        await Posts.update(ctx, { id: postId, visibility: "hidden" });
        return { ok: true as const, message: "Пост скрыт" };
      }

      if (action === "delete_post" && postId) {
        await Posts.update(ctx, { id: postId, visibility: "hidden" });
        return { ok: true as const, message: "Пост удалён" };
      }

      // === SET FOLLOWERS (for bot 4_а) ===
      if (
        action === "set_followers" &&
        profileId &&
        followersCount !== undefined
      ) {
        const profile = await Profiles.findById(ctx, profileId);
        if (!profile) return { ok: false as const, error: "Профиль не найден" };
        await Profiles.update(ctx, { id: profileId, followersCount });
        return {
          ok: true as const,
          message: `${profile.name}: ${followersCount.toLocaleString("ru-RU")} подписчиков`,
        };
      }

      // === GRANT / REVOKE PREMIUM ===
      if (action === "grant_premium" && profileId && premiumUntil) {
        const profile = await Profiles.findById(ctx, profileId);
        if (!profile) return { ok: false as const, error: "Профиль не найден" };
        await Profiles.update(ctx, {
          id: profileId,
          premiumUntil: new Date(premiumUntil),
        });
        return {
          ok: true as const,
          message: `Премиум для ${profile.name} до ${premiumUntil}`,
        };
      }

      if (action === "revoke_premium" && profileId) {
        const profile = await Profiles.findById(ctx, profileId);
        if (!profile) return { ok: false as const, error: "Профиль не найден" };
        await Profiles.update(ctx, { id: profileId, premiumUntil: undefined });
        return {
          ok: true as const,
          message: `Премиум для ${profile.name} отозван`,
        };
      }

      // === ASSIGN STAMP ===
      if (action === "assign_stamp" && profileId && stamp) {
        const profile = await Profiles.findById(ctx, profileId);
        if (!profile) return { ok: false as const, error: "Профиль не найден" };
        const stickers = profile.stickers || [];
        if (!stickers.includes(stamp)) {
          stickers.push(stamp);
          await Profiles.update(ctx, { id: profileId, stickers });
        }
        return {
          ok: true as const,
          message: `Наклейка "${stamp}" выдана ${profile.name}`,
        };
      }

      return { ok: false as const, error: "Неизвестное действие" };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
