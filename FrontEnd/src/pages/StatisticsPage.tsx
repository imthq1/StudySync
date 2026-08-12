import { useEffect, useState } from 'react'
import {
  BarChart3,
  Bookmark,
  FileText,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import { getApiErrorMessage } from '../services/api-client'
import { getMyContributions } from '../services/profile.service'
import { getPersonalStatistics } from '../services/statistics.service'
import type { ContributionSummary } from '../types/profile'
import type { PostContentType } from '../types/post'
import type { PersonalStatistics } from '../types/statistics'
import '../styles/statistics.css'

const contentTypeMeta: Record<PostContentType, { label: string; color: string }> = {
  BLOG: { label: 'Bài viết', color: '#4f46e5' },
  QUESTION: { label: 'Câu hỏi', color: '#f59e0b' },
  DISCUSSION: { label: 'Thảo luận', color: '#14b8a6' },
  NOTE: { label: 'Ghi chú', color: '#ec4899' },
}

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date)
}

function Trend({ value }: { value: number }) {
  const isPositive = value >= 0
  return <span className={isPositive ? 'statistics-trend statistics-trend--up' : 'statistics-trend statistics-trend--down'}>
    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{value > 0 ? '+' : ''}{value}
  </span>
}

function ComparisonRow({ current, delta, icon: Icon, label }: { current: number; delta: number; icon: typeof FileText; label: string }) {
  return <div className="statistics-comparison-row"><span><Icon size={15} /></span><div><strong>{label}</strong><small>30 ngày gần nhất</small></div><b>{current}</b><Trend value={delta} /></div>
}

function buildDonutGradient(statistics: PersonalStatistics) {
  let cursor = 0
  const segments = statistics.contentTypeDistribution.map((item) => {
    const start = cursor
    cursor += item.percentage
    return `${contentTypeMeta[item.contentType].color} ${start}% ${cursor}%`
  })
  return statistics.allTime.posts === 0 ? '#edf0f5 0 100%' : segments.join(', ')
}

