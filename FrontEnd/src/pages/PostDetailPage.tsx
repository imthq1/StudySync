import { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, CalendarDays, Heart, MessageCircle, Paperclip } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import { getApiErrorMessage } from '../services/api-client'
import { getPostById } from '../services/posts.service'
import type { Post } from '../types/post'
import '../styles/post-editor.css'

function PostDetailPage() {
  const { postId } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const parsedPostId = Number(postId)

    async function loadPost() {
      if (!Number.isInteger(parsedPostId) || parsedPostId <= 0) {
        setErrorMessage('Mã bài viết không hợp lệ.')
        setIsLoading(false)
        return
      }

      try {
        setPost(await getPostById(parsedPostId, controller.signal))
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(getApiErrorMessage(error, 'Không thể tải chi tiết bài viết.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadPost()
    return () => controller.abort()
  }, [postId])

  if (isLoading) {
    return (
      <div className="editor-app-shell">
        <AppNavbar />
        <StudySidebar />
        <main className="post-detail-page">
          <div className="post-detail-loading" aria-label="Đang tải bài viết" />
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="editor-app-shell">
        <AppNavbar />
        <StudySidebar />
        <main className="post-detail-page">
          <section className="post-not-found">
            <h1>Chưa thể tải bài viết</h1>
            <p>{errorMessage || 'Bài viết không tồn tại hoặc đã bị xóa.'}</p>
            <Link to="/posts"><ArrowLeft size={17} /> Quay lại kho kiến thức</Link>
          </section>
        </main>
      </div>
    )
  }

  const authorName = post.author.fullName || post.author.email
  const authorInitials = authorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="editor-app-shell">
      <AppNavbar />
      <StudySidebar />

      <main className="post-detail-page">
        <Link className="post-detail-back" to="/posts"><ArrowLeft size={17} /> Kho kiến thức</Link>

        <article className="post-detail-card">
          <header className="post-detail-header">
            <div className="post-detail-tags">
              <span>{post.contentType}</span>
              {post.tags.map((tag) => <span key={tag.id}>#{tag.name}</span>)}
            </div>
            <h1>{post.title}</h1>
            <div className="post-detail-author">
              <span className="post-detail-avatar">{authorInitials}</span>
              <div><strong>{authorName}</strong><small>{post.author.email}</small></div>
              <span>
                <CalendarDays size={14} />
                {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(post.createdAt))}
              </span>
            </div>
          </header>

          <div className="post-detail-markdown markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {post.fileUrl && (
            <a className="post-attachment" href={post.fileUrl} target="_blank" rel="noreferrer">
              <Paperclip size={16} /> Xem tài liệu đính kèm
            </a>
          )}

          <footer className="post-detail-footer">
            <span><Heart size={17} fill={post.likedByCurrentUser ? 'currentColor' : 'none'} /> {post.likeCount} lượt thích</span>
            <span><MessageCircle size={17} /> {post.commentCount} bình luận</span>
            <span><Bookmark size={17} fill={post.bookmarkedByCurrentUser ? 'currentColor' : 'none'} /> {post.bookmarkedByCurrentUser ? 'Đã lưu' : 'Lưu bài'}</span>
          </footer>
        </article>
      </main>
    </div>
  )
}

export default PostDetailPage
