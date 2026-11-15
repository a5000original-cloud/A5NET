import { jsx } from "@app/html-jsx";
import { Styles } from "./styles";
import StorePage from "./components/StorePage.vue";
import { storeListRoute } from "./api/store/list";
import { resolveMembership } from "./server/page-helpers";
import { toAuthorCard } from "./server/social";

export const storePageRoute = app.get("/", async (ctx) => {
  const membership = await resolveMembership(ctx);
  if (!membership) return ctx.resp.redirect("/");
  const data = {
    viewer: toAuthorCard(membership.profile),
    viewerRole: membership.role,
  };

  return (
    <html lang="ru">
      <head>
        <title>Магазин A5NET — Premium и монеты</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <StorePage ssr data={data} />
      </body>
    </html>
  );
});
