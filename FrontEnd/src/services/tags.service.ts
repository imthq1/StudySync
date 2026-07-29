import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'
import type { Tag } from '../types/post'

export async function getTags(signal?: AbortSignal): Promise<Tag[]> {
  const response = await apiClient.get<ApiResponse<Tag[]>>('/api/v1/tags', { signal })
  return response.data.data
}
