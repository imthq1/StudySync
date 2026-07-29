import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'
import type { CreatePostRequest, Post } from '../types/post'

export async function createPost(payload: CreatePostRequest): Promise<Post> {
  const response = await apiClient.post<ApiResponse<Post>>('/api/v1/posts', payload)
  return response.data.data
}
