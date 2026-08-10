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

async function getPersonalPosts(path: string, page: number, size: number, signal?: AbortSignal): Promise<PostPage> {
  const response = await apiClient.get<ApiResponse<PostPage>>(path, {
    params: { page, size, sort: 'createdAt,desc' },
    signal,
  })
  return response.data.data
}

export function getMyPosts(page: number, size: number, signal?: AbortSignal) {
  return getPersonalPosts('/api/v1/posts/me', page, size, signal)
}

export function getLikedPosts(page: number, size: number, signal?: AbortSignal) {
  return getPersonalPosts('/api/v1/posts/liked', page, size, signal)
}

export function getBookmarkedPosts(page: number, size: number, signal?: AbortSignal) {
  return getPersonalPosts('/api/v1/posts/bookmarked', page, size, signal)
}
