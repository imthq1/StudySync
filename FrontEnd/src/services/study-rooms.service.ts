import type { ApiResponse } from '../types/auth'
import type {
  CreateStudyRoomRequest,
  RoomMessage,
  StudyRoom,
} from '../types/study-room'
import apiClient from './api-client'

export async function getStudyRooms(signal?: AbortSignal): Promise<StudyRoom[]> {
  const response = await apiClient.get<ApiResponse<StudyRoom[]>>('/api/v1/study-rooms', { signal })
  return response.data.data
}

export async function createStudyRoom(payload: CreateStudyRoomRequest): Promise<StudyRoom> {
  const response = await apiClient.post<ApiResponse<StudyRoom>>('/api/v1/study-rooms', payload)
  return response.data.data
}

export async function getStudyRoom(id: number, signal?: AbortSignal): Promise<StudyRoom> {
  const response = await apiClient.get<ApiResponse<StudyRoom>>(`/api/v1/study-rooms/${id}`, { signal })
  return response.data.data
}

export async function joinStudyRoom(id: number): Promise<StudyRoom> {
  const response = await apiClient.post<ApiResponse<StudyRoom>>(`/api/v1/study-rooms/${id}/join`)
  return response.data.data
}

export async function leaveStudyRoom(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/study-rooms/${id}/leave`)
}

export async function closeStudyRoom(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/study-rooms/${id}`)
}

export async function getStudyRoomMessages(id: number, signal?: AbortSignal): Promise<RoomMessage[]> {
  const response = await apiClient.get<ApiResponse<RoomMessage[]>>(
    `/api/v1/study-rooms/${id}/messages`,
    { signal },
  )
  return response.data.data
}
