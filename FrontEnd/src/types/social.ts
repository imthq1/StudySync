import type { PageMetadata, PostContentType } from './post'

export interface UserSearchResult {
  id: number
  fullName: string
  avatarUrl: string | null
  bio: string | null
  reputationPoints: number
  isFollowing: boolean
}

export interface UserSearchPage {
  content: UserSearchResult[]
  page: PageMetadata
}

export interface FollowActivity {
  type: 'POST' | 'COMMENT'
  occurredAt: string
  actor: {
    id: number
    fullName: string
    avatarUrl: string | null
    reputationPoints: number
  }
  post: {
    id: number
    title: string
    content: string
    contentType: PostContentType
    fileUrl: string | null
  }
  comment: {
    id: number
    content: string
    parentId: number | null
  } | null
}

export interface FollowActivityPage {
  content: FollowActivity[]
  page: PageMetadata
}
