import { Client, type IMessage } from '@stomp/stompjs'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Coffee,
  LogOut,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  UsersRound,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import timerCompleteSoundUrl from '../assets/universfield-new-notification-039-493472.mp3'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import RoomVideoGrid from '../components/study-rooms/RoomVideoGrid'
import { useStudyRoomWebRtc } from '../hooks/useStudyRoomWebRtc'
import { getApiErrorMessage } from '../services/api-client'
import { getAuthSession } from '../services/auth-session'
import {
  closeStudyRoom,
  getStudyRoom,
  getStudyRoomMessages,
  joinStudyRoom,
  leaveStudyRoom,
} from '../services/study-rooms.service'
import type {
  RoomMessage,
  RoomUserSummary,
  StudyRoom,
  StudyRoomEvent,
  TimerAction,
} from '../types/study-room'
import '../styles/study-rooms.css'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

type TimerSnapshot = {
  mode: StudyRoom['timerMode']
  remainingSeconds: number
  status: StudyRoom['timerStatus']
}

function getInitials(name: string | null) {
  return (name || 'U').split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
}

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds))
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

function formatMessageTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function mergeMessage(messages: RoomMessage[], incoming: RoomMessage) {
  return messages.some((message) => message.id === incoming.id) ? messages : [...messages, incoming]
}

function upsertMember(members: RoomUserSummary[], incoming: RoomUserSummary) {
  return members.some((member) => member.id === incoming.id) ? members : [...members, incoming]
}

