import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from '../types/comment'

export async function getComments(postId: number, signal?: AbortSignal): Promise<Comment[]> {
  const response = await apiClient.get<ApiResponse<Comment[]>>(
    `/api/v1/posts/${postId}/comments`,
    { signal },
  )

  return response.data.data
}

export async function createComment(
  postId: number,
  payload: CreateCommentRequest,
): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/api/v1/posts/${postId}/comments`,
    payload,
  )

  return response.data.data
}

export async function updateComment(
  commentId: number,
  payload: UpdateCommentRequest,
): Promise<Comment> {
  const response = await apiClient.put<ApiResponse<Comment>>(
    `/api/v1/comments/${commentId}`,
    payload,
  )

  return response.data.data
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/api/v1/comments/${commentId}`)
}
