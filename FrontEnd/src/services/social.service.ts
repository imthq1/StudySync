import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'
import type { FollowActivityPage, UserSearchPage } from '../types/social'
import type { ProfileUser } from '../types/profile'

export const FOLLOW_CHANGED_EVENT = 'studysync.follow-changed'

export async function searchUsers(query: string, signal?: AbortSignal): Promise<UserSearchPage> {
  const response = await apiClient.get<ApiResponse<UserSearchPage>>('/api/v1/users/search', {
    params: { q: query, page: 0, size: 8 },
    signal,
  })
  return response.data.data
}

export async function followUser(userId: number): Promise<void> {
  await apiClient.post(`/api/v1/follows/${userId}`)
  window.dispatchEvent(new Event(FOLLOW_CHANGED_EVENT))
}

export async function unfollowUser(userId: number): Promise<void> {
  await apiClient.delete(`/api/v1/follows/${userId}`)
  window.dispatchEvent(new Event(FOLLOW_CHANGED_EVENT))
}

export async function getFollowActivityFeed(page: number, size: number, signal?: AbortSignal): Promise<FollowActivityPage> {
  const response = await apiClient.get<ApiResponse<FollowActivityPage>>('/api/v1/follows/feed', {
    params: { page, size },
    signal,
  })
  return response.data.data
}

export async function getFollowers(userId: number, signal?: AbortSignal): Promise<ProfileUser[]> {
  const response = await apiClient.get<ApiResponse<ProfileUser[]>>(`/api/v1/follows/${userId}/followers`, { signal })
  return response.data.data
}

export async function getFollowing(userId: number, signal?: AbortSignal): Promise<ProfileUser[]> {
  const response = await apiClient.get<ApiResponse<ProfileUser[]>>(`/api/v1/follows/${userId}/following`, { signal })
  return response.data.data
}
