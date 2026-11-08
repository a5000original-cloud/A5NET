import { defineRoute } from "chatium";
import { requireMember } from "../server/access";
import { getShortsData } from "../server/shorts";

export default defineRoute({
  path: "/shorts",
  method: "get",
  async handler(ctx) {
    const membership = await requireMember(ctx);
    if (!membership) return ctx.html("<h1>Нужен инвайт</h1>");
    const data = await getShortsData(ctx, membership.profile, membership.role);
    return ctx.render("ShortsPage", { data });
  },
});
