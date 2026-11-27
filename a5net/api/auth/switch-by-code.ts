import { requireMember, memberErrorCode } from "../../server/access";
import Profiles from "../../tables/profiles.table";
import Members from "../../tables/members.table";

// Хеш кода A5-OWNER-2024-SECRET
const A5000_CODE_HASH =
  "6905626e3e1dd55cf59d47c2aa84af9cf4833802da3e07e6e428f403d4502be6";

// Хеширование SHA-256 (нативный Web Crypto API, работает в Chatium)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const switchByCodeRoute = app
  .post("/auth/switch-by-code")
  .body((s) => ({
    code: s.string().max(64).optional(),
    targetProfileId: s.string().max(64).optional(),
  }))
  .handle(async (ctx, req) => {
    try {
      // Проверяем, что пользователь авторизован в Chatium
      if (!ctx.user || ctx.user.type !== "Real") {
        return { ok: false as const, error: "Не авторизован" };
      }

      const { code, targetProfileId } = req.body;
      let newProfileId: string | null = null;
      let newRole: "owner" | "admin" | "member" = "member";

      // Вариант 1: Вход по мастер-коду A5000
      if (code) {
        const codeHash = await sha256(code);
        if (codeHash === A5000_CODE_HASH) {
          // Ищем профиль владельца через таблицу Members (роль "owner")
          const ownerMembers = await Members.findAll(ctx, {
            where: { role: "owner" },
            limit: 1,
          });
          const ownerMember = ownerMembers[0];

          if (ownerMember) {
            newProfileId = ownerMember.profileId;
            newRole = "owner";
          } else {
            return {
              ok: false as const,
              error: "Профиль владельца не найден в БД",
            };
          }
        } else {
          return { ok: false as const, error: "Неверный код доступа" };
        }
      }
      // Вариант 2: Быстрое переключение на другой свой профиль
      else if (targetProfileId) {
        const profile = await Profiles.findById(ctx, targetProfileId);
        if (!profile) {
          return { ok: false as const, error: "Профиль не найден" };
        }
        newProfileId = targetProfileId;
      } else {
        return { ok: false as const, error: "Некорректный запрос" };
      }

      // Переключаем сессию: обновляем запись в Members для текущего пользователя
      if (newProfileId) {
        const currentMembers = await Members.findAll(ctx, {
          where: { platformUserId: ctx.user.id },
          limit: 1,
        });
        const currentMember = currentMembers[0];

        if (currentMember) {
          // Пытаемся обновить существующую запись
          // @ts-ignore — Chatium типы могут не иметь update для Members, но метод обычно есть
          await Members.update(ctx, {
            id: currentMember.id,
            profileId: newProfileId,
            role: newRole,
          });
        } else {
          // Если записи нет — создаём
          await Members.create(ctx, {
            platformUserId: ctx.user.id,
            profileId: newProfileId,
            role: newRole,
            inviteCode: code ? "master_a5000" : "switch",
          });
        }

        return {
          ok: true as const,
          message: "Аккаунт переключён. Перезагрузка...",
        };
      }

      return { ok: false as const, error: "Ошибка переключения" };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
