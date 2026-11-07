import { getOriginalUrl } from '@app/storage'
import Profiles from '../tables/profiles.table'
import type { ProfileSettingsData } from '../shared/types'
import { buildProfileCard } from './feed'
import { getViewerSocial } from './social'
import { listPosts } from './post-data'
import { listSubscriberTransfers } from './subscribers'

const CONFUSABLES: Record<string, string> = {
  '0': 'o',
  '1': 'l',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
}

export function canonicalHandle(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .split('')
    .map(char => CONFUSABLES[char] ?? char)
    .join('')
}

const OWNER_ALIASES = ['a5000', 'a5000_original', 'a5000original', 'a5ooo', 'a500o', 'a5o00', 'a5000net']
const OWNER_ALIAS_KEYS = new Set(OWNER_ALIASES.map(canonicalHandle))
export const RESERVED_HANDLES = [
  'a5net',
  'a5000net',
  'admin',
  'administrator',
  'support',
  'owner',
  'manager',
  'moderator',
  'system',
  'root',
  ...OWNER_ALIASES,
]
const RESERVED_KEYS = new Set(RESERVED_HANDLES.map(canonicalHandle))
const USERNAME_COOLDOWN_MS = 14 * 24 * 3600 * 1000
const THEMES = ['graphite', 'lime', 'violet', 'ember', 'ice'] as const

export type ProfileTheme = (typeof THEMES)[number]

export interface ProfileSettingsInput {
  name?: string
  handle?: string
  city?: string
  bio?: string
  tagline?: string
  links?: string[]
  stickers?: string[]
  profileTheme?: ProfileTheme
  accentHue?: number
  coverPosition?: number
  pinnedPostId?: string
  avatarHash?: string
  coverHash?: string
  removeAvatar?: boolean
  removeCover?: boolean
}

export async function getProfileSettingsData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
): Promise<ProfileSettingsData> {
  const social = await getViewerSocial(ctx, viewer.id)
  const profile = buildProfileCard(viewer, viewer, social, social)
  const posts = await listPosts(ctx, { viewerId: viewer.id, authorId: viewer.id, limit: 50 })
  const transfers = await listSubscriberTransfers(ctx, viewer.id)
  return {
    viewer: profile,
    viewerRole: ctx.user?.is('Owner') ? 'owner' : 'member',
    profile,
    transfers,
    posts: posts.items.map(post => ({
      id: post.id,
      title: post.title,
      kind: post.kind,
      coverUrl: post.coverUrl,
    })),
    reserved: RESERVED_HANDLES,
    now: new Date().toISOString(),
  }
}

export function normalizeHandle(input: string): string {
  return input.trim().normalize('NFKC').toLowerCase().replace(/^@+/, '')
}

export async function checkHandle(
  ctx: app.Ctx,
  handleInput: string,
  profile: typeof Profiles.T,
  isOwner: boolean,
): Promise<{ ok: boolean; handle: string; error?: string }> {
  const handle = normalizeHandle(handleInput)
  if (/[^\x00-\x7F]/.test(handle)) {
    return { ok: false, handle, error: 'Только латиница: кириллица и похожие символы запрещены.' }
  }
  if (handle.length < 3 || handle.length > 24) {
    return { ok: false, handle, error: '3–24 символа: латиница, цифры, точка, подчёркивание.' }
  }
  if (!/^[a-z0-9._]+$/.test(handle)) {
    return { ok: false, handle, error: 'Только латиница, цифры, точка и подчёркивание.' }
  }

  const key = canonicalHandle(handle)
  const ownKey = canonicalHandle(profile.handle)
  if (OWNER_ALIAS_KEYS.has(key) && key !== ownKey) {
    return { ok: false, handle, error: 'Этот ник закреплён за A5000. Выбери другой.' }
  }
  if (!OWNER_ALIAS_KEYS.has(key) && RESERVED_KEYS.has(key) && key !== ownKey) {
    return { ok: false, handle, error: 'Этот ник зарезервирован.' }
  }
  if (key !== ownKey) {
    const all = await Profiles.findAll(ctx, { limit: 500 })
    const taken = all.find(other => other.id !== profile.id && canonicalHandle(other.handle) === key)
    if (taken) return { ok: false, handle, error: 'Ник уже занят (включая похожие написания).' }
  }
  return { ok: true, handle }
}

function cleanLinks(links: string[] | undefined): string[] {
  if (!links) return []
  return links
    .map(link => link.trim())
    .filter(link => /^https?:\/\/\S+$/i.test(link))
    .slice(0, 4)
}

function cleanStickers(stickers: string[] | undefined): string[] {
  if (!stickers) return []
  return stickers.map(sticker => sticker.trim()).filter(Boolean).slice(0, 8)
}

export async function updateProfileSettings(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  input: ProfileSettingsInput,
  isOwner: boolean,
): Promise<{ ok: true; profile: typeof Profiles.T } | { ok: false; error: string }> {
  const patch: Record<string, unknown> = {}

  if (input.name !== undefined) {
    const name = input.name.trim().slice(0, 40)
    if (name.length < 2) return { ok: false, error: 'Имя слишком короткое.' }
    patch.name = name
  }
  if (input.city !== undefined) patch.city = input.city.trim().slice(0, 40)
  if (input.bio !== undefined) patch.bio = input.bio.trim().slice(0, 300)
  if (input.tagline !== undefined) patch.tagline = input.tagline.trim().slice(0, 60)
  if (input.links !== undefined) patch.links = cleanLinks(input.links)
  if (input.stickers !== undefined) patch.stickers = cleanStickers(input.stickers)
  if (input.profileTheme !== undefined && THEMES.includes(input.profileTheme)) patch.profileTheme = input.profileTheme
  if (input.accentHue !== undefined) patch.accentHue = Math.max(0, Math.min(360, Math.round(input.accentHue)))
  if (input.coverPosition !== undefined) patch.coverPosition = Math.max(0, Math.min(100, Math.round(input.coverPosition)))

  if (input.avatarHash) patch.avatarUrl = getOriginalUrl(ctx, input.avatarHash)
  if (input.coverHash) patch.coverUrl = getOriginalUrl(ctx, input.coverHash)
  if (input.removeAvatar) patch.avatarUrl = ''
  if (input.removeCover) patch.coverUrl = ''

  if (input.pinnedPostId !== undefined) {
    if (!input.pinnedPostId) {
      patch.pinnedPostId = ''
    } else {
      const pinnedId = input.pinnedPostId
      const post = await import('../tables/posts.table').then(mod => mod.default.findById(ctx, pinnedId))
      if (!post || post.authorId !== viewer.id) return { ok: false, error: 'Закрепить можно только свой пост.' }
      patch.pinnedPostId = post.id
    }
  }

  if (input.handle !== undefined) {
    const result = await checkHandle(ctx, input.handle, viewer, isOwner)
    if (!result.ok) return { ok: false, error: result.error ?? 'Ник не подошёл.' }
    if (result.handle !== viewer.handle) {
      if (!isOwner && viewer.usernameChangedAt) {
        const changed = viewer.usernameChangedAt instanceof Date
          ? viewer.usernameChangedAt.getTime()
          : new Date(viewer.usernameChangedAt).getTime()
        if (Date.now() - changed < USERNAME_COOLDOWN_MS) {
          return { ok: false, error: 'Ник можно менять раз в 14 дней.' }
        }
      }
      patch.handle = result.handle
      patch.usernameChangedAt = new Date()
    }
  }

  const updated = await Profiles.update(ctx, { id: viewer.id, ...patch } as Parameters<typeof Profiles.update>[1])
  return { ok: true, profile: updated }
}
