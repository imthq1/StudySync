import type { PostAuthor } from './post'

export interface CreateCommentRequest {
  content: string
  parentId: number | null
}

export interface UpdateCommentRequest {
  content: string
}

export interface Comment {
  id: number
  content: string
  author: PostAuthor
  parentId: number | null
  replies: Comment[]
  createdAt: string
}
