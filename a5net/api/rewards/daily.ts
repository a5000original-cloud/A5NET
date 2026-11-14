import { requireMember, memberErrorCode } from "../../server/access";
import Profiles from "../../tables/profiles.table";

const DAILY_REWARD_KEY = "dailyReward";
const COOLDOWN_MS = 24 * 3600 * 1000; // 24 hours

const STICKERS = [
  "🔥",
  "💎",
  "✨",
  "🌙",
  "⚡",
  "🎵",
  "🎬",
  "🚀",
  "👑",
  "💫",
  "🌊",
  "🔮",
];

export const dailyRewardRoute = app
  .post("/rewards/daily")
  .handle(async (ctx) => {
    try {
      const membership = await requireMember(ctx);
      const profile = membership.profile;

      // Check cooldown
      const lastClaim = profile.stamps?.find((s: string) =>
        s.startsWith(DAILY_REWARD_KEY + ":"),
      );
      if (lastClaim) {
        const parts = lastClaim.split(":");
        const claimDate = parts[1];
        if (claimDate) {
          const claimTime = new Date(claimDate).getTime();
          const elapsed = Date.now() - claimTime;
          if (elapsed < COOLDOWN_MS) {
            const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 3600000);
            return {
              ok: false as const,
              error: `Награда уже забрана. Повторно через ${remaining} ч.`,
            };
          }
        }
      }

      // Generate random reward
      const isBonus = Math.random() < 0.3; // 30% chance for karma bonus
      let rewardText = "";

      if (isBonus) {
        // Karma bonus: +100 to followers as "karma"
        const bonus = 100;
        await Profiles.update(ctx, {
          id: profile.id,
          followersCount: profile.followersCount + bonus,
        });
        rewardText = `+${bonus} кармы`;
      } else {
        // Random sticker
        const idx = Math.floor(Math.random() * STICKERS.length);
        const sticker = STICKERS[idx];
        if (sticker) {
          const currentStickers: string[] = profile.stickers ?? [];
          await Profiles.update(ctx, {
            id: profile.id,
            stickers: [...currentStickers, sticker],
          });
          rewardText = `стикер ${sticker}`;
        }
      }

      // Record claim
      const claimStamp = `${DAILY_REWARD_KEY}:${new Date().toISOString()}`;
      const stamps = [...(profile.stamps ?? []), claimStamp];
      await Profiles.update(ctx, { id: profile.id, stamps });

      return {
        ok: true as const,
        reward: rewardText,
        streak: profile.streakDays,
      };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
