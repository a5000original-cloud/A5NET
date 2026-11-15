import OwnerDevices from "../tables/owner-devices.table";
import Profiles from "../tables/profiles.table";
import TrustedDevices from "../tables/trusted-devices.table";
import { getSetting, setSetting } from "./settings";
import { randomToken, sha256Hex } from "./crypto";

const SECURITY_KEY = "ownerSecurity";
const DEVICE_COOKIE = "a5_device";
const PASS_ITERATIONS = 5000;
const RECOVERY_ITERATIONS = 2500;

export interface OwnerSecurity {
  enabled: boolean;
  salt: string;
  hash: string;
  recoveryHashes: string[];
  recoveryEmail: string;
  recoveryPhone: string;
  updatedAt: string;
}

const DEFAULT_SECURITY: OwnerSecurity = {
  enabled: false,
  salt: "",
  hash: "",
  recoveryHashes: [],
  recoveryEmail: "",
  recoveryPhone: "",
  updatedAt: "",
};

export async function getOwnerSecurity(ctx: app.Ctx): Promise<OwnerSecurity> {
  return getSetting<OwnerSecurity>(ctx, SECURITY_KEY, DEFAULT_SECURITY);
}

async function saveOwnerSecurity(
  ctx: app.Ctx,
  security: OwnerSecurity,
): Promise<void> {
  await setSetting(ctx, SECURITY_KEY, security, true);
}

export function hashPass(
  secret: string,
  salt: string,
  iterations = PASS_ITERATIONS,
): string {
  let hash = sha256Hex(`${salt}:${secret}`);
  for (let index = 0; index < iterations; index += 1) {
    hash = sha256Hex(`${hash}:${salt}:${index % 7}`);
  }
  return hash;
}

