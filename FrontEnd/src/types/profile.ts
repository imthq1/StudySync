import type { PageMetadata } from './post'

export interface ProfileUser {
  id: number
  email: string
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  learningGoals: string | null
  reputationPoints: number
  createdAt: string
}

export interface UserProfile {
  user: ProfileUser
  followerCount: number
  followingCount: number
  isFollowing: boolean
}

export interface DailyContribution {
  date: string
  count: number
}

export interface ContributionSummary {
  total: number
  postCount: number
  commentCount: number
  activeDays: number
  days: DailyContribution[]
}

export interface CommentActivity {
  id: number
  content: string
  parentId: number | null
  postId: number
  postTitle: string
  createdAt: string
}

export interface CommentActivityPage {
  content: CommentActivity[]
  page: PageMetadata
}
