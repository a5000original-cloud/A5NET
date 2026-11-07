import type Profiles from '../../tables/profiles.table'
import type { PersonaDraft } from './personas'

export function personaFromProfile(profile: typeof Profiles.T): PersonaDraft {
  return {
    handle: profile.handle,
    name: profile.name,
    age: profile.age,
    city: profile.city,
    bio: profile.bio,
    voiceTone: profile.voiceTone,
    commentLength: profile.commentLength,
    slang: profile.slang,
    emoji: profile.emoji,
    argumentative: profile.argumentative,
    politicalLeaning: profile.politicalLeaning,
    interests: profile.interests,
    interestVector: profile.interestVector,
    chronotype: profile.chronotype,
    avatarHue: profile.avatarHue,
    avatarAccent: profile.avatarAccent,
  }
}