function cookieValue(ctx: app.Ctx, name: string): string {
  const raw = ctx.req.headers?.cookie ?? "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

export async function ownerDeviceTrusted(ctx: app.Ctx): Promise<boolean> {
  if (!ctx.user?.is("Owner")) return true;
  const security = await getOwnerSecurity(ctx);
  if (!security.enabled) return true;
  const token = cookieValue(ctx, DEVICE_COOKIE);
  if (!token) return false;
  const profile = await Profiles.findOneBy(ctx, {
    platformUserId: ctx.user.id,
  });
  if (!profile) return false;
  const row = await OwnerDevices.findOneBy(ctx, {
    profileId: profile.id,
    tokenHash: sha256Hex(token),
  });
  if (!row || row.revoked) return false;
  const expires =
    row.expiresAt instanceof Date
      ? row.expiresAt.getTime()
      : new Date(row.expiresAt).getTime();
  if (expires < Date.now()) return false;
  const lastSeen =
    row.lastSeenAt instanceof Date
      ? row.lastSeenAt.getTime()
      : new Date(row.lastSeenAt).getTime();
  if (Date.now() - lastSeen > 3600000) {
    await OwnerDevices.update(ctx, { id: row.id, lastSeenAt: new Date() });
  }
  return true;
}

export async function ownerGateRedirect(ctx: app.Ctx) {
  if (await ownerDeviceTrusted(ctx)) return null;
  const back = encodeURIComponent(ctx.req.url || "/a5net/feed");
  return ctx.resp.redirect(`/a5net/gate?back=${back}`);
}

async function trustCurrentDevice(
  ctx: app.Ctx,
  label: string,
): Promise<string> {
  const user = ctx.user;
  if (!user) throw new Error("A5NET_OWNER_ONLY");
  const profile = await Profiles.findOneBy(ctx, { platformUserId: user.id });
  if (!profile) throw new Error("A5NET_OWNER_ONLY");
  const token = randomToken(40);
  await OwnerDevices.create(ctx, {
    profileId: profile.id,
    tokenHash: sha256Hex(token),
    label: label.slice(0, 80) || "Новое устройство",
    userAgent: (ctx.req.headers?.["user-agent"] ?? "").slice(0, 240),
    revoked: false,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    lastSeenAt: new Date(),
  });
  ctx.resp.setHeader(
    "Set-Cookie",
    `${DEVICE_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${30 * 24 * 3600}; HttpOnly; SameSite=Lax; Secure`,
  );
  return token;
}

export async function enableOwnerPass(
  ctx: app.Ctx,
  passphrase: string,
  recoveryEmail: string,
  recoveryPhone: string,
): Promise<
  { ok: true; recoveryCodes: string[] } | { ok: false; error: string }
> {
  if (passphrase.trim().length < 6)
    return { ok: false, error: "Пароль минимум 6 символов." };
  const salt = randomToken(24);
  const hash = hashPass(passphrase.trim(), salt);
  const recoveryCodes = Array.from(
    { length: 8 },
    () => `A5-${randomToken(4)}-${randomToken(4)}`,
  );
  const recoveryHashes = recoveryCodes.map((code) =>
    hashPass(code, salt, RECOVERY_ITERATIONS),
  );
  await saveOwnerSecurity(ctx, {
    enabled: true,
    salt,
    hash,
    recoveryHashes,
    recoveryEmail: recoveryEmail.trim().slice(0, 120),
    recoveryPhone: recoveryPhone.trim().slice(0, 40),
    updatedAt: new Date().toISOString(),
  });
  await trustCurrentDevice(ctx, "Это устройство");
  return { ok: true, recoveryCodes };
}

export async function unlockOwnerPass(
  ctx: app.Ctx,
  passphrase: string,
  label: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const security = await getOwnerSecurity(ctx);
  if (!security.enabled) return { ok: true };
  if (hashPass(passphrase.trim(), security.salt) !== security.hash) {
    return { ok: false, error: "Пароль не подошёл." };
  }
  await trustCurrentDevice(ctx, label || "Новое устройство");
  return { ok: true };
}

export async function recoverOwnerPass(
  ctx: app.Ctx,
  code: string,
  label: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const security = await getOwnerSecurity(ctx);
  if (!security.enabled) return { ok: true };
  const normalized = code.trim().toUpperCase();
  const codeHash = hashPass(normalized, security.salt, RECOVERY_ITERATIONS);
  const index = security.recoveryHashes.indexOf(codeHash);
  if (index < 0) return { ok: false, error: "Код восстановления не подошёл." };
  security.recoveryHashes = security.recoveryHashes.filter(
    (_, position) => position !== index,
  );
  await saveOwnerSecurity(ctx, security);
  await trustCurrentDevice(ctx, label || "Восстановленное устройство");
  return { ok: true };
}

export async function disableOwnerPass(
  ctx: app.Ctx,
  passphrase: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const security = await getOwnerSecurity(ctx);
  if (!security.enabled) return { ok: true };
  if (hashPass(passphrase.trim(), security.salt) !== security.hash) {
    return { ok: false, error: "Пароль не подошёл." };
  }
  await saveOwnerSecurity(ctx, {
    ...security,
    enabled: false,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

export async function listOwnerDevices(ctx: app.Ctx): Promise<
  Array<{
    id: string;
    label: string;
    createdAt: string;
    lastSeenAt: string;
    current: boolean;
  }>
> {
  const user = ctx.user;
  if (!user) return [];
  const profile = await Profiles.findOneBy(ctx, { platformUserId: user.id });
  if (!profile) return [];
  const rows = await OwnerDevices.findAll(ctx, {
    where: { profileId: profile.id },
    limit: 50,
    order: [{ lastSeenAt: "desc" }],
  });
  const currentToken = cookieValue(ctx, DEVICE_COOKIE);
  const currentHash = currentToken ? sha256Hex(currentToken) : "";
  return rows
    .filter((row) => !row.revoked)
    .map((row) => {
      const created =
        row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
      const lastSeen =
        row.lastSeenAt instanceof Date
          ? row.lastSeenAt
          : new Date(row.lastSeenAt);
      return {
        id: row.id,
        label: row.label,
        createdAt: created.toISOString(),
        lastSeenAt: lastSeen.toISOString(),
        current: row.tokenHash === currentHash,
      };
    });
}

export async function revokeOwnerDevice(
  ctx: app.Ctx,
  id: string,
): Promise<boolean> {
  const user = ctx.user;
  if (!user) return false;
  const profile = await Profiles.findOneBy(ctx, { platformUserId: user.id });
  if (!profile) return false;
  const row = await OwnerDevices.findById(ctx, id);
  if (!row || row.profileId !== profile.id) return false;
  await OwnerDevices.update(ctx, { id: row.id, revoked: true });
  return true;
}

export interface SecurityPageData {
  enabled: boolean;
  recoveryEmail: string;
  recoveryPhone: string;
  recoveryLeft: number;
  devices: Array<{
    id: string;
    label: string;
    createdAt: string;
    lastSeenAt: string;
    current: boolean;
  }>;
  trustedNow: boolean;
}

function maskContact(value: string): string {
  if (!value) return "";
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${(name ?? "").slice(0, 2)}•••@${domain ?? ""}`;
  }
  return `${value.slice(0, 2)}•••${value.slice(-2)}`;
}

export async function getSecurityPageData(
  ctx: app.Ctx,
): Promise<SecurityPageData> {
  const security = await getOwnerSecurity(ctx);
  const devices = await listOwnerDevices(ctx);
  return {
    enabled: security.enabled,
    recoveryEmail: maskContact(security.recoveryEmail),
    recoveryPhone: maskContact(security.recoveryPhone),
    recoveryLeft: security.recoveryHashes.length,
    devices,
    trustedNow: await ownerDeviceTrusted(ctx),
  };
}

// === A5PASS PRO — Multi-Account Switching ===

export async function trustDeviceForMultiAccount(
  ctx: app.Ctx,
  userId: string,
  label: string,
): Promise<{ ok: true; deviceHash: string } | { ok: false; error: string }> {
  const security = await getOwnerSecurity(ctx);
  if (!security.enabled) return { ok: false, error: "A5 Pass не включён." };

  const deviceHash = sha256Hex(
    `${userId}:${ctx.req.headers?.["user-agent"] ?? ""}:${Date.now()}`,
  );
  const profile = await Profiles.findOneBy(ctx, { platformUserId: userId });
  if (!profile) return { ok: false, error: "Профиль не найден." };

  await TrustedDevices.create(ctx, {
    userId,
    deviceHash,
    label: label.slice(0, 80) || "Доверенное устройство",
    userAgent: (ctx.req.headers?.["user-agent"] ?? "").slice(0, 240),
    lastLogin: new Date(),
    createdAt: new Date(),
    revoked: false,
  });

  return { ok: true, deviceHash };
}

export async function isDeviceTrustedForMultiAccount(
  ctx: app.Ctx,
  userId: string,
): Promise<boolean> {
  const security = await getOwnerSecurity(ctx);
  if (!security.enabled) return true;

  const deviceHash = sha256Hex(
    `${userId}:${ctx.req.headers?.["user-agent"] ?? ""}:${Date.now()}`,
  );
  const row = await TrustedDevices.findOneBy(ctx, {
    userId,
    deviceHash,
    revoked: false,
  });
  return Boolean(row);
}

export async function listTrustedDevicesForUser(
  ctx: app.Ctx,
  userId: string,
): Promise<
  Array<{ id: string; label: string; lastLogin: string; createdAt: string }>
> {
  const rows = await TrustedDevices.findAll(ctx, {
    where: { userId, revoked: false },
    limit: 20,
    order: [{ lastLogin: "desc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    label: row.label ?? "Устройство",
    lastLogin:
      row.lastLogin instanceof Date
        ? row.lastLogin.toISOString()
        : new Date(row.lastLogin).toISOString(),
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
  }));
}

export async function revokeTrustedDevice(
  ctx: app.Ctx,
  deviceId: string,
  userId: string,
): Promise<boolean> {
  const row = await TrustedDevices.findById(ctx, deviceId);
  if (!row || row.userId !== userId) return false;
  await TrustedDevices.update(ctx, { id: deviceId, revoked: true });
  return true;
}

export async function unlockForMultiAccount(
  ctx: app.Ctx,
  userId: string,
  passphrase: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const security = await getOwnerSecurity(ctx);
  if (!security.enabled) return { ok: true };
  if (hashPass(passphrase.trim(), security.salt) !== security.hash) {
    return { ok: false, error: "Пароль не подошёл." };
  }
  await trustDeviceForMultiAccount(
    ctx,
    userId,
    "Разблокировано мастер-паролем",
  );
  return { ok: true };
}
