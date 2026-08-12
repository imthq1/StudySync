import apiClient from './api-client'
import type { ApiResponse } from '../types/auth'
import type { PersonalStatistics } from '../types/statistics'

export async function getPersonalStatistics(signal?: AbortSignal): Promise<PersonalStatistics> {
  const response = await apiClient.get<ApiResponse<PersonalStatistics>>('/api/v1/users/me/statistics', { signal })
  return response.data.data
}
