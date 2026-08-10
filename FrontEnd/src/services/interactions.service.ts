import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'

export async function likePost(postId: number): Promise<void> {
  await apiClient.post<ApiResponse<null>>(`/api/v1/posts/${postId}/like`)
}

export async function unlikePost(postId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/api/v1/posts/${postId}/like`)
}

export async function bookmarkPost(postId: number): Promise<void> {
  await apiClient.post<ApiResponse<null>>(`/api/v1/posts/${postId}/bookmark`)
}

export async function removePostBookmark(postId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/api/v1/posts/${postId}/bookmark`)
}
