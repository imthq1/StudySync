import { useEffect, useState } from 'react'
import {
  Bookmark,
  CalendarDays,
  FileText,
  Heart,
  MessageCircle,
  PenLine,
  Settings,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import FollowListModal from '../components/profile/FollowListModal'
import { getApiErrorMessage } from '../services/api-client'
import { getBookmarkedPosts, getLikedPosts, getMyPosts } from '../services/posts.service'
import { getMyCommentActivity, getMyContributions, getMyProfile } from '../services/profile.service'
import type { PageMetadata, Post, PostPage } from '../types/post'
import type { CommentActivity, ContributionSummary, UserProfile } from '../types/profile'
import '../styles/profile.css'

type ProfileTab = 'overview' | 'posts' | 'liked' | 'saved'

type ActivityItem =
  | { id: string; type: 'POST'; occurredAt: string; post: Post }
  | { id: string; type: 'COMMENT'; occurredAt: string; comment: CommentActivity }

const PAGE_SIZE = 10
const emptyPage: PageMetadata = { size: PAGE_SIZE, number: 0, totalElements: 0, totalPages: 0 }

const tabItems: Array<{ id: ProfileTab; label: string; icon: typeof FileText }> = [
  { id: 'overview', label: 'Tổng quan', icon: Sparkles },
  { id: 'posts', label: 'Bài đã đăng', icon: FileText },
  { id: 'liked', label: 'Đã thích', icon: Heart },
  { id: 'saved', label: 'Đã lưu', icon: Bookmark },
]

function toDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date)
}

