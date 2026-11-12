import { requireOwner, memberErrorCode } from "../../server/access";
import PremiumAwards from "../../tables/premium-awards.table";

export const premiumIssueRoute = app
  .post("/")
  .body((s) => ({
    profileId: s.string().max(64),
    itemId: s.string().max(64),
    action: s.string(),
  }))
  .handle(async (ctx, req) => {
    try {
      const owner = await requireOwner(ctx);
      const { profileId, itemId, action } = req.body;

      if (action === "issue") {
        const award = await PremiumAwards.create(ctx, {
          profileId,
          itemId,
          awardedBy: owner.profile.id,
          awardedAt: new Date(),
          isActive: true,
        });
        return { ok: true as const, id: award.id };
      }

      if (action === "revoke") {
        const awards = await PremiumAwards.findAll(ctx, {
          where: { profileId, itemId, isActive: true },
          limit: 1,
          order: [{ createdAt: "desc" }],
        });
        if (awards.length === 0) {
          return {
            ok: false as const,
            error: "Запись не найдена или уже отозвана.",
          };
        }
        const award = awards[0]!;
        await PremiumAwards.update(ctx, { id: award.id, isActive: false });
        return { ok: true as const, id: award.id };
      }

      return { ok: false as const, error: "Неизвестное действие." };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