function StatisticsPage() {
  const [statistics, setStatistics] = useState<PersonalStatistics | null>(null)
  const [contributions, setContributions] = useState<ContributionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const today = new Date()
    const from = new Date(today)
    from.setDate(from.getDate() - 29)

    async function loadStatistics() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const [statisticsResult, contributionResult] = await Promise.all([
          getPersonalStatistics(controller.signal),
          getMyContributions(toDateInput(from), toDateInput(today), controller.signal),
        ])
        setStatistics(statisticsResult)
        setContributions(contributionResult)
      } catch (error) {
        if (!controller.signal.aborted) setErrorMessage(getApiErrorMessage(error, 'Không thể tải thống kê cá nhân.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadStatistics()
    return () => controller.abort()
  }, [])

  if (isLoading) {
    return <div className="statistics-app-shell"><AppNavbar /><StudySidebar /><main className="statistics-page"><div className="statistics-hero-skeleton" /><div className="statistics-grid-skeleton" /></main></div>
  }

  if (!statistics || !contributions) {
    return <div className="statistics-app-shell"><AppNavbar /><StudySidebar /><main className="statistics-page"><div className="statistics-fatal" role="alert"><BarChart3 size={28} /><strong>Không thể mở thống kê</strong><p>{errorMessage}</p></div></main></div>
  }

  const current = statistics.comparison30Days.current
  const delta = statistics.comparison30Days.delta
  const maxContribution = Math.max(1, ...contributions.days.map((day) => day.count))
  const bestContent = [...statistics.contentTypeDistribution].sort((a, b) => b.count - a.count)[0]
  const engagementTotal = statistics.received.likes + statistics.received.bookmarks

  return <div className="statistics-app-shell">
    <AppNavbar />
    <StudySidebar />
    <main className="statistics-page">
      <header className="statistics-hero">
        <div><p>Personal analytics</p><h1>Nhịp học tập của bạn</h1><span>Dữ liệu được cập nhật vào {formatDate(statistics.generatedAt)}</span></div>
        <div className="statistics-score"><Sparkles size={19} /><span><strong>{statistics.allTime.contributions}</strong><small>tổng đóng góp</small></span></div>
      </header>

      <section className="statistics-kpis" aria-label="Chỉ số tổng quan">
        <article><span className="statistics-kpi-icon statistics-kpi-icon--violet"><FileText size={19} /></span><div><small>Bài đã đăng</small><strong>{statistics.allTime.posts}</strong><p><Trend value={delta.posts} /> so với kỳ trước</p></div></article>
        <article><span className="statistics-kpi-icon statistics-kpi-icon--teal"><MessageCircle size={19} /></span><div><small>Bình luận</small><strong>{statistics.allTime.comments}</strong><p><Trend value={delta.comments} /> so với kỳ trước</p></div></article>
        <article><span className="statistics-kpi-icon statistics-kpi-icon--rose"><Heart size={19} /></span><div><small>Lượt thích nhận được</small><strong>{statistics.received.likes}</strong><p><Trend value={delta.likesReceived} /> trong 30 ngày</p></div></article>
        <article><span className="statistics-kpi-icon statistics-kpi-icon--amber"><Users size={19} /></span><div><small>Người theo dõi</small><strong>{statistics.social.followers}</strong><p><Trend value={delta.followersGained} /> follower mới</p></div></article>
      </section>

      <div className="statistics-main-grid">
        <section className="statistics-card statistics-activity-chart">
          <header><div><BarChart3 size={18} /><h2>Nhịp đóng góp 30 ngày</h2></div><span>{current.contributions} hoạt động</span></header>
          <div className="statistics-bars" aria-label="Biểu đồ đóng góp 30 ngày">
            {contributions.days.map((day, index) => <div className="statistics-bar-column" key={day.date} title={`${day.count} đóng góp - ${formatDate(day.date)}`}>
              <span><i style={{ height: `${Math.max(day.count > 0 ? 8 : 3, day.count / maxContribution * 100)}%` }} /></span>
              {(index % 5 === 0 || index === contributions.days.length - 1) && <small>{new Date(`${day.date}T00:00:00`).getDate()}</small>}
            </div>)}
          </div>
          <footer><span>30 ngày trước</span><strong>{contributions.activeDays} ngày có hoạt động</strong><span>Hôm nay</span></footer>
        </section>

        <section className="statistics-card statistics-comparison">
          <header><div><TrendingUp size={18} /><h2>So với 30 ngày trước</h2></div></header>
          <ComparisonRow current={current.posts} delta={delta.posts} icon={FileText} label="Bài viết" />
          <ComparisonRow current={current.comments} delta={delta.comments} icon={MessageCircle} label="Bình luận" />
          <ComparisonRow current={current.likesReceived} delta={delta.likesReceived} icon={Heart} label="Like nhận được" />
          <ComparisonRow current={current.bookmarksReceived} delta={delta.bookmarksReceived} icon={Bookmark} label="Lượt lưu nhận được" />
          <ComparisonRow current={current.followersGained} delta={delta.followersGained} icon={Users} label="Follower mới" />
        </section>

        <section className="statistics-card statistics-distribution">
          <header><div><Sparkles size={18} /><h2>Phân bổ nội dung</h2></div></header>
          <div className="statistics-donut-wrap">
            <div className="statistics-donut" style={{ background: `conic-gradient(${buildDonutGradient(statistics)})` }}><span><strong>{statistics.allTime.posts}</strong><small>bài viết</small></span></div>
            <div className="statistics-legend">{statistics.contentTypeDistribution.map((item) => <div key={item.contentType}><i style={{ background: contentTypeMeta[item.contentType].color }} /><span>{contentTypeMeta[item.contentType].label}</span><strong>{item.count}</strong><small>{Math.round(item.percentage)}%</small></div>)}</div>
          </div>
        </section>

        <section className="statistics-card statistics-insights">
          <header><div><Trophy size={18} /><h2>Insight cá nhân</h2></div></header>
          <article><span>01</span><div><strong>Thế mạnh nội dung</strong><p>{bestContent?.count ? `${contentTypeMeta[bestContent.contentType].label} là loại nội dung bạn chia sẻ nhiều nhất, chiếm ${Math.round(bestContent.percentage)}%.` : 'Hãy đăng bài đầu tiên để bắt đầu phân tích thế mạnh nội dung.'}</p></div></article>
          <article><span>02</span><div><strong>Nhịp hoạt động</strong><p>{delta.contributions >= 0 ? `Bạn tăng ${delta.contributions} đóng góp so với 30 ngày trước.` : `Bạn giảm ${Math.abs(delta.contributions)} đóng góp so với 30 ngày trước. Hãy đặt một mục tiêu nhỏ cho tuần này.`}</p></div></article>
          <article><span>03</span><div><strong>Tác động cộng đồng</strong><p>Nội dung của bạn hiện nhận được {engagementTotal} lượt thích và lưu, cùng {statistics.social.followers} người theo dõi.</p></div></article>
          <article><span>04</span><div><strong>Không gian học tập</strong><p>Bạn hiện là thành viên của {statistics.allTime.activeRoomMemberships} phòng học đang được lưu trong hệ thống.</p></div></article>
        </section>
      </div>

      <section className="statistics-card statistics-top-posts">
        <header><div><Trophy size={18} /><h2>Bài viết nổi bật</h2></div><Link to="/profile?tab=posts">Xem tất cả</Link></header>
        {statistics.topPosts.length === 0 ? <div className="statistics-empty"><FileText size={24} /><strong>Chưa có bài viết để xếp hạng</strong></div> : <div className="statistics-ranking">
          {statistics.topPosts.map((post, index) => <article key={post.id}><b>{String(index + 1).padStart(2, '0')}</b><div><span>{contentTypeMeta[post.contentType].label}</span><Link to={`/posts/${post.id}`}>{post.title}</Link><small>{formatDate(post.createdAt)}</small></div><p><span><Heart size={12} />{post.likeCount}</span><span><MessageCircle size={12} />{post.commentCount}</span><span><Bookmark size={12} />{post.bookmarkCount}</span></p><strong>{post.engagementCount}</strong></article>)}
        </div>}
      </section>

      <section className="statistics-focus-note"><UsersRound size={19} /><div><strong>Về thống kê Focus</strong><p>Timer phòng học hiện chưa lưu lịch sử từng phiên, vì vậy trang này chỉ hiển thị dữ liệu có thể kiểm chứng. Khi bổ sung session history, biểu đồ thời gian Focus và streak sẽ được tích hợp tại đây.</p></div></section>
    </main>
  </div>
}

export default StatisticsPage
