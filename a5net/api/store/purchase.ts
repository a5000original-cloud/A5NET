import { requireMember, memberErrorCode } from "../../server/access";
import Profiles from "../../tables/profiles.table";

export interface StorePurchaseResult {
  ok: boolean;
  message?: string;
  error?: string;
  coins?: number;
}

export const storePurchaseRoute = app
  .post("/")
  .body((s) => ({
    action: s.enum([
      "buy_premium_coins",
      "buy_premium_stripe",
      "buy_coins",
    ] as const),
    profileId: s.string().max(64),
    plan: s.string().max(32).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx);
      const { action, profileId, plan } = req.body;

      const profile = await Profiles.findById(ctx, profileId);
      if (!profile) {
        return { ok: false as const, error: "Профиль не найден." };
      }

      if (action === "buy_premium_coins") {
        const cost = 3000;
        if ((profile.a5coins ?? 0) < cost) {
          return { ok: false as const, error: "Недостаточно монет." };
        }
        profile.a5coins = (profile.a5coins ?? 0) - cost;
        profile.isPremium = true;
        profile.premiumUntil = new Date(Date.now() + 365 * 24 * 3600 * 1000);
        await Profiles.update(ctx, {
          id: profile.id,
          a5coins: profile.a5coins,
          isPremium: true,
          premiumUntil: profile.premiumUntil,
        });
        return { ok: true as const, message: "Premium активирован!" };
      }

      if (action === "buy_premium_stripe") {
        // Заглушка для Stripe/ЮKassa
        profile.isPremium = true;
        if (plan === "year") {
          profile.premiumUntil = new Date(Date.now() + 365 * 24 * 3600 * 1000);
        } else {
          profile.premiumUntil = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        }
        await Profiles.update(ctx, {
          id: profile.id,
          isPremium: true,
          premiumUntil: profile.premiumUntil,
        });
        return { ok: true as const, message: "Premium активирован!" };
      }

      if (action === "buy_coins") {
        const amount = parseInt(plan ?? "1000", 10);
        if (isNaN(amount) || amount <= 0) {
          return {
            ok: false as const,
            error: "Некорректное количество монет.",
          };
        }
        profile.a5coins = (profile.a5coins ?? 0) + amount;
        await Profiles.update(ctx, {
          id: profile.id,
          a5coins: profile.a5coins,
        });
        return { ok: true as const, coins: profile.a5coins };
      }

      return { ok: false as const, error: "Неизвестное действие." };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