function StudyRoomPage() {
  const navigate = useNavigate()
  const { roomId: roomIdParam } = useParams()
  const roomId = Number(roomIdParam)
  const currentUserId = getAuthSession()?.user.id
  const clientRef = useRef<Client | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const timerAudioRef = useRef<HTMLAudioElement | null>(null)
  const previousTimerRef = useRef<TimerSnapshot | null>(null)
  const [room, setRoom] = useState<StudyRoom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const [messageDraft, setMessageDraft] = useState('')
  const [now, setNow] = useState(Date.now())
  const [isActionPending, setIsActionPending] = useState(false)
  const camera = useStudyRoomWebRtc({
    currentUserId,
    isConnected: connectionStatus === 'connected',
    members: room?.members ?? [],
    sendSignal: (signal) => publish(`/app/study-rooms/${roomId}/webrtc`, signal),
  })
  const handleWebRtcSignal = camera.handleSignal
  const removeCameraMember = camera.removeMember
  const shutdownCameraMedia = camera.shutdownMedia

  useEffect(() => {
    const audio = new Audio(timerCompleteSoundUrl)
    audio.preload = 'auto'
    timerAudioRef.current = audio

    return () => {
      audio.pause()
      timerAudioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!Number.isInteger(roomId) || roomId <= 0) {
      setErrorMessage('Mã phòng học không hợp lệ.')
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    async function loadRoom() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        let detail = await getStudyRoom(roomId, controller.signal)
        if (!detail.isMember && detail.status !== 'CLOSED') detail = await joinStudyRoom(roomId)
        const messages = await getStudyRoomMessages(roomId, controller.signal)
        if (!controller.signal.aborted) setRoom({ ...detail, messages })
      } catch (error) {
        if (!controller.signal.aborted) setErrorMessage(getApiErrorMessage(error, 'Không thể mở phòng học này.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }
    void loadRoom()
    return () => controller.abort()
  }, [roomId])

  useEffect(() => {
    if (!room?.isMember || room.status === 'CLOSED') return

    const token = getAuthSession()?.access_token
    if (!token) {
      setConnectionStatus('disconnected')
      return
    }

    let disposed = false
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
    const socketUrl = `${apiUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws`
    const handleMessage = (frame: IMessage) => {
      try {
        const event = JSON.parse(frame.body) as StudyRoomEvent
        if (event.roomId !== roomId) return
        if (event.type === 'WEBRTC_SIGNAL') {
          void handleWebRtcSignal(event.data)
          return
        }
        if (event.type === 'MEMBER_LEFT') removeCameraMember(event.data.id)
        if (event.type === 'ROOM_CLOSED') shutdownCameraMedia()
        setRoom((current) => {
          if (!current) return current
          switch (event.type) {
            case 'CHAT_MESSAGE':
              return { ...current, messages: mergeMessage(current.messages, event.data) }
            case 'MEMBER_JOINED': {
              const members = upsertMember(current.members, event.data)
              return { ...current, members, memberCount: members.length }
            }
            case 'MEMBER_LEFT': {
              const members = current.members.filter((member) => member.id !== event.data.id)
              return { ...current, members, memberCount: members.length }
            }
            case 'TIMER_UPDATED':
              return { ...current, ...event.data }
            case 'ROOM_CLOSED':
              return { ...current, status: 'CLOSED', timerStatus: 'IDLE' }
          }
        })
      } catch {
        setErrorMessage('Nhận được dữ liệu thời gian thực không hợp lệ.')
      }
    }

    const client = new Client({
      brokerURL: socketUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (disposed) return
        setConnectionStatus('connected')
        client.subscribe(`/topic/study-rooms/${roomId}`, handleMessage)
      },
      onWebSocketClose: () => !disposed && setConnectionStatus('disconnected'),
      onStompError: () => !disposed && setConnectionStatus('disconnected'),
    })
    clientRef.current = client
    setConnectionStatus('connecting')
    client.activate()

    return () => {
      disposed = true
      if (clientRef.current === client) clientRef.current = null
      void client.deactivate()
    }
  }, [handleWebRtcSignal, removeCameraMember, room?.isMember, room?.status, roomId, shutdownCameraMedia])

  useEffect(() => {
    if (room?.timerStatus !== 'RUNNING') return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [room?.timerStatus, room?.timerEndsAt])

  useEffect(() => {
    if (!room) {
      previousTimerRef.current = null
      return
    }

    const endTime = room.timerEndsAt ? new Date(room.timerEndsAt).getTime() : Number.NaN
    const remainingSeconds = room.timerStatus === 'RUNNING' && Number.isFinite(endTime)
      ? Math.max(0, (endTime - now) / 1000)
      : Math.max(0, room.timerRemainingSeconds)
    const previousTimer = previousTimerRef.current

    previousTimerRef.current = { mode: room.timerMode, remainingSeconds, status: room.timerStatus }

    if (previousTimer?.status === 'RUNNING' && previousTimer.remainingSeconds > 0 && remainingSeconds === 0) {
      const audio = timerAudioRef.current
      if (audio) {
        audio.currentTime = 0
        void audio.play().catch(() => undefined)
      }

      if (room.isOwner && room.status !== 'CLOSED' && previousTimer.mode === 'FOCUS') {
        publish(`/app/study-rooms/${roomId}/timer`, { action: 'START_BREAK' satisfies TimerAction })
      }
    }
  }, [now, room, roomId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [room?.messages.length])

  useEffect(() => {
    if (room?.status === 'CLOSED') shutdownCameraMedia()
  }, [room?.status, shutdownCameraMedia])

  function publish(destination: string, body: object) {
    const client = clientRef.current
    if (!client?.connected) {
      setErrorMessage('Kết nối thời gian thực chưa sẵn sàng.')
      return false
    }
    client.publish({ destination, body: JSON.stringify(body) })
    return true
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = messageDraft.trim()
    if (!content || room?.status === 'CLOSED') return
    if (publish(`/app/study-rooms/${roomId}/messages`, { content })) setMessageDraft('')
  }

  function handleTimer(action: TimerAction) {
    publish(`/app/study-rooms/${roomId}/timer`, { action })
  }

  async function handleLeave() {
    if (!window.confirm('Rời khỏi phòng học này?')) return
    setIsActionPending(true)
    try {
      await leaveStudyRoom(roomId)
      navigate('/study-rooms')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể rời phòng.'))
      setIsActionPending(false)
    }
  }

  async function handleClose() {
    if (!window.confirm('Đóng phòng cho tất cả thành viên? Hành động này không thể hoàn tác.')) return
    setIsActionPending(true)
    try {
      await closeStudyRoom(roomId)
      setRoom((current) => current ? { ...current, status: 'CLOSED', timerStatus: 'IDLE' } : current)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể đóng phòng.'))
    } finally {
      setIsActionPending(false)
    }
  }

  if (isLoading) {
    return <div className="study-app-shell"><AppNavbar /><StudySidebar /><main className="room-loading"><span /><p>Đang chuẩn bị không gian học...</p></main></div>
  }

  if (!room) {
    return <div className="study-app-shell"><AppNavbar /><StudySidebar /><main className="room-fatal"><h1>Không thể vào phòng</h1><p>{errorMessage}</p><Link to="/study-rooms"><ArrowLeft size={17} /> Trở lại danh sách</Link></main></div>
  }

  const configuredSeconds = (room.timerMode === 'BREAK' ? room.breakDurationMinutes : room.focusDurationMinutes) * 60
  const parsedEndTime = room.timerEndsAt ? new Date(room.timerEndsAt).getTime() : Number.NaN
  const remainingSeconds = room.timerStatus === 'RUNNING' && Number.isFinite(parsedEndTime)
    ? Math.max(0, (parsedEndTime - now) / 1000)
    : Math.max(0, room.timerRemainingSeconds)
  const progress = configuredSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / configuredSeconds)) : 0
  const isClosed = room.status === 'CLOSED'
  const hasActiveVideo = Boolean(camera.localStream) || camera.cameraUserIds.length > 0

  return (
    <div className="study-app-shell">
      <AppNavbar />
      <StudySidebar />
      <main className="study-room-page">
        <header className="room-page-header">
          <div className="room-heading">
            <Link to="/study-rooms" aria-label="Trở lại danh sách"><ArrowLeft size={19} /></Link>
            <div><span>{room.topic || 'Học tập tự do'}</span><h1>{room.name}</h1></div>
          </div>
          <div className={`connection-pill connection-pill--${connectionStatus}`}>
            {connectionStatus === 'connected' ? <Wifi size={15} /> : <WifiOff size={15} />}
            {connectionStatus === 'connected' ? 'Đã đồng bộ' : connectionStatus === 'connecting' ? 'Đang kết nối' : 'Mất kết nối'}
          </div>
        </header>

        {errorMessage && <div className="rooms-alert room-page-alert" role="alert">{errorMessage}<button type="button" onClick={() => setErrorMessage('')}>Đóng</button></div>}
        {isClosed && <div className="room-closed-banner"><strong>Phòng đã đóng</strong><span>Phiên học đã kết thúc. Tin nhắn và điều khiển hiện đã bị khóa.</span></div>}

        <div className={`room-workspace${hasActiveVideo ? ' room-workspace--with-video' : ''}`}>
          <section className={`focus-stage focus-stage--${room.timerMode.toLowerCase()}${hasActiveVideo ? ' focus-stage--with-video' : ''}`}>
            <div className="focus-stage-label">{room.timerMode === 'FOCUS' ? 'Deep focus' : 'Nghỉ phục hồi'}<span>{room.timerStatus === 'RUNNING' ? 'Đang chạy' : room.timerStatus === 'PAUSED' ? 'Tạm dừng' : 'Sẵn sàng'}</span></div>
            <RoomVideoGrid
              cameraError={camera.cameraError}
              cameraStatus={camera.cameraStatus}
              cameraUserIds={camera.cameraUserIds}
              currentUserId={currentUserId}
              disabled={isClosed || connectionStatus !== 'connected'}
              localStream={camera.localStream}
              members={room.members}
              remoteStreams={camera.remoteStreams}
              onToggleCamera={camera.toggleCamera}
            />
            <div className="focus-timer-panel">
              <div className="pomodoro-dial" style={{ background: `conic-gradient(var(--room-accent) ${progress * 360}deg, rgba(255,255,255,.09) 0deg)` }}>
                <div><small>{room.timerMode === 'FOCUS' ? 'TẬP TRUNG' : 'NGHỈ NGƠI'}</small><strong>{formatClock(remainingSeconds)}</strong><span>Chu kỳ {room.focusDurationMinutes} / {room.breakDurationMinutes}</span></div>
              </div>
              <div className="focus-timer-actions">
                {room.isOwner ? (
                  <div className="timer-controls" aria-label="Điều khiển Pomodoro">
                    <button type="button" onClick={() => handleTimer('START_FOCUS')} disabled={isClosed}><Play size={17} fill="currentColor" /> Focus</button>
                    <button type="button" onClick={() => handleTimer('START_BREAK')} disabled={isClosed}><Coffee size={17} /> Break</button>
                    <button type="button" onClick={() => handleTimer('PAUSE')} disabled={isClosed || room.timerStatus !== 'RUNNING'}><Pause size={17} /> Dừng</button>
                    <button type="button" onClick={() => handleTimer('RESET')} disabled={isClosed}><RotateCcw size={17} /> Reset</button>
                  </div>
                ) : <p className="timer-follow-note"><ShieldCheck size={16} /> Pomodoro được điều khiển bởi chủ phòng</p>}
                {room.description && <p className="focus-room-description">{room.description}</p>}
              </div>
            </div>
          </section>

          <aside className="room-members-panel">
            <header><div><UsersRound size={18} /><strong>Thành viên</strong></div><span>{room.memberCount}/{room.maxMembers}</span></header>
            <div className="member-list">
              {room.members.map((member) => (
                <div className="member-row" key={member.id}>
                  {member.avatarUrl ? <img src={member.avatarUrl} alt="" /> : <span className="member-avatar">{getInitials(member.fullName)}</span>}
                  <div><strong>{member.fullName || 'Người dùng'}</strong><small>{member.id === room.owner.id ? 'Chủ phòng' : 'Đang học'}</small></div>
                  <i aria-label="Đang trực tuyến" />
                </div>
              ))}
            </div>
            <div className="room-danger-actions">
              {room.isOwner ? <button type="button" onClick={() => void handleClose()} disabled={isActionPending || isClosed}><Trash2 size={16} /> Đóng phòng</button> : <button type="button" onClick={() => void handleLeave()} disabled={isActionPending || isClosed}><LogOut size={16} /> Rời phòng</button>}
            </div>
          </aside>

          <section className="room-chat-panel">
            <header><div><MessageCircle size={18} /><strong>Trò chuyện</strong></div><span>{room.messages.length} tin nhắn</span></header>
            <div className="chat-messages" aria-live="polite">
              {room.messages.length === 0 && <div className="chat-empty"><MessageCircle size={27} /><p>Bắt đầu cuộc trò chuyện với nhóm học.</p></div>}
              {room.messages.map((message) => {
                const isOwn = message.sender.id === currentUserId
                return <div className={`chat-message${isOwn ? ' chat-message--own' : ''}`} key={message.id}>
                  <span className="chat-avatar">{getInitials(message.sender.fullName)}</span>
                  <div><p><strong>{isOwn ? 'Bạn' : message.sender.fullName || 'Người dùng'}</strong><time>{formatMessageTime(message.createdAt)}</time></p><span>{message.content}</span></div>
                </div>
              })}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-composer" onSubmit={handleSendMessage}>
              <input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} maxLength={1000} placeholder={isClosed ? 'Phòng đã đóng' : 'Nhắn cho cả phòng...'} disabled={isClosed} aria-label="Nội dung tin nhắn" />
              <button type="submit" disabled={isClosed || !messageDraft.trim() || connectionStatus !== 'connected'} aria-label="Gửi tin nhắn"><Send size={17} /></button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

export default StudyRoomPage
