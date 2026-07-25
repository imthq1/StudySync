import { ArrowRight, Bookmark, Clock3, Flame, MessageCircle, MoreHorizontal, Plus, Users } from 'lucide-react'
import AppNavbar from '../components/layout/AppNavbar'
import '../styles/home.css'

const studyTopics = ['React', 'TypeScript', 'UI/UX', 'IELTS']

const posts = [
  {
    author: 'Linh Trần',
    initials: 'LT',
    time: '12 phút trước',
    title: '5 cách tổ chức component React để dự án dễ mở rộng',
    excerpt: 'Mình tổng hợp cách phân tách feature, shared component và quản lý state để codebase không trở nên phức tạp theo thời gian.',
    tags: ['React', 'Architecture'],
    likes: 48,
    comments: 12,
  },
  {
    author: 'Khánh An',
    initials: 'KA',
    time: '1 giờ trước',
    title: 'Lộ trình tự học IELTS Writing từ 5.5 lên 7.0',
    excerpt: 'Một kế hoạch 12 tuần có thể áp dụng ngay, kèm bộ tài liệu và cách mình nhận feedback mỗi ngày.',
    tags: ['IELTS', 'Writing'],
    likes: 91,
    comments: 24,
  },
]

function HomePage() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="home-main">
        <section className="welcome-section" aria-labelledby="welcome-title">
          <div>
            <p className="section-eyebrow"><Flame size={17} aria-hidden="true" /> Thứ Hai, 20 tháng 7</p>
            <h1 id="welcome-title">Chào buổi sáng, Minh.</h1>
            <p>Tiếp tục xây dựng nhịp học tập của bạn, từng bước một.</p>
          </div>
          <button className="primary-action" type="button"><Plus size={18} aria-hidden="true" /> Chia sẻ kiến thức</button>
        </section>

        <section className="stat-grid" aria-label="Thống kê học tập">
          <article className="stat-card"><span className="stat-icon stat-icon--indigo"><Clock3 size={20} /></span><div><strong>12.5 giờ</strong><span>Thời gian học tuần này</span></div><em>+18%</em></article>
          <article className="stat-card"><span className="stat-icon stat-icon--cyan"><Flame size={20} /></span><div><strong>7 ngày</strong><span>Chuỗi học tập</span></div><em>Đỉnh mới</em></article>
          <article className="stat-card"><span className="stat-icon stat-icon--purple"><Users size={20} /></span><div><strong>24</strong><span>Bạn đồng hành</span></div><em>+3 tuần này</em></article>
        </section>

        <div className="home-layout">
          <section className="feed-section" id="discover" aria-labelledby="feed-title">
            <div className="section-heading"><div><p className="section-eyebrow">Dành cho bạn</p><h2 id="feed-title">Khám phá từ cộng đồng</h2></div><button className="text-action" type="button">Xem tất cả <ArrowRight size={16} /></button></div>
            <div className="topic-list">{studyTopics.map((topic) => <button type="button" key={topic}>#{topic}</button>)}</div>
            <div className="post-list">
              {posts.map((post) => (
                <article className="post-card" key={post.title}>
                  <header className="post-author"><span className="post-avatar">{post.initials}</span><div><strong>{post.author}</strong><span>{post.time}</span></div><button type="button" aria-label={`Tùy chọn bài viết của ${post.author}`}><MoreHorizontal size={20} /></button></header>
                  <h3>{post.title}</h3><p>{post.excerpt}</p>
                  <div className="post-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                  <footer className="post-meta"><span><Flame size={16} /> {post.likes} lượt thích</span><span><MessageCircle size={16} /> {post.comments} bình luận</span><button type="button" aria-label="Lưu bài viết"><Bookmark size={18} /></button></footer>
                </article>
              ))}
            </div>
          </section>

          <aside className="home-sidebar">
            <section className="goal-card"><div className="goal-card-header"><span>Tiến độ tuần này</span><strong>72%</strong></div><h2>React TypeScript</h2><div className="goal-progress" role="progressbar" aria-label="Tiến độ React TypeScript" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}><span /></div><p><Clock3 size={15} /> Còn 3 giờ để đạt mục tiêu</p></section>
            <section className="rooms-card" id="study-rooms"><div className="section-heading"><div><p className="section-eyebrow">Đang diễn ra</p><h2>Phòng học</h2></div><button type="button" className="icon-link" aria-label="Xem thêm phòng học"><ArrowRight size={17} /></button></div><article className="room-item"><span className="room-icon">⌘</span><div><strong>Deep Focus Room</strong><span><i /> 18 đang học</span></div></article><article className="room-item"><span className="room-icon room-icon--cyan">Aa</span><div><strong>IELTS Writing Sprint</strong><span><i /> 12 đang học</span></div></article><button className="secondary-action" type="button">Khám phá phòng học</button></section>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default HomePage