function getInitials(name: string | null, email: string) {
  return (name || email).split(/[\s@]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function ContributionCalendar({ contribution }: { contribution: ContributionSummary }) {
  const firstDate = contribution.days[0]?.date
  const leadingCells = firstDate ? new Date(`${firstDate}T00:00:00`).getDay() : 0

  return <section className="profile-contributions">
    <header>
      <div><CalendarDays size={18} /><h2>{contribution.total} đóng góp trong 365 ngày</h2></div>
      <span>{contribution.activeDays} ngày hoạt động</span>
    </header>
    <div className="contribution-scroll">
      <div className="contribution-grid" aria-label="Lịch sử đóng góp 365 ngày">
        {Array.from({ length: leadingCells }, (_, index) => <i className="contribution-cell contribution-cell--empty" key={`empty-${index}`} />)}
        {contribution.days.map((day) => {
          const level = day.count === 0 ? 0 : Math.min(4, day.count)
          return <span
            className={`contribution-cell contribution-cell--${level}`}
            title={`${day.count} đóng góp vào ${formatDate(day.date)}`}
            aria-label={`${day.count} đóng góp vào ${formatDate(day.date)}`}
            key={day.date}
          />
        })}
      </div>
    </div>
    <footer><span>Ít</span>{[0, 1, 2, 3, 4].map((level) => <i className={`contribution-cell contribution-cell--${level}`} key={level} />)}<span>Nhiều</span></footer>
  </section>
}

function ProfilePostList({ page, tab }: { page: PostPage; tab: ProfileTab }) {
  if (page.content.length === 0) {
    const label = tab === 'posts' ? 'Bạn chưa đăng bài viết nào.' : tab === 'liked' ? 'Bạn chưa thích bài viết nào.' : 'Bạn chưa lưu bài viết nào.'
    return <div className="profile-empty"><FileText size={24} /><strong>Chưa có nội dung</strong><p>{label}</p></div>
  }

  return <div className="profile-post-list">
    {page.content.map((post) => <article className="profile-post-card" key={post.id}>
      <div className="profile-post-card-main">
        <div>{post.tags.map((tag) => <span key={tag.id}>{tag.name}</span>)}</div>
        <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
        <p>{post.content.slice(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
      </div>
      <footer>
        <time>{formatDate(post.createdAt)}</time>
        <span><Heart size={13} fill={post.likedByCurrentUser ? 'currentColor' : 'none'} /> {post.likeCount}</span>
        <span><MessageCircle size={13} /> {post.commentCount}</span>
        {post.bookmarkedByCurrentUser && <span><Bookmark size={13} fill="currentColor" /> Đã lưu</span>}
      </footer>
    </article>)}
  </div>
}

function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab: ProfileTab = requestedTab === 'posts' || requestedTab === 'liked' || requestedTab === 'saved' ? requestedTab : 'overview'
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [contribution, setContribution] = useState<ContributionSummary | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [postPage, setPostPage] = useState<PostPage>({ content: [], page: emptyPage })
  const [pageNumber, setPageNumber] = useState(0)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isContentLoading, setIsContentLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [contentError, setContentError] = useState('')
  const [followListKind, setFollowListKind] = useState<'followers' | 'following' | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const today = new Date()
    const from = new Date(today)
    from.setDate(from.getDate() - 364)

    async function loadProfile() {
      setIsProfileLoading(true)
      setProfileError('')
      try {
        const [profileResult, contributionResult] = await Promise.all([
          getMyProfile(controller.signal),
          getMyContributions(toDateInput(from), toDateInput(today), controller.signal),
        ])
        setProfile(profileResult)
        setContribution(contributionResult)
      } catch (error) {
        if (!controller.signal.aborted) setProfileError(getApiErrorMessage(error, 'Không thể tải hồ sơ cá nhân.'))
      } finally {
        if (!controller.signal.aborted) setIsProfileLoading(false)
      }
    }

    void loadProfile()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadContent() {
      setIsContentLoading(true)
      setContentError('')
      try {
        if (activeTab === 'overview') {
          const [posts, comments] = await Promise.all([
            getMyPosts(0, 8, controller.signal),
            getMyCommentActivity(0, 8, controller.signal),
          ])
          const items: ActivityItem[] = [
            ...posts.content.map((post): ActivityItem => ({ id: `post-${post.id}`, type: 'POST', occurredAt: post.createdAt, post })),
            ...comments.content.map((comment): ActivityItem => ({ id: `comment-${comment.id}`, type: 'COMMENT', occurredAt: comment.createdAt, comment })),
          ]
          setActivity(items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 12))
          return
        }

        const loader = activeTab === 'posts' ? getMyPosts : activeTab === 'liked' ? getLikedPosts : getBookmarkedPosts
        setPostPage(await loader(pageNumber, PAGE_SIZE, controller.signal))
      } catch (error) {
        if (!controller.signal.aborted) setContentError(getApiErrorMessage(error, 'Không thể tải hoạt động cá nhân.'))
      } finally {
        if (!controller.signal.aborted) setIsContentLoading(false)
      }
    }

    void loadContent()
    return () => controller.abort()
  }, [activeTab, pageNumber])

  function changeTab(tab: ProfileTab) {
    setPageNumber(0)
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  if (isProfileLoading) {
    return <div className="profile-app-shell"><AppNavbar /><StudySidebar /><main className="profile-page"><div className="profile-hero-skeleton" /><div className="profile-body-skeleton" /></main></div>
  }

  if (!profile || !contribution) {
    return <div className="profile-app-shell"><AppNavbar /><StudySidebar /><main className="profile-page"><div className="profile-fatal" role="alert"><strong>Không thể mở hồ sơ</strong><p>{profileError}</p></div></main></div>
  }

  const user = profile.user
  const displayName = user.fullName || user.email.split('@')[0]

  return <div className="profile-app-shell">
    <AppNavbar />
    <StudySidebar />
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-pattern"><span>Build knowledge. Share progress.</span></div>
        <div className="profile-identity">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span className="profile-avatar">{getInitials(user.fullName, user.email)}</span>}
          <div><p>Thành viên StudySync</p><h1>{displayName}</h1><span>{user.email}</span></div>
          <Link to="/settings"><Settings size={15} /> Chỉnh sửa hồ sơ</Link>
        </div>
        <nav className="profile-tabs" aria-label="Nội dung hồ sơ">
          {tabItems.map(({ id, label, icon: Icon }) => <button className={activeTab === id ? 'is-active' : ''} type="button" onClick={() => changeTab(id)} key={id}><Icon size={15} />{label}</button>)}
        </nav>
      </section>

      <div className="profile-layout">
        <aside className="profile-about">
          <section>
            <h2>Giới thiệu</h2>
            <p>{user.bio || 'Chưa có phần giới thiệu cá nhân.'}</p>
          </section>
          <div className="profile-social-stats">
            <button type="button" onClick={() => setFollowListKind('followers')}><strong>{profile.followerCount}</strong> người theo dõi</button>
            <button type="button" onClick={() => setFollowListKind('following')}><strong>{profile.followingCount}</strong> đang theo dõi</button>
          </div>
          <section className="profile-goals">
            <h2><Star size={15} /> Mục tiêu học tập</h2>
            <p>{user.learningGoals || 'Chưa thiết lập mục tiêu học tập.'}</p>
          </section>
          <div className="profile-metrics">
            <span><PenLine size={16} /><strong>{contribution.postCount}</strong><small>Bài / năm</small></span>
            <span><MessageCircle size={16} /><strong>{contribution.commentCount}</strong><small>Comment / năm</small></span>
            <span><Users size={16} /><strong>{user.reputationPoints}</strong><small>Điểm uy tín</small></span>
          </div>
          <p className="profile-joined"><CalendarDays size={14} /> Tham gia từ {formatDate(user.createdAt)}</p>
        </aside>

        <section className="profile-main-content">
          {activeTab === 'overview' && <>
            <ContributionCalendar contribution={contribution} />
            <section className="profile-activity">
              <header><div><Sparkles size={18} /><h2>Hoạt động gần đây</h2></div><span>{activity.length} hoạt động</span></header>
              {isContentLoading && <div className="profile-list-skeleton" />}
              {!isContentLoading && contentError && <div className="profile-content-error" role="alert">{contentError}</div>}
              {!isContentLoading && !contentError && activity.length === 0 && <div className="profile-empty"><Sparkles size={24} /><strong>Chưa có hoạt động</strong><p>Hãy đăng bài hoặc tham gia bình luận để bắt đầu lịch sử học tập.</p></div>}
              {!isContentLoading && !contentError && activity.length > 0 && <div className="activity-timeline">
                {activity.map((item) => <article key={item.id}>
                  <span className={`activity-icon activity-icon--${item.type.toLowerCase()}`}>{item.type === 'POST' ? <PenLine size={15} /> : <MessageCircle size={15} />}</span>
                  <div>
                    <p>{item.type === 'POST' ? 'Đã đăng bài viết' : item.comment.parentId ? 'Đã trả lời bình luận' : 'Đã bình luận bài viết'}</p>
                    <Link to={`/posts/${item.type === 'POST' ? item.post.id : item.comment.postId}`}>{item.type === 'POST' ? item.post.title : item.comment.postTitle}</Link>
                    {item.type === 'COMMENT' && <blockquote>{item.comment.content}</blockquote>}
                    <time>{formatDate(item.occurredAt)}</time>
                  </div>
                </article>)}
              </div>}
            </section>
          </>}

          {activeTab !== 'overview' && <section className="profile-library">
            <header><div><h2>{tabItems.find((tab) => tab.id === activeTab)?.label}</h2><p>{postPage.page.totalElements} bài viết</p></div></header>
            {isContentLoading && <div className="profile-list-skeleton" />}
            {!isContentLoading && contentError && <div className="profile-content-error" role="alert">{contentError}</div>}
            {!isContentLoading && !contentError && <ProfilePostList page={postPage} tab={activeTab} />}
            {!isContentLoading && !contentError && postPage.page.totalPages > 1 && <nav className="profile-pagination" aria-label="Phân trang hồ sơ">
              <button type="button" disabled={postPage.page.number === 0} onClick={() => setPageNumber(postPage.page.number - 1)}>Trang trước</button>
              <span>{postPage.page.number + 1} / {postPage.page.totalPages}</span>
              <button type="button" disabled={postPage.page.number >= postPage.page.totalPages - 1} onClick={() => setPageNumber(postPage.page.number + 1)}>Trang sau</button>
            </nav>}
          </section>}
        </section>
      </div>
    </main>
    {followListKind && <FollowListModal kind={followListKind} userId={user.id} onClose={() => setFollowListKind(null)} />}
  </div>
}

export default ProfilePage
