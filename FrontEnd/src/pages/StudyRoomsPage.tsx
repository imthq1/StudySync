import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  Clock3,
  Plus,
  RefreshCw,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import { getApiErrorMessage } from '../services/api-client'
import { createStudyRoom, getStudyRooms, joinStudyRoom } from '../services/study-rooms.service'
import type { CreateStudyRoomRequest, StudyRoom } from '../types/study-room'
import '../styles/study-rooms.css'

const initialForm: CreateStudyRoomRequest = {
  name: '',
  topic: '',
  description: '',
  maxMembers: 6,
  focusDurationMinutes: 25,
  breakDurationMinutes: 5,
}

function initials(name: string | null) {
  return (name || 'U').split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
}

function StudyRoomsPage() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<StudyRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState<CreateStudyRoomRequest>(initialForm)
  const [isCreating, setIsCreating] = useState(false)
  const [joiningId, setJoiningId] = useState<number | null>(null)

  async function loadRooms(signal?: AbortSignal) {
    setIsLoading(true)
    setErrorMessage('')
    try {
      setRooms(await getStudyRooms(signal))
    } catch (error) {
      if (!signal?.aborted) setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách phòng học.'))
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void loadRooms(controller.signal)
    return () => controller.abort()
  }, [])

  async function handleOpen(room: StudyRoom) {
    if (room.isMember) {
      navigate(`/study-rooms/${room.id}`)
      return
    }
    setJoiningId(room.id)
    setErrorMessage('')
    try {
      await joinStudyRoom(room.id)
      navigate(`/study-rooms/${room.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể tham gia phòng học này.'))
      setJoiningId(null)
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)
    setErrorMessage('')
    try {
      const room = await createStudyRoom({
        ...form,
        topic: form.topic?.trim() || undefined,
        description: form.description?.trim() || undefined,
        name: form.name.trim(),
      })
      navigate(`/study-rooms/${room.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể tạo phòng học.'))
      setIsCreating(false)
    }
  }

  return (
    <div className="study-app-shell">
      <AppNavbar />
      <StudySidebar />
      <main className="study-rooms-page">
        <section className="rooms-hero">
          <div className="rooms-hero-copy">
            <span className="rooms-eyebrow"><Sparkles size={15} /> Học cùng nhau, tiến xa hơn</span>
            <h1>Không gian tập trung<br /><em>đang chờ bạn.</em></h1>
            <p>Vào một phòng đang hoạt động, đồng bộ Pomodoro và giữ nhịp học cùng cộng đồng.</p>
            <button type="button" className="rooms-primary-button" onClick={() => setIsCreateOpen(true)}>
              <Plus size={18} /> Tạo phòng mới
            </button>
          </div>
          <div className="rooms-hero-orbit" aria-hidden="true">
            <div className="orbit-timer"><span>25</span><small>phút tập trung</small></div>
            <i /><i /><i />
          </div>
        </section>

        <section className="rooms-directory">
          <header>
            <div>
              <span className="live-dot" />
              <div><h2>Phòng đang hoạt động</h2><p>{rooms.length} không gian có thể tham gia</p></div>
            </div>
            <button type="button" className="rooms-refresh" onClick={() => void loadRooms()} disabled={isLoading}>
              <RefreshCw size={16} /> Làm mới
            </button>
          </header>

          {errorMessage && <div className="rooms-alert" role="alert">{errorMessage}</div>}
          {isLoading ? (
            <div className="rooms-card-grid" aria-label="Đang tải phòng học">
              {[0, 1, 2].map((item) => <div className="room-card room-card--skeleton" key={item} />)}
            </div>
          ) : rooms.length === 0 ? (
            <div className="rooms-empty">
              <BookOpenCheck size={34} />
              <h3>Chưa có phòng nào đang mở</h3>
              <p>Hãy tạo không gian đầu tiên và mời mọi người cùng vào guồng học.</p>
              <button type="button" onClick={() => setIsCreateOpen(true)}>Tạo phòng đầu tiên</button>
            </div>
          ) : (
            <div className="rooms-card-grid">
              {rooms.map((room, index) => (
                <article className={`room-card room-card--tone-${index % 4}`} key={room.id}>
                  <div className="room-card-topline"><span>{room.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}</span><small>#{String(room.id).padStart(3, '0')}</small></div>
                  <div className="room-card-icon"><BookOpenCheck size={22} /></div>
                  <p className="room-card-topic">{room.topic || 'Học tập tự do'}</p>
                  <h3>{room.name}</h3>
                  <p className="room-card-description">{room.description || 'Một không gian yên tĩnh để cùng nhau hoàn thành mục tiêu hôm nay.'}</p>
                  <div className="room-card-meta">
                    <span><Clock3 size={15} /> {room.focusDurationMinutes}/{room.breakDurationMinutes} phút</span>
                    <span><UsersRound size={15} /> {room.memberCount}/{room.maxMembers}</span>
                  </div>
                  <footer>
                    <div className="room-owner-chip"><span>{initials(room.owner.fullName)}</span><small>Chủ phòng<br /><strong>{room.owner.fullName || 'Người dùng'}</strong></small></div>
                    <button
                      type="button"
                      onClick={() => void handleOpen(room)}
                      disabled={joiningId === room.id || room.status === 'CLOSED' || (!room.isMember && room.memberCount >= room.maxMembers)}
                    >
                      {joiningId === room.id ? 'Đang vào...' : room.isMember ? 'Mở phòng' : 'Tham gia'} <ArrowRight size={16} />
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {isCreateOpen && (
        <div className="room-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsCreateOpen(false)}>
          <section className="room-create-modal" role="dialog" aria-modal="true" aria-labelledby="create-room-title">
            <header><div><span>Tạo không gian</span><h2 id="create-room-title">Phòng học mới</h2></div><button type="button" onClick={() => setIsCreateOpen(false)} aria-label="Đóng"><X size={20} /></button></header>
            <form onSubmit={handleCreate}>
              <label>Tên phòng<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ví dụ: React Deep Focus" autoFocus /></label>
              <label>Chủ đề<input maxLength={100} value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} placeholder="Bạn đang học gì?" /></label>
              <label>Mô tả<textarea rows={3} maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Mục tiêu của buổi học..." /></label>
              <div className="room-form-row">
                <label>Số thành viên<input type="number" min={2} max={50} value={form.maxMembers} onChange={(event) => setForm({ ...form, maxMembers: Number(event.target.value) })} /></label>
                <label>Focus (phút)<input type="number" min={1} max={120} value={form.focusDurationMinutes} onChange={(event) => setForm({ ...form, focusDurationMinutes: Number(event.target.value) })} /></label>
                <label>Break (phút)<input type="number" min={1} max={60} value={form.breakDurationMinutes} onChange={(event) => setForm({ ...form, breakDurationMinutes: Number(event.target.value) })} /></label>
              </div>
              <button className="rooms-primary-button" type="submit" disabled={isCreating}>{isCreating ? 'Đang tạo...' : 'Tạo và vào phòng'} <ArrowRight size={17} /></button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default StudyRoomsPage
