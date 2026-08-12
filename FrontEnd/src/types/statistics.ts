import type { PostContentType } from './post'

export interface StatisticsPeriodMetrics {
  posts: number
  comments: number
  contributions: number
  likesReceived: number
  bookmarksReceived: number
  followersGained: number
}

export interface PersonalStatistics {
  generatedAt: string
  allTime: {
    posts: number
    comments: number
    contributions: number
    activeRoomMemberships: number
  }
  comparison30Days: {
    current: StatisticsPeriodMetrics
    previous: StatisticsPeriodMetrics
    delta: StatisticsPeriodMetrics
  }
  received: {
    likes: number
    bookmarks: number
  }
  social: {
    followers: number
    following: number
  }
  contentTypeDistribution: Array<{
    contentType: PostContentType
    count: number
    percentage: number
  }>
  topPosts: Array<{
    id: number
    title: string
    contentType: PostContentType
    createdAt: string
    likeCount: number
    bookmarkCount: number
    commentCount: number
    engagementCount: number
  }>
}
