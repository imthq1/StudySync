import { useEffect, useRef } from 'react'
import { Camera, LoaderCircle, Video, VideoOff } from 'lucide-react'
import type { RoomUserSummary } from '../../types/study-room'

type RoomVideoGridProps = {
  cameraError: string
  cameraStatus: 'idle' | 'requesting' | 'enabled' | 'denied' | 'unavailable' | 'error'
  cameraUserIds: number[]
  currentUserId?: number
  disabled: boolean
  localStream: MediaStream | null
  members: RoomUserSummary[]
  remoteStreams: Record<number, MediaStream>
  onToggleCamera: () => void
}

function VideoStream({ muted = false, stream }: { muted?: boolean; stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    void video.play().catch(() => undefined)
    return () => {
      video.srcObject = null
    }
  }, [stream])

  return <video ref={videoRef} autoPlay muted={muted} playsInline />
}

export default function RoomVideoGrid({
  cameraError,
  cameraStatus,
  cameraUserIds,
  currentUserId,
  disabled,
  localStream,
  members,
  remoteStreams,
  onToggleCamera,
}: RoomVideoGridProps) {
  const remoteUserIds = [...new Set([
    ...cameraUserIds,
    ...Object.keys(remoteStreams).map(Number),
  ])].filter((userId) => userId !== currentUserId)
  const hasVideoTiles = Boolean(localStream) || remoteUserIds.length > 0
  const tileCount = remoteUserIds.length + (localStream ? 1 : 0)
  const gridDensityClass = tileCount >= 7
    ? ' room-video-grid--dense'
    : tileCount >= 4 ? ' room-video-grid--medium' : ''

  function findMember(userId: number) {
    return members.find((member) => member.id === userId)
  }

  return (
    <div className={`room-camera${hasVideoTiles ? ' room-camera--active' : ''}`}>
      <div className="room-camera-toolbar">
        <span><Camera size={15} /> Camera phòng học {tileCount > 0 && <small>{tileCount} đang bật</small>}</span>
        <button
          type="button"
          className={localStream ? 'camera-toggle camera-toggle--active' : 'camera-toggle'}
          onClick={onToggleCamera}
          disabled={disabled || cameraStatus === 'requesting'}
        >
          {cameraStatus === 'requesting' ? <LoaderCircle className="camera-spinner" size={15} /> : localStream ? <VideoOff size={15} /> : <Video size={15} />}
          {cameraStatus === 'requesting' ? 'Đang mở...' : localStream ? 'Tắt camera' : 'Mở camera'}
        </button>
      </div>

      {cameraError && <p className="room-camera-error" role="alert">{cameraError}</p>}

      {hasVideoTiles && <div className={`room-video-grid${gridDensityClass}`}>
        {localStream && <article className="room-video-tile room-video-tile--local">
          <VideoStream stream={localStream} muted />
          <span>Bạn</span>
        </article>}
        {remoteUserIds.map((userId) => {
          const member = findMember(userId)
          const stream = remoteStreams[userId]
          return <article className="room-video-tile" key={userId}>
            {stream ? <VideoStream stream={stream} /> : <div className="room-video-waiting"><LoaderCircle className="camera-spinner" size={20} /><small>Đang kết nối</small></div>}
            <span>{member?.fullName || 'Thành viên'}</span>
          </article>
        })}
      </div>}
    </div>
  )
}
