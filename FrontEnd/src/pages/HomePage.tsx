import { useEffect, useState } from 'react'
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  MessageCircle,
  PenLine,
  Search,
  Sparkles,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import { getApiErrorMessage } from '../services/api-client'
import { FOLLOW_CHANGED_EVENT, getFollowActivityFeed } from '../services/social.service'
import type { PageMetadata } from '../types/post'
import type { FollowActivity } from '../types/social'
import '../styles/home.css'

const PAGE_SIZE = 12
const emptyPage: PageMetadata = { size: PAGE_SIZE, number: 0, totalElements: 0, totalPages: 0 }

function formatActivityTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function HomePage() {
  const [activities, setActivities] = useState<FollowActivity[]>([])
  const [page, setPage] = useState<PageMetadata>(emptyPage)
  const [pageNumber, setPageNumber] = useState(0)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    function refreshFeed() {
      setPageNumber(0)
      setRefreshVersion((version) => version + 1)
    }
    window.addEventListener(FOLLOW_CHANGED_EVENT, refreshFeed)
    return () => window.removeEventListener(FOLLOW_CHANGED_EVENT, refreshFeed)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadFeed() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const result = await getFollowActivityFeed(pageNumber, PAGE_SIZE, controller.signal)
        setActivities(result.content)
        setPage(result.page)
      } catch (error) {
        if (!controller.signal.aborted) {
          setActivities([])
          setPage(emptyPage)
          setErrorMessage(getApiErrorMessage(error, 'Không thể tải dòng hoạt động.'))
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadFeed()
    return () => controller.abort()
  }, [pageNumber, refreshVersion])

  return <div className="study-app-shell">
    <AppNavbar />
    <StudySidebar />
    <main className="social-home-page">
      <div className="social-home-layout">
        <section className="social-feed-column">
          <header className="social-feed-header">
            <div><p>Your learning network</p><h1>Dòng hoạt động</h1><span>Bài viết và trao đổi mới nhất từ những người bạn đang theo dõi.</span></div>
            <Link to="/posts/new"><PenLine size={16} /> Chia sẻ kiến thức</Link>
          </header>

          <div className="social-feed-summary">
            <span><Sparkles size={16} /><strong>{page.totalElements}</strong> hoạt động</span>
            <p>Feed được sắp xếp theo thời gian mới nhất</p>
          </div>

          <div className="social-feed" aria-live="polite">
            {isLoading && Array.from({ length: 4 }, (_, index) => <div className="social-feed-skeleton" key={index} />)}

            {!isLoading && errorMessage && <div className="social-feed-state social-feed-state--error" role="alert"><FileText size={25} /><strong>Không thể tải feed</strong><p>{errorMessage}</p></div>}

            {!isLoading && !errorMessage && activities.length === 0 && <div className="social-feed-state">
              <UserPlus size={28} />
              <strong>Feed của bạn đang trống</strong>
              <p>Dùng thanh tìm kiếm phía trên để tìm người học và theo dõi họ. Hoạt động của họ sẽ xuất hiện tại đây.</p>
            </div>}

            {!isLoading && !errorMessage && activities.map((activity) => {
              const isComment = activity.type === 'COMMENT'
              return <article className="social-activity-card" key={`${activity.type}-${activity.comment?.id ?? activity.post.id}-${activity.occurredAt}`}>
                <header>
                  {activity.actor.avatarUrl ? <img src={activity.actor.avatarUrl} alt="" /> : <span className="social-actor-avatar">{getInitials(activity.actor.fullName)}</span>}
                  <div>
                    <p><strong>{activity.actor.fullName}</strong> {isComment ? activity.comment?.parentId ? 'đã trả lời một bình luận' : 'đã bình luận' : 'đã đăng bài viết mới'}</p>
                    <time>{formatActivityTime(activity.occurredAt)}</time>
                  </div>
                  <span className={`social-activity-type social-activity-type--${activity.type.toLowerCase()}`}>{isComment ? <MessageCircle size={13} /> : <PenLine size={13} />}{isComment ? 'Bình luận' : 'Bài viết'}</span>
                </header>

                <div className="social-activity-content">
                  <Link to={`/posts/${activity.post.id}`}>{activity.post.title}</Link>
                  {!isComment && <p>{activity.post.content.slice(0, 260)}{activity.post.content.length > 260 ? '...' : ''}</p>}
                  {isComment && activity.comment && <blockquote>{activity.comment.content}</blockquote>}
                </div>

                <footer>
                  <span>{activity.actor.reputationPoints} điểm uy tín</span>
                  <Link to={`/posts/${activity.post.id}`}>{isComment ? 'Xem cuộc thảo luận' : 'Đọc bài viết'} <ChevronRight size={14} /></Link>
                </footer>
              </article>
            })}
          </div>

          {!isLoading && !errorMessage && page.totalPages > 1 && <nav className="social-feed-pagination" aria-label="Phân trang dòng hoạt động">
            <button type="button" disabled={page.number === 0} onClick={() => setPageNumber(page.number - 1)}><ChevronLeft size={16} /> Trang trước</button>
            <span>{page.number + 1} / {page.totalPages}</span>
            <button type="button" disabled={page.number >= page.totalPages - 1} onClick={() => setPageNumber(page.number + 1)}>Trang sau <ChevronRight size={16} /></button>
          </nav>}
        </section>

        <aside className="social-home-sidebar">
          <section className="social-discovery-card">
            <span><Search size={18} /></span>
            <h2>Mở rộng mạng lưới học tập</h2>
            <p>Tìm kiếm theo tên hoặc email trên navbar, sau đó theo dõi những người có cùng mục tiêu.</p>
          </section>
          <section className="social-quick-links">
            <h2>Tiếp tục học tập</h2>
            <Link to="/posts"><FileText size={16} /><span><strong>Kho kiến thức</strong><small>Khám phá bài viết mới</small></span></Link>
            <Link to="/study-rooms"><UsersRound size={16} /><span><strong>Phòng học</strong><small>Focus cùng cộng đồng</small></span></Link>
            <Link to="/profile?tab=liked"><Heart size={16} /><span><strong>Bài đã thích</strong><small>Xem lại nội dung quan tâm</small></span></Link>
            <Link to="/profile?tab=saved"><Bookmark size={16} /><span><strong>Bài đã lưu</strong><small>Thư viện cá nhân</small></span></Link>
          </section>
        </aside>
      </div>
    </main>
  </div>
}

export default HomePage
