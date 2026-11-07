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
  avatarUrl: string | null
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
  coverUrl: string | null
  mediaStatus: 'ready' | 'processing' | 'failed'
  mimeType: string | null
  sizeBytes: number
  source: 'upload' | 'seed' | 'link'
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
  flowLabel: string
  discovery: boolean
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
  externalSubscribers: number
  subscriberSource: string | null
  followingCount: number
  friendsCount: number
  postsCount: number
  chronotype: 'lark' | 'nightowl' | 'steady'
  coverUrl: string | null
  coverPosition: number
  tagline: string
  stickers: string[]
  links: string[]
  profileTheme: 'graphite' | 'lime' | 'violet' | 'ember' | 'ice'
  accentHue: number
  pinnedPostId: string | null
  canEdit: boolean
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
  isSynthetic: boolean
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

export interface ReportRow {
  id: string
  targetType: 'post' | 'comment' | 'profile'
  targetId: string
  targetLabel: string
  reason: string
  note: string
  reporterName: string
  ago: string
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
  reports: ReportRow[]
  subscriberTransfers: SubscriberTransferRow[]
  jobsLagSec: number
  fallbackRate: number
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
  artifact: PostCard | null
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
  collabs: CollabCard[]
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

export interface ManagerMessageView {
  id: string
  role: 'user' | 'bot'
  text: string
  intent: string | null
  createdAt: string
}

export interface ManagerReply {
  text: string
  intent: string
  suggestions: string[]
  escalate: boolean
  createdAt: string
}

export interface VideoHubData {
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  videos: PostCard[]
  featured: PostCard | null
  continueWatching: Array<{ post: PostCard; progress: number }>
  subscriptions: PostCard[]
  topics: TopicRef[]
  stats: { videos: number; hoursWatched: number; creators: number }
  now: string
}

export interface WatchData extends PostPageData {
  relatedVideos: PostCard[]
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  url: string
  coverUrl: string | null
  duration: number
  hue: number
  author: AuthorCard
  likes: number
  views: number
  ago: string
  topics: TopicRef[]
}

export interface MusicShelf {
  id: string
  title: string
  subtitle: string
  ids: string[]
}

export interface MusicHubData {
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  tracks: MusicTrack[]
  shelves: MusicShelf[]
  featuredId: string | null
  stats: { tracks: number; artists: number; hours: number }
  now: string
}

export interface SubscriberTransferRow {
  id: string
  profileId: string
  profileName: string
  platform: string
  channelUrl: string
  screenshotUrl: string | null
  claimedCount: number
  approvedCount: number
  status: 'pending' | 'approved' | 'rejected'
  note: string
  ago: string
}

export interface ProfileSettingsData {
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  profile: ProfileCard
  posts: Array<{ id: string; title: string; kind: PostKind; coverUrl: string | null }>
  transfers: SubscriberTransferRow[]
  reserved: string[]
  now: string
}

export interface AnalyticsPostRow {
  id: string
  title: string
  kind: PostKind
  views: number
  likes: number
  comments: number
  watchHours: number
  hype: number
  coverUrl: string | null
  ago: string
  trend: 'hit' | 'steady' | 'miss'
}

export interface AnalyticsDaily {
  label: string
  views: number
}

export interface ProfileAnalyticsData {
  profile: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  totals: { views: number; likes: number; comments: number; watchHours: number; followers: number; posts: number }
  posts: AnalyticsPostRow[]
  audience: Array<{ author: AuthorCard; views: number }>
  daily: AnalyticsDaily[]
  topTopics: TopicRef[]
  hitRate: number
  now: string
}

export interface MessageItem {
  id: string
  text: string
  isMine: boolean
  ago: string
  author: AuthorCard
}

export interface ConversationSummary {
  peer: AuthorCard
  lastText: string
  ago: string
  unread: number
}

export interface InboxData {
  viewer: AuthorCard
  viewerRole: 'owner' | 'admin' | 'member'
  conversations: ConversationSummary[]
  activePeer: AuthorCard | null
  messages: MessageItem[]
  now: string
}
