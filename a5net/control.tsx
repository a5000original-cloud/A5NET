import { jsx } from "@app/html-jsx";
import { Styles } from "./styles";
import ControlPage from "./components/ControlPage.vue";
import { getControlData } from "./server/control-data";
import { ownerGateRedirect } from "./server/security";
import { resolveMembership } from "./server/page-helpers";
import { toAuthorCard } from "./server/social";

export const controlPageRoute = app.get("/", async (ctx) => {
  const membership = await resolveMembership(ctx);
  if (!membership) return ctx.resp.redirect("/");
  const gate = await ownerGateRedirect(ctx);
  if (gate) return gate;
  if (!ctx.user?.is("Owner")) return ctx.resp.redirect("/");

  const data = await getControlData(ctx);

  return (
    <html lang="ru">
      <head>
        <title>Пульт флота — A5NET</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Styles />
      </head>
      <body class="bg-ink">
        <ControlPage
          ssr
          data={data}
          viewer={toAuthorCard(membership.profile)}
          role={membership.role}
        />
      </body>
    </html>
  );
});
