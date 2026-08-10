export type StudyRoomStatus = 'ACTIVE' | 'CLOSED'
export type TimerMode = 'FOCUS' | 'BREAK'
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED'
export type TimerAction = 'START_FOCUS' | 'START_BREAK' | 'PAUSE' | 'RESET'
export type WebRtcSignalType = 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE' | 'CAMERA_STATE'

export interface RoomUserSummary {
  id: number
  fullName: string | null
  avatarUrl: string | null
}

export interface RoomMessage {
  id: number
  content: string
  sender: RoomUserSummary
  createdAt: string
}

export interface StudyRoomTimerState {
  timerMode: TimerMode
  timerStatus: TimerStatus
  timerEndsAt: string | null
  timerRemainingSeconds: number
  focusDurationMinutes: number
  breakDurationMinutes: number
}

export interface StudyRoom extends StudyRoomTimerState {
  id: number
  name: string
  topic: string | null
  description: string | null
  status: StudyRoomStatus
  maxMembers: number
  memberCount: number
  isMember: boolean
  isOwner: boolean
  owner: RoomUserSummary
  members: RoomUserSummary[]
  messages: RoomMessage[]
  createdAt: string
}

export interface CreateStudyRoomRequest {
  name: string
  topic?: string
  description?: string
  maxMembers: number
  focusDurationMinutes: number
  breakDurationMinutes: number
}

export interface StudyRoomWebRtcSignal {
  signalType: WebRtcSignalType
  fromUserId: number
  targetUserId: number | null
  sdp: string | null
  candidate: string | null
  sdpMid: string | null
  sdpMLineIndex: number | null
  usernameFragment: string | null
  cameraEnabled: boolean | null
}

export type StudyRoomWebRtcSignalRequest = Omit<StudyRoomWebRtcSignal, 'fromUserId'>

export type StudyRoomEvent =
  | { type: 'MEMBER_JOINED'; roomId: number; occurredAt: string; data: RoomUserSummary }
  | { type: 'MEMBER_LEFT'; roomId: number; occurredAt: string; data: RoomUserSummary }
  | { type: 'CHAT_MESSAGE'; roomId: number; occurredAt: string; data: RoomMessage }
  | { type: 'TIMER_UPDATED'; roomId: number; occurredAt: string; data: StudyRoomTimerState }
  | { type: 'WEBRTC_SIGNAL'; roomId: number; occurredAt: string; data: StudyRoomWebRtcSignal }
  | { type: 'ROOM_CLOSED'; roomId: number; occurredAt: string; data: unknown }
