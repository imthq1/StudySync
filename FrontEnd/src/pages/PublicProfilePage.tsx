import { useEffect, useState } from 'react'
import { CalendarDays, Heart, LoaderCircle, MessageCircle, Star, UserMinus, UserPlus, Users } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import FollowListModal from '../components/profile/FollowListModal'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/api-client'
import { getUserPosts } from '../services/posts.service'
import { getUserProfile } from '../services/profile.service'
import { followUser, unfollowUser } from '../services/social.service'
import type { Post } from '../types/post'
import type { UserProfile } from '../types/profile'
import '../styles/profile.css'

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date)
}

function getInitials(name: string | null, email: string) {
  return (name || email).split(/[\s@]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function PublicProfilePage() {
  const { user } = useAuth()
  const { userId: userIdParam } = useParams()
  const userId = Number(userIdParam)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowPending, setIsFollowPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [followListKind, setFollowListKind] = useState<'followers' | 'following' | null>(null)

  useEffect(() => {
    if (!Number.isInteger(userId) || userId <= 0 || userId === user?.id) return
    const controller = new AbortController()

    async function loadProfile() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const [profileResult, postsResult] = await Promise.all([
          getUserProfile(userId, controller.signal),
          getUserPosts(userId, 0, 6, controller.signal),
        ])
        setProfile(profileResult)
        setPosts(postsResult.content)
      } catch (error) {
        if (!controller.signal.aborted) setErrorMessage(getApiErrorMessage(error, 'Không thể tải hồ sơ người dùng.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => controller.abort()
  }, [user?.id, userId])

  async function toggleFollow() {
    if (!profile || isFollowPending) return
    setIsFollowPending(true)
    setErrorMessage('')
    try {
      if (profile.isFollowing) await unfollowUser(userId)
      else await followUser(userId)
      setProfile((current) => current ? {
        ...current,
        isFollowing: !current.isFollowing,
        followerCount: Math.max(0, current.followerCount + (current.isFollowing ? -1 : 1)),
      } : current)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể cập nhật theo dõi.'))
    } finally {
      setIsFollowPending(false)
    }
  }

  if (!Number.isInteger(userId) || userId <= 0) return <Navigate to="/" replace />
  if (userId === user?.id) return <Navigate to="/profile" replace />

  if (isLoading) {
    return <div className="profile-app-shell"><AppNavbar /><StudySidebar /><main className="profile-page"><div className="profile-hero-skeleton" /><div className="profile-body-skeleton" /></main></div>
  }

  if (!profile) {
    return <div className="profile-app-shell"><AppNavbar /><StudySidebar /><main className="profile-page"><div className="profile-fatal" role="alert"><strong>Không thể mở hồ sơ</strong><p>{errorMessage || 'Người dùng không tồn tại.'}</p></div></main></div>
  }

  const profileUser = profile.user
  const displayName = profileUser.fullName || profileUser.email.split('@')[0]

  return <div className="profile-app-shell">
    <AppNavbar />
    <StudySidebar />
    <main className="profile-page">
      <section className="profile-hero public-profile-hero">
        <div className="profile-hero-pattern"><span>Learn together. Grow together.</span></div>
        <div className="profile-identity">
          {profileUser.avatarUrl ? <img src={profileUser.avatarUrl} alt="" /> : <span className="profile-avatar">{getInitials(profileUser.fullName, profileUser.email)}</span>}
          <div><p>Thành viên StudySync</p><h1>{displayName}</h1><span>{profileUser.email}</span></div>
          <button className={profile.isFollowing ? 'public-follow-button is-following' : 'public-follow-button'} type="button" onClick={() => void toggleFollow()} disabled={isFollowPending}>
            {isFollowPending ? <LoaderCircle className="public-follow-spinner" size={15} /> : profile.isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
            {profile.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
          </button>
        </div>
      </section>

      {errorMessage && <div className="public-profile-alert" role="alert">{errorMessage}</div>}

      <div className="profile-layout public-profile-layout">
        <aside className="profile-about">
          <section><h2>Giới thiệu</h2><p>{profileUser.bio || 'Người dùng chưa thêm phần giới thiệu.'}</p></section>
          <div className="profile-social-stats"><button type="button" onClick={() => setFollowListKind('followers')}><strong>{profile.followerCount}</strong> người theo dõi</button><button type="button" onClick={() => setFollowListKind('following')}><strong>{profile.followingCount}</strong> đang theo dõi</button></div>
          <section className="profile-goals"><h2><Star size={15} /> Mục tiêu học tập</h2><p>{profileUser.learningGoals || 'Chưa công khai mục tiêu học tập.'}</p></section>
          <div className="public-profile-metric"><Users size={16} /><strong>{profileUser.reputationPoints}</strong><span>điểm uy tín</span></div>
          <p className="profile-joined"><CalendarDays size={14} /> Tham gia từ {formatDate(profileUser.createdAt)}</p>
        </aside>

        <section className="profile-library public-profile-posts">
          <header><div><h2>Bài viết gần đây</h2><p>{posts.length} bài đang hiển thị</p></div></header>
          {posts.length === 0 ? <div className="profile-empty"><MessageCircle size={24} /><strong>Chưa có bài viết</strong><p>Người dùng này chưa chia sẻ nội dung nào.</p></div> : <div className="profile-post-list">
            {posts.map((post) => <article className="profile-post-card" key={post.id}>
              <div className="profile-post-card-main">
                <div>{post.tags.map((tag) => <span key={tag.id}>{tag.name}</span>)}</div>
                <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
                <p>{post.content.slice(0, 170)}{post.content.length > 170 ? '...' : ''}</p>
              </div>
              <footer><time>{formatDate(post.createdAt)}</time><span><Heart size={13} /> {post.likeCount}</span><span><MessageCircle size={13} /> {post.commentCount}</span></footer>
            </article>)}
          </div>}
        </section>
      </div>
    </main>
    {followListKind && <FollowListModal kind={followListKind} userId={userId} onClose={() => setFollowListKind(null)} />}
  </div>
}

export default PublicProfilePage
