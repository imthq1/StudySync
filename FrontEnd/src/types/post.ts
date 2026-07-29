export type PostContentType = 'BLOG'

export interface CreatePostRequest {
  title: string
  content: string
  contentType: PostContentType
  tagNames: string[]
}

export interface PostAuthor {
  id: number
  email: string
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  learningGoals: string | null
  reputationPoints: number
  createdAt: string
}

export interface Tag {
  id: number
  name: string
}

export type PostTag = Tag

export interface Post {
  id: number
  title: string
  content: string
  contentType: PostContentType
  fileUrl: string | null
  author: PostAuthor
  tags: PostTag[]
  likeCount: number
  commentCount: number
  likedByCurrentUser: boolean
  bookmarkedByCurrentUser: boolean
  createdAt: string
  updatedAt: string
}
