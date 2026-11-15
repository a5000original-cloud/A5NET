import { requireOwner, memberErrorCode } from "../../server/access";
import { unlockForMultiAccount } from "../../server/security";

export const securityUnlockMultiAccountRoute = app
  .post("/")
  .body((s) => ({
    userId: s.string().max(64),
    passphrase: s.string().max(128),
  }))
  .handle(async (ctx, req) => {
    try {
      await requireOwner(ctx);
      const { userId, passphrase } = req.body;
      const result = await unlockForMultiAccount(ctx, userId, passphrase);
      if (!result.ok) {
        return { ok: false as const, error: result.error };
      }
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const, error: memberErrorCode(error) };
    }
  });
