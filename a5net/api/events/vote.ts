import {
  requireOwner,
  requireMember,
  memberErrorCode,
} from "../../server/access";
import Votes from "../../tables/votes.table";
import Events from "../../tables/events.table";
import PremiumItems from "../../tables/premium-items.table";
import PremiumAwards from "../../tables/premium-awards.table";
import Profiles from "../../tables/profiles.table";

export const voteCastRoute = app
  .post("/")
  .body((s) => ({
    eventId: s.string().max(64),
    targetProfileId: s.string().max(64),
  }))
  .handle(async (ctx, req) => {
    try {
      const membership = await requireMember(ctx);
      const { eventId, targetProfileId } = req.body;

      // Check event exists and is active
      const event = await Events.findById(ctx, eventId);
      if (!event || !event.isActive) {
        return { ok: false as const, error: "Ивент не найден или завершён." };
      }

      if (event.eventType !== "vote") {
        return { ok: false as const, error: "Этот ивент не для голосования." };
      }

      // Prevent double voting
      const existing = await Votes.findOneBy(ctx, {
        eventId,
        targetProfileId,
        voterId: membership.memberId,
      });
      if (existing) {
        return { ok: false as const, error: "Вы уже голосовали." };
      }

      await Votes.create(ctx, {
        eventId,
        targetProfileId,
        voterId: membership.memberId,
        createdAt: new Date(),
      });

      // Recount votes
      const votes = await Votes.findAll(ctx, {
        where: { eventId },
        limit: 1000,
      });
      const counts = new Map<string, number>();
      for (const v of votes) {
        counts.set(v.targetProfileId, (counts.get(v.targetProfileId) ?? 0) + 1);
      }

      return { ok: true as const, counts: Object.fromEntries(counts) };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });

export const voteResultsRoute = app
  .get("/")
  .query((q) => ({ eventId: q.string().max(64) }))
  .handle(async (ctx, req) => {
    const votes = await Votes.findAll(ctx, {
      where: { eventId: req.query.eventId },
      limit: 10000,
    });
    const counts = new Map<string, number>();
    for (const v of votes) {
      counts.set(v.targetProfileId, (counts.get(v.targetProfileId) ?? 0) + 1);
    }

    // Get profile names
    const results: Array<{ profileId: string; name: string; votes: number }> =
      [];
    for (const [profileId, count] of counts) {
      const profile = await Profiles.findById(ctx, profileId);
      results.push({
        profileId,
        name: profile?.name ?? "Неизвестный",
        votes: count,
      });
    }
    results.sort((a, b) => b.votes - a.votes);

    return { ok: true as const, results, total: votes.length };
  });

export const voteAwardWinnerRoute = app
  .post("/award")
  .body((s) => ({
    eventId: s.string().max(64),
    winnerProfileId: s.string().max(64),
  }))
  .handle(async (ctx, req) => {
    try {
      await requireOwner(ctx);
      const { eventId, winnerProfileId } = req.body;

      const event = await Events.findById(ctx, eventId);
      if (!event || !event.isActive) {
        return { ok: false as const, error: "Ивент не найден." };
      }
      if (!event.prizeItemId) {
        return { ok: false as const, error: "У ивента нет приза." };
      }

      // Award the prize
      await PremiumAwards.create(ctx, {
        profileId: winnerProfileId,
        itemId: event.prizeItemId,
        awardedBy: ctx.user?.id ?? "system",
        awardedAt: new Date(),
        isActive: true,
      });

      // Bonus subscribers
      const winner = await Profiles.findById(ctx, winnerProfileId);
      if (winner) {
        await Profiles.update(ctx, {
          id: winnerProfileId,
          followersCount: winner.followersCount + event.prizeSubscribers,
        });
      }

      // End event
      await Events.update(ctx, { id: eventId, isActive: false });

      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
