import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'
import type { CommentActivityPage, ContributionSummary, UserProfile } from '../types/profile'

export async function getMyProfile(signal?: AbortSignal): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/api/v1/users/me/profile', { signal })
  return response.data.data
}

export async function getUserProfile(userId: number, signal?: AbortSignal): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>(`/api/v1/users/${userId}/profile`, { signal })
  return response.data.data
}

export async function getMyContributions(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<ContributionSummary> {
  const response = await apiClient.get<ApiResponse<ContributionSummary>>('/api/v1/users/me/contributions', {
    params: { from, to, zone: 'Asia/Ho_Chi_Minh' },
    signal,
  })
  return response.data.data
}

export async function getMyCommentActivity(
  page: number,
  size: number,
  signal?: AbortSignal,
): Promise<CommentActivityPage> {
  const response = await apiClient.get<ApiResponse<CommentActivityPage>>('/api/v1/comments/me', {
    params: { page, size, sort: 'createdAt,desc' },
    signal,
  })
  return response.data.data
}
