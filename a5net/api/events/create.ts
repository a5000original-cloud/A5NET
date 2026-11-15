import { requireOwner, memberErrorCode } from "../../server/access";
import Events from "../../tables/events.table";
import PremiumItems from "../../tables/premium-items.table";
import Profiles from "../../tables/profiles.table";

export const eventCreateRoute = app
  .post("/")
  .body((s) => ({
    title: s.string().max(120),
    hashtag: s.string().max(30),
    eventType: s.string().max(20),
    prizeItemId: s.string().max(64).optional(),
    prizeSubscribers: s.number().int().min(0).default(0),
  }))
  .handle(async (ctx, req) => {
    try {
      await requireOwner(ctx);

      const event = await Events.create(ctx, {
        title: req.body.title,
        hashtag: req.body.hashtag,
        eventType: req.body.eventType as "challenge" | "vote",
        prizeItemId: req.body.prizeItemId ?? null,
        prizeSubscribers: req.body.prizeSubscribers,
        isActive: true,
        createdAt: new Date(),
      });

      return { ok: true as const, id: event.id };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });

export const eventListRoute = app.get("/").handle(async (ctx) => {
  const events = await Events.findAll(ctx, {
    where: { isActive: true },
    limit: 50,
    order: [{ createdAt: "desc" }],
  });
  return { ok: true as const, events };
});

export const eventEndRoute = app
  .post("/end")
  .body((s) => ({ eventId: s.string().max(64) }))
  .handle(async (ctx, req) => {
    try {
      await requireOwner(ctx);
      await Events.update(ctx, { id: req.body.eventId, isActive: false });
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
