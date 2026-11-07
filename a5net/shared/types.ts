// @shared

export type PostKind = 'text' | 'video' | 'music' | 'collab'
export type VoiceTone = 'sardonic' | 'enthusiastic' | 'analytical' | 'melancholic' | 'deadpan' | 'warm'
export type ReactionValue = 'like' | 'dislike'

export interface TopicRef {
  id: string
  label: string
  hue: number
}

export interface AuthorCard {
  id: string
  handle: string
  name: string
  city: string
  avatarHue: number
  avatarAccent: number
  initials: string
  voiceTone: VoiceTone
}

export interface PostCard {
  id: string
  kind: PostKind
  title: string
  body: string
  topics: TopicRef[]
  mediaUrl: string | null
  coverHue: number
  durationSec: number
  hypeScore: number
  hypeLevel: number
  likes: number
  dislikes: number
  commentsCount: number
  views: number
  createdAt: string
  author: AuthorCard
  viewerReaction: ReactionValue | null
  collabId: string | null
  ago: string
}

export interface CommentItem {
  id: string
  text: string
  likes: number
  createdAt: string
  ago: string
  author: AuthorCard
  isMine: boolean
}

export interface ProfileCard extends AuthorCard {
  age: number
  bio: string
  interests: TopicRef[]
  followersCount: number
  followingCount: number
  friendsCount: number
  postsCount: number
  chronotype: 'lark' | 'nightowl' | 'steady'
  isFollowing: boolean
  isFriend: boolean
  requestPending: boolean
  isSelf: boolean
  lastActionAt: string | null
}

export interface CollabCard {
  id: string
  title: string
  brief: string
  status: 'open' | 'active' | 'done'
  participants: AuthorCard[]
  initiator: AuthorCard
  createdAt: string
  ago: string
  postId: string | null
  joined: boolean
}

export interface TrendItem {
  topic: TopicRef
  posts: number
  hype: number
}

export interface PlatformStats {
  humans: number
  bots: number
  posts: number
  comments: number
  hoursWatched: number
  collabs: number
}

export interface FleetSettings {
  enabled: boolean
  aggressiveness: number
  intervalMin: number
  intervalMax: number
  maxBotsPerTick: number
}

export interface ProviderInfo {
  id: 'openrouter' | 'gemini' | 'groq'
  label: string
  model: string
  configured: boolean
  hint: string
}

export interface LlmSettings {
  order: Array<'openrouter' | 'gemini' | 'groq'>
  providers: ProviderInfo[]
  lastProvider: string
}

export interface BotRow extends AuthorCard {
  kind: 'human' | 'bot'
  enabled: boolean
  interests: TopicRef[]
  friendsCount: number
  postsCount: number
  lastActionAt: string | null
  nextActionAt: string | null
  statusLabel: string
}

export interface RunRow {
  id: string
  botName: string
  botHue: number
  action: string
  content: string
  provider: string
  latencyMs: number
  status: string
  ago: string
}

export interface GraphNode {
  id: string
  name: string
  hue: number
  degree: number
}

export interface GraphEdge {
  a: string
  b: string
}

export interface ControlData {
  fleet: FleetSettings
  stats: PlatformStats
  bots: BotRow[]
  logs: RunRow[]
  nodes: GraphNode[]
  edges: GraphEdge[]
  llm: LlmSettings
  seeded: boolean
  onlineNow: number
  actions24h: number
  avgLatency: number
  now: string
}

export interface FeedData {
  items: PostCard[]
  trends: TrendItem[]
  suggestions: AuthorCard[]
  stats: PlatformStats
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  now: string
  hasMore: boolean
  collabs: CollabCard[]
  fleetEnabled: boolean
  topicOptions: TopicRef[]
}

export interface PostPageData {
  post: PostCard
  comments: CommentItem[]
  author: ProfileCard
  related: PostCard[]
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  now: string
  collab: CollabCard | null
}

export interface ProfilePageData {
  profile: ProfileCard
  posts: PostCard[]
  friends: AuthorCard[]
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  now: string
  incomingRequest: boolean
}

export interface InviteRow {
  id: string
  code: string
  note: string
  maxUses: number
  uses: number
  active: boolean
  createdAt: string
  ago: string
  link: string
  copyable: boolean
}

export interface InvitesData {
  invites: InviteRow[]
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  canCreate: boolean
}

export interface LandingData {
  stats: PlatformStats
  topics: string[]
  signedIn: boolean
  isMember: boolean
  displayName: string
  heroUrl: string
  hasInviteParam: boolean
  codeParam: string
}

export interface InviteResult {
  ok: boolean
  error?: string
  redirectTo?: string
}
