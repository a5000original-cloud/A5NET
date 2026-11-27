import { api } from "@app/api";
import { profilesTable } from "../../tables/profiles";
import { sessionsTable } from "../../tables/sessions";

// Получить список доступных аккаунтов
export const switchAccountRoute = {
  query: api.get("/auth/switch-account", async (ctx) => {
    if (!ctx.user) {
      return { ok: false, error: "Не авторизован" };
    }

    // Найти все профили, связанные с этим пользователем (по email или device_id)
    const deviceId =
      ctx.req.headers.get("x-device-id") || ctx.req.headers.get("user-agent");
    const profiles = await profilesTable.findMany({
      userId: ctx.user.id,
    });

    const accounts = profiles.map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      avatarUrl: p.avatarUrl,
      avatarHue: p.avatarHue,
      avatarAccent: p.avatarAccent,
    }));

    return { ok: true, accounts };
  }),

  run: api.post("/auth/switch-account", async (ctx) => {
    if (!ctx.user) {
      return { ok: false, error: "Не авторизован" };
    }

    const body = (await ctx.req.json()) as { accountId: string };

    // Проверить, что аккаунт принадлежит пользователю
    const profile = await profilesTable.findOne({
      id: body.accountId,
      userId: ctx.user.id,
    });

    if (!profile) {
      return { ok: false, error: "Аккаунт не найден" };
    }

    // Создать новую сессию для этого профиля
    const session = {
      id: crypto.randomUUID(),
      userId: ctx.user.id,
      profileId: profile.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней
    };

    await sessionsTable.insert(session);

    // Установить куки с новой сессией
    ctx.resp.headers.set(
      "Set-Cookie",
      `session_id=${session.id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`,
    );

    return { ok: true };
  }),
};
