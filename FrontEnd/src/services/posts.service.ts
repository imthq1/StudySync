import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'
import type { CreatePostRequest, ListPostsParams, Post, PostPage } from '../types/post'

export async function createPost(payload: CreatePostRequest): Promise<Post> {
  const response = await apiClient.post<ApiResponse<Post>>('/api/v1/posts', payload)
  return response.data.data
}

export async function getPosts(params: ListPostsParams, signal?: AbortSignal): Promise<PostPage> {
  const response = await apiClient.get<ApiResponse<PostPage>>('/api/v1/posts', {
    params,
    signal,
  })

  return response.data.data
}

export async function getPostById(id: number, signal?: AbortSignal): Promise<Post> {
  const response = await apiClient.get<ApiResponse<Post>>(`/api/v1/posts/${id}`, { signal })
  return response.data.data
}
