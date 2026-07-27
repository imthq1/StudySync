import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Link2,
  ListFilter,
  MessageCircle,
  Pin,
  Plus,
  Search,
  Smile,
  Sparkles,
  Users,
} from 'lucide-react'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import '../styles/home.css'

const studyRooms = [
  {
    name: 'Linh Trần',
    initials: 'LT',
    subject: 'React Architecture',
    status: 'Hoàn thiện feature authentication',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 48,
    reactions: 23,
  },
  {
    name: 'Khánh An',
    initials: 'KA',
    subject: 'IELTS Writing',
    status: 'Essay task 2 · Deep focus',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 52,
    reactions: 18,
  },
  {
    name: 'Minh Phạm',
    initials: 'MP',
    subject: 'Data Structures',
    status: 'Ôn tập graph algorithms',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 36,
    reactions: 14,
  },
  {
    name: 'Thảo Nguyên',
    initials: 'TN',
    subject: 'UI/UX Design',
    status: 'Design system exploration',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 41,
    reactions: 31,
  },
  {
    name: 'Hoàng Nam',
    initials: 'HN',
    subject: 'Node.js',
    status: 'Xây dựng REST API',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 57,
    reactions: 27,
  },
  {
    name: 'Mai Anh',
    initials: 'MA',
    subject: 'Medical Science',
    status: 'Reviewing clinical notes',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 44,
    reactions: 16,
  },
  {
    name: 'Tuấn Kiệt',
    initials: 'TK',
    subject: 'System Design',
    status: 'Distributed systems · Chapter 4',
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 50,
    reactions: 38,
  },
  {
    name: 'Gia Hân',
    initials: 'GH',
    subject: 'Digital Marketing',
    status: 'Lên kế hoạch nội dung tháng 8',
    image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 39,
    reactions: 21,
  },
  {
    name: 'Đức Anh',
    initials: 'ĐA',
    subject: 'Cyber Security',
    status: 'Preparing for certification',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 46,
    reactions: 19,
  },
  {
    name: 'Ngọc Hà',
    initials: 'NH',
    subject: 'Business English',
    status: 'Presentation practice',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 34,
    reactions: 25,
  },
  {
    name: 'Quốc Bảo',
    initials: 'QB',
    subject: 'Machine Learning',
    status: 'Training first image model',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 55,
    reactions: 42,
  },
  {
    name: 'Yến Nhi',
    initials: 'YN',
    subject: 'Advanced Mathematics',
    status: 'Linear algebra problem set',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    focusMinutes: 43,
    reactions: 29,
  },
]

function HomePage() {
  return (
    <div className="study-app-shell">
      <AppNavbar />
      <StudySidebar />

      <main className="study-dashboard">
        <section className="study-toolbar" aria-label="Bộ điều khiển phòng học">
          <div className="study-session-card">
            <span className="live-indicator" aria-hidden="true" />
            <div>
              <strong>Phòng học cộng đồng</strong>
              <span>259 người đang tập trung</span>
            </div>
          </div>

          <div className="page-control" aria-label="Phân trang">
            <button type="button" aria-label="Trang trước"><ChevronLeft size={19} /></button>
            <strong>1 / 12</strong>
            <button type="button" aria-label="Trang tiếp theo"><ChevronRight size={19} /></button>
          </div>

          <div className="view-controls">
            <button className="filter-button" type="button"><ListFilter size={17} /> Tìm bạn học</button>
            <div className="view-switch" aria-label="Chế độ hiển thị">
              <button className="is-active" type="button"><Grid2X2 size={16} /> Lưới</button>
              <button type="button">Không gian</button>
            </div>
            <button className="pin-button" type="button"><Pin size={16} /> Ghim <span>0</span></button>
            <button className="members-button" type="button"><Users size={17} /> 259</button>
          </div>
        </section>

        <section className="room-grid" aria-label="Danh sách người đang học">
          {studyRooms.map((room, index) => (
            <article className="study-room-card" key={room.name}>
              <img src={room.image} alt={`${room.name} đang học ${room.subject}`} loading={index < 4 ? 'eager' : 'lazy'} />
              <div className="room-shade" />
              <button className="room-pin" type="button" aria-label={`Ghim phòng của ${room.name}`}><Pin size={16} /></button>
              <span className="focus-score"><Sparkles size={13} /> {room.focusMinutes}</span>

              <div className="room-owner">
                <span className="room-owner-avatar">{room.initials}</span>
                <div><strong>{room.name}</strong><span>{room.subject}</span></div>
                <button type="button" aria-label={`Kết nối với ${room.name}`}><Link2 size={15} /></button>
              </div>

              <footer className="room-footer">
                <p>{room.status}</p>
                <div className="room-reactions">
                  <span><Users size={14} /> {room.reactions}</span>
                  <button type="button" aria-label="Gửi tin nhắn"><MessageCircle size={15} /></button>
                  <button type="button" aria-label="Gửi biểu cảm"><Smile size={16} /></button>
                </div>
              </footer>
            </article>
          ))}
        </section>

        <button className="mobile-find-button" type="button"><Search size={18} /> Tìm bạn học</button>
        <button className="mobile-create-room" type="button" aria-label="Tạo phòng học"><Plus size={22} /></button>
      </main>
    </div>
  )
}

export default HomePage
