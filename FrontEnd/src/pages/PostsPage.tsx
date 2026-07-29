import { useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  Eye,
  FileText,
  Flame,
  Link2,
  MessageCircle,
  Paperclip,
  PenLine,
  Plus,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import '../styles/posts.css'

type ContentType = 'post' | 'question' | 'document'
type ContentFilter = 'all' | ContentType

const filters: { label: string; value: ContentFilter }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Bài viết', value: 'post' },
  { label: 'Câu hỏi', value: 'question' },
  { label: 'Tài liệu', value: 'document' },
]

const topics = ['JavaScript', 'ReactJS', 'Python', 'DSA', 'Backend', 'Frontend', 'Database']

const contentItems = [
  {
    id: 1,
    type: 'post' as const,
    author: 'Minh Tú',
    initials: 'MT',
    time: '2 giờ trước',
    title: 'Hiểu sâu về Async/Await trong JavaScript',
    tags: ['JavaScript'],
    views: 48,
    comments: 12,
  },
  {
    id: 2,
    type: 'question' as const,
    author: 'Linh Đan',
    initials: 'LĐ',
    time: '4 giờ trước',
    title: 'Tại sao useEffect chạy 2 lần trong React 18?',
    tags: ['ReactJS'],
    views: 31,
    comments: 9,
  },
  {
    id: 3,
    type: 'document' as const,
    author: 'Hoàng Nam',
    initials: 'HN',
    time: 'hôm qua',
    title: '[PDF] Giáo trình Data Structures & Algorithms',
    tags: ['DSA'],
    views: 124,
    comments: 34,
  },
  {
    id: 4,
    type: 'post' as const,
    author: 'Phú Đại',
    initials: 'PĐ',
    time: 'hôm qua',
    title: 'Clean Architecture trong Node.js: Từ lý thuyết đến thực hành',
    tags: ['Backend'],
    views: 76,
    comments: 21,
  },
]

const roomItems = [
  { title: 'LeetCode Daily #88', topic: 'Array & Hashing', progress: 62, members: '5/8', color: 'blue' },
  { title: 'React Deep Dive', topic: 'Hooks & Performance', progress: 48, members: '3/6', color: 'pink' },
  { title: 'SQL Practice Zone', topic: 'Window Functions', progress: 70, members: '7/10', color: 'green' },
]

const suggestedPeople = [
  { name: 'An Nhiên', initials: 'AN', role: 'Frontend Dev', tags: ['React', 'TypeScript'] },
  { name: 'Khoa Lê', initials: 'KL', role: 'Data Science', tags: ['Python', 'ML'] },
  { name: 'Thảo Vy', initials: 'TV', role: 'Backend Dev', tags: ['Node.js', 'Database'] },
]

const typeMeta: Record<ContentType, { label: string; icon: typeof PenLine }> = {
  post: { label: 'Bài viết', icon: PenLine },
  question: { label: 'Câu hỏi', icon: MessageCircle },
  document: { label: 'Tài liệu', icon: FileText },
}

function PostsPage() {
  const [activeFilter, setActiveFilter] = useState<ContentFilter>('all')
  const visibleItems = activeFilter === 'all'
    ? contentItems
    : contentItems.filter((item) => item.type === activeFilter)

  return (
    <div className="posts-app-shell">
      <AppNavbar />
      <StudySidebar />

      <main className="posts-page">
        <div className="posts-layout">
          <section className="knowledge-feed" aria-labelledby="knowledge-title">
            <h1 id="knowledge-title" className="sr-only">Kho kiến thức StudySync</h1>

            <div className="content-tabs" role="tablist" aria-label="Loại nội dung">
              {filters.map((filter) => (
                <button
                  className={activeFilter === filter.value ? 'is-active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  key={filter.value}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="knowledge-topics" aria-label="Chủ đề nổi bật">
              {topics.map((topic) => <button type="button" key={topic}>{topic}</button>)}
            </div>

            <div className="knowledge-list">
              {visibleItems.map((item) => {
                const meta = typeMeta[item.type]
                const TypeIcon = meta.icon

                return (
                  <article className={`knowledge-card knowledge-card--${item.type}`} key={item.id}>
                    <span className="knowledge-avatar">{item.initials}</span>
                    <div className="knowledge-card-content">
                      <div className="knowledge-labels">
                        <span className="content-type"><TypeIcon size={12} /> {meta.label}</span>
                        {item.tags.map((tag) => <span className="content-tag" key={tag}>{tag}</span>)}
                      </div>
                      <h2>{item.title}</h2>
                      <p>{item.author} · {item.time}</p>
                    </div>
                    <div className="knowledge-stats">
                      <span><Eye size={13} /> {item.views}</span>
                      <span><MessageCircle size={13} /> {item.comments}</span>
                    </div>
                  </article>
                )
              })}
            </div>

            <section className="share-knowledge-card">
              <div>
                <h2>Chia sẻ kiến thức của bạn</h2>
                <p>Viết bài, đặt câu hỏi hoặc upload tài liệu.</p>
              </div>
              <div>
                <Link className="create-content-button" to="/posts/new"><Plus size={16} /> Tạo bài</Link>
                <button className="upload-content-button" type="button"><Paperclip size={15} /> Upload</button>
              </div>
            </section>
          </section>

          <aside className="posts-sidebar">
            <section className="sidebar-panel study-rooms-panel">
              <header className="panel-heading">
                <h2><Flame size={17} /> Study Rooms</h2>
                <button type="button">Xem tất cả <ArrowRight size={13} /></button>
              </header>

              <div className="compact-room-list">
                {roomItems.map((room) => (
                  <article className={`compact-room compact-room--${room.color}`} key={room.title}>
                    <div className="compact-room-title"><strong>{room.title}</strong><span><i /> LIVE</span></div>
                    <p>{room.topic}</p>
                    <div className="compact-progress"><span style={{ width: `${room.progress}%` }} /></div>
                    <small>{room.members}</small>
                    <button type="button">{room.color === 'green' ? 'Xem phòng' : 'Tham gia ngay'}</button>
                  </article>
                ))}
              </div>

              <button className="new-room-button" type="button"><Plus size={14} /> Tạo phòng học mới</button>
            </section>

            <section className="sidebar-panel people-panel">
              <header className="panel-heading">
                <h2><Users size={17} /> Bạn cùng tiến</h2>
                <button type="button">Tìm thêm <ArrowRight size={13} /></button>
              </header>

              <div className="suggested-list">
                {suggestedPeople.map((person) => (
                  <article className="suggested-person" key={person.name}>
                    <span className="suggested-avatar">{person.initials}<i /></span>
                    <div>
                      <strong>{person.name}</strong>
                      <small>{person.role}</small>
                      <p>{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</p>
                    </div>
                    <button type="button"><Link2 size={12} /> Kết nối</button>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <button className="posts-mobile-filter" type="button">Bộ lọc <ChevronDown size={16} /></button>
      </main>
    </div>
  )
}

export default PostsPage
