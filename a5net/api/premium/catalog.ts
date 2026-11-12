import PremiumItems from "../../tables/premium-items.table";
import PremiumAwards from "../../tables/premium-awards.table";

export const premiumCatalogRoute = app
  .get("/")
  .query((q) => ({ profileId: q.string().max(64).optional() }))
  .handle(async (ctx, req) => {
    const items = await PremiumItems.findAll(ctx, { limit: 100 });
    const result: {
      items: (typeof PremiumItems.T)[];
      awards?: (typeof PremiumItems.T)[];
    } = { items };

    if (req.query.profileId) {
      const awards = await PremiumAwards.findAll(ctx, {
        where: { profileId: req.query.profileId, isActive: true },
        limit: 100,
      });
      const itemById = new Map(items.map((i) => [i.id, i]));
      result.awards = awards
        .map((a) => itemById.get(a.itemId))
        .filter((i): i is typeof PremiumItems.T => i != null);
    }

    return result;
  });
