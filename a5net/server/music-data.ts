import Profiles from '../tables/profiles.table'
import type { MusicHubData, MusicShelf, MusicTrack } from '../shared/types'
import { listPosts } from './post-data'
import { toAuthorCard } from './social'
import { mediaCover, trackArtist } from '../shared/format'

const SHELVES: Array<{ id: string; title: string; subtitle: string; topics: string[] }> = [
  { id: 'night', title: 'Ночной поток', subtitle: 'для дороги домой после полуночи', topics: ['nightlife', 'ambient', 'techno', 'shoegaze'] },
  { id: 'morning', title: 'Медленное утро', subtitle: 'кофе, окно, ничего не срочно', topics: ['lofi', 'jazz', 'indie', 'classical'] },
  { id: 'focus', title: 'Глубокая работа', subtitle: 'без слов и без резких переходов', topics: ['ambient', 'classical', 'lofi'] },
  { id: 'loud', title: 'Громкая комната', subtitle: 'когда тишины уже достаточно', topics: ['techno', 'hiphop', 'shoegaze'] },
]

export async function getMusicHubData(
  ctx: app.Ctx,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<MusicHubData> {
  const page = await listPosts(ctx, { viewerId: viewer.id, kind: 'music', limit: 100 })
  const tracks: MusicTrack[] = page.items
    .filter(post => Boolean(post.mediaUrl))
    .map(post => ({
      id: post.id,
      title: post.title,
      artist: trackArtist(post.body, post.author.name),
      url: post.mediaUrl ?? '',
      coverUrl: post.coverUrl,
      duration: post.durationSec,
      hue: post.coverHue,
      author: post.author,
      likes: post.likes,
      views: post.views,
      ago: post.ago,
      topics: post.topics,
    }))

  const shelves: MusicShelf[] = SHELVES.map(shelf => {
    const ids = tracks
      .filter(track => track.topics.some(topic => shelf.topics.includes(topic.id)))
      .slice(0, 14)
      .map(track => track.id)
    return {
      id: shelf.id,
      title: shelf.title,
      subtitle: shelf.subtitle,
      ids: ids.length ? ids : tracks.slice(0, 6).map(track => track.id),
    }
  }).filter(shelf => shelf.ids.length > 0)

  const originals = tracks.filter(track => track.author.handle === 'a5000')
  if (originals.length) {
    shelves.unshift({
      id: 'a5000-originals',
      title: 'A5000 · оригиналы',
      subtitle: 'Null Null Null Music · все треки',
      ids: originals.map(track => track.id),
    })
  }

  const featured = [...tracks].sort((a, b) => b.likes + b.views / 20 - (a.likes + a.views / 20))[0] ?? null
  const totalSeconds = tracks.reduce((sum, track) => sum + track.duration, 0)

  return {
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    tracks,
    shelves,
    featuredId: featured?.id ?? null,
    stats: {
      tracks: tracks.length,
      artists: new Set(tracks.map(track => track.artist)).size,
      hours: Math.round((totalSeconds / 3600) * 10) / 10,
    },
    now: new Date().toISOString(),
  }
}

export function trackCover(track: MusicTrack): string {
  return mediaCover(track.coverUrl, null)
}
