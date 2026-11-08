import Profiles from '../../tables/profiles.table'
import { generatePersona } from './personas'

export async function growFleet(ctx: app.Ctx, count = 10): Promise<Array<typeof Profiles.T>> {
  const existing = await Profiles.findAll(ctx, { where: { kind: 'bot' }, limit: 200, order: [{ createdAt: 'asc' }] })
  const start = existing.length
  const created: Array<typeof Profiles.T> = []
  const limit = Math.min(20, Math.max(1, Math.round(count)))
  for (let index = 0; index < limit; index += 1) {
    const draft = generatePersona(start + index)
    let handle = draft.handle
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const taken = await Profiles.findOneBy(ctx, { handle })
      if (!taken) break
      handle = `${draft.handle}${index + 2}`
    }
    const bot = await Profiles.create(ctx, {
      handle,
      name: draft.name,
      age: draft.age,
      city: draft.city,
      bio: draft.bio,
      kind: 'bot',
      voiceTone: draft.voiceTone,
      commentLength: draft.commentLength,
      slang: draft.slang,
      emoji: draft.emoji,
      argumentative: draft.argumentative,
      politicalLeaning: draft.politicalLeaning,
      gender: draft.gender,
      typoRate: draft.typoRate,
      interests: draft.interests,
      interestVector: draft.interestVector,
      chronotype: draft.chronotype,
      avatarHue: draft.avatarHue,
      avatarAccent: draft.avatarAccent,
      enabled: true,
      isSynthetic: true,
      lastActionAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 3600000),
      nextActionAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 60000),
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      postsCount: 0,
      externalSubscribers: 0,
    })
    created.push(bot)
  }
  return created
}
