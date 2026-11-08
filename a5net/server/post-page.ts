import Profiles from '../tables/profiles.table'
import Posts from '../tables/posts.table'
import Reactions from '../tables/reactions.table'
import Collabs from '../tables/collabs.table'
import type { PostPageData } from '../shared/types'
import { getViewerSocial, toAuthorCard } from './social'
import { buildCollabs, buildProfileCard } from './feed'
import { findRelatedPosts, listComments, toPostCard } from './post-data'
import { getEmojiSummary } from './emoji'

export async function loadPostPage(
  ctx: app.Ctx,
  postId: string,
  viewer: typeof Profiles.T,
  role: 'owner' | 'admin' | 'member',
): Promise<PostPageData | null> {
  const post = await Posts.findById(ctx, postId)
  if (!post) return null
  if (post.visibility !== 'visible' && role === 'member') return null
  const authorProfile = await Profiles.findById(ctx, post.authorId)
  if (!authorProfile) return null

  const [viewerSocial, authorSocial, comments, related, reaction, collabs, emoji] = await Promise.all([
    getViewerSocial(ctx, viewer.id),
    getViewerSocial(ctx, post.authorId),
    listComments(ctx, post.id, viewer.id),
    findRelatedPosts(ctx, post, viewer.id),
    Reactions.findOneBy(ctx, { postId: post.id, profileId: viewer.id }),
    Collabs.findAll(ctx, { limit: 50 }),
    getEmojiSummary(ctx, [post.id], viewer.id),
  ])

  const postCard = toPostCard(post, toAuthorCard(authorProfile), reaction?.value ?? null, Date.now(), false, emoji.counts.get(post.id) ?? {}, emoji.viewer.get(post.id) ?? null)
  const collabRow = collabs.find(row => row.id === post.collabId)
  const collab = collabRow
    ? (await buildCollabs(ctx, viewer.id)).find(item => item.id === collabRow.id) ?? null
    : null

  return {
    post: postCard,
    comments,
    author: buildProfileCard(authorProfile, viewer, authorSocial, viewerSocial),
    related,
    viewer: toAuthorCard(viewer),
    viewerRole: role,
    now: new Date().toISOString(),
    collab,
  }
}
