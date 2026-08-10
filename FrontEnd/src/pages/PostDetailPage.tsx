import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Bookmark, CalendarDays, Heart, MessageCircle, MessagesSquare, Paperclip, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import CommentItem from '../components/comments/CommentItem'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/api-client'
import {
  createComment,
  deleteComment as deleteCommentRequest,
  getComments,
  updateComment as updateCommentRequest,
} from '../services/comments.service'
import {
  bookmarkPost,
  likePost,
  removePostBookmark,
  unlikePost,
} from '../services/interactions.service'
import { getPostById } from '../services/posts.service'
import type { Comment } from '../types/comment'
import type { Post } from '../types/post'
import '../styles/post-editor.css'

function appendReply(comments: Comment[], parentId: number, reply: Comment): Comment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return { ...comment, replies: [...comment.replies, reply] }
    }

    return {
      ...comment,
      replies: appendReply(comment.replies, parentId, reply),
    }
  })
}

function updateCommentInTree(comments: Comment[], updatedComment: Comment): Comment[] {
  return comments.map((comment) => {
    if (comment.id === updatedComment.id) {
      return { ...updatedComment, replies: comment.replies }
    }

    return {
      ...comment,
      replies: updateCommentInTree(comment.replies, updatedComment),
    }
  })
}

function countCommentBranch(comments: Comment[], commentId: number): number {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return 1 + comment.replies.reduce(
        (total, reply) => total + countCommentBranch([reply], reply.id),
        0,
      )
    }

    const nestedCount = countCommentBranch(comment.replies, commentId)

    if (nestedCount > 0) {
      return nestedCount
    }
  }

  return 0
}

function removeCommentFromTree(comments: Comment[], commentId: number): Comment[] {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: removeCommentFromTree(comment.replies, commentId),
    }))
}

function PostDetailPage() {
  const { postId } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [commentsErrorMessage, setCommentsErrorMessage] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentFormError, setCommentFormError] = useState('')
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)
  const [isUpdatingBookmark, setIsUpdatingBookmark] = useState(false)
  const [interactionErrorMessage, setInteractionErrorMessage] = useState('')

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

  useEffect(() => {
    const controller = new AbortController()
    const parsedPostId = Number(postId)

    async function loadComments() {
      if (!Number.isInteger(parsedPostId) || parsedPostId <= 0) {
        setIsLoadingComments(false)
        return
      }

      try {
        setComments(await getComments(parsedPostId, controller.signal))
      } catch (error) {
        if (!controller.signal.aborted) {
          setCommentsErrorMessage(getApiErrorMessage(error, 'Không thể tải bình luận.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingComments(false)
        }
      }
    }

    loadComments()
    return () => controller.abort()
  }, [postId])

  async function submitComment(parentId: number | null, content: string) {
    const parsedPostId = Number(postId)
    const createdComment = await createComment(parsedPostId, { content, parentId })

    setComments((currentComments) => (
      parentId === null
        ? [createdComment, ...currentComments]
        : appendReply(currentComments, parentId, createdComment)
    ))
    setPost((currentPost) => currentPost
      ? { ...currentPost, commentCount: currentPost.commentCount + 1 }
      : currentPost)
  }

  async function handleCreateComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = commentContent.trim()

    if (!content) {
      return
    }

    setCommentFormError('')
    setIsSubmittingComment(true)

    try {
      await submitComment(null, content)
      setCommentContent('')
    } catch (error) {
      setCommentFormError(getApiErrorMessage(error, 'Không thể gửi bình luận. Vui lòng thử lại.'))
    } finally {
      setIsSubmittingComment(false)
    }
  }

  async function handleUpdateComment(commentId: number, content: string) {
    const updatedComment = await updateCommentRequest(commentId, { content })
    setComments((currentComments) => updateCommentInTree(currentComments, updatedComment))
  }

  async function handleDeleteComment(commentId: number) {
    await deleteCommentRequest(commentId)
    const removedCount = countCommentBranch(comments, commentId)

    setComments((currentComments) => removeCommentFromTree(currentComments, commentId))
    setPost((currentPost) => currentPost
      ? { ...currentPost, commentCount: Math.max(0, currentPost.commentCount - removedCount) }
      : currentPost)
  }

  async function handleToggleLike() {
    if (!post || isUpdatingLike) {
      return
    }

    const wasLiked = post.likedByCurrentUser
    const previousLikeCount = post.likeCount

    setInteractionErrorMessage('')
    setIsUpdatingLike(true)
    setPost({
      ...post,
      likedByCurrentUser: !wasLiked,
      likeCount: Math.max(0, previousLikeCount + (wasLiked ? -1 : 1)),
    })

    try {
      if (wasLiked) {
        await unlikePost(post.id)
      } else {
        await likePost(post.id)
      }
    } catch (error) {
      setPost((currentPost) => currentPost
        ? { ...currentPost, likedByCurrentUser: wasLiked, likeCount: previousLikeCount }
        : currentPost)
      setInteractionErrorMessage(getApiErrorMessage(error, 'Không thể cập nhật lượt thích.'))
    } finally {
      setIsUpdatingLike(false)
    }
  }

  async function handleToggleBookmark() {
    if (!post || isUpdatingBookmark) {
      return
    }

    const wasBookmarked = post.bookmarkedByCurrentUser

    setInteractionErrorMessage('')
    setIsUpdatingBookmark(true)
    setPost({ ...post, bookmarkedByCurrentUser: !wasBookmarked })

    try {
      if (wasBookmarked) {
        await removePostBookmark(post.id)
      } else {
        await bookmarkPost(post.id)
      }
    } catch (error) {
      setPost((currentPost) => currentPost
        ? { ...currentPost, bookmarkedByCurrentUser: wasBookmarked }
        : currentPost)
      setInteractionErrorMessage(getApiErrorMessage(error, 'Không thể cập nhật bài viết đã lưu.'))
    } finally {
      setIsUpdatingBookmark(false)
    }
  }

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
            <button
              className={post.likedByCurrentUser ? 'is-active' : ''}
              type="button"
              onClick={handleToggleLike}
              disabled={isUpdatingLike}
              aria-pressed={post.likedByCurrentUser}
            >
              <Heart size={17} fill={post.likedByCurrentUser ? 'currentColor' : 'none'} />
              {post.likeCount} lượt thích
            </button>
            <span><MessageCircle size={17} /> {post.commentCount} bình luận</span>
            <button
              className={post.bookmarkedByCurrentUser ? 'is-active' : ''}
              type="button"
              onClick={handleToggleBookmark}
              disabled={isUpdatingBookmark}
              aria-pressed={post.bookmarkedByCurrentUser}
            >
              <Bookmark size={17} fill={post.bookmarkedByCurrentUser ? 'currentColor' : 'none'} />
              {post.bookmarkedByCurrentUser ? 'Đã lưu' : 'Lưu bài'}
            </button>
          </footer>
          {interactionErrorMessage && <div className="post-interaction-error" role="alert">{interactionErrorMessage}</div>}
        </article>

        <section className="comments-section" aria-labelledby="comments-title">
          <header className="comments-heading">
            <div>
              <MessagesSquare size={20} />
              <div><h2 id="comments-title">Bình luận</h2><p>Trao đổi kiến thức một cách tích cực và tôn trọng.</p></div>
            </div>
            <strong>{post.commentCount}</strong>
          </header>

          <form className="comment-composer" onSubmit={handleCreateComment}>
            <textarea
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Viết bình luận của bạn..."
              rows={4}
              required
            />
            {commentFormError && <p className="comment-form-error" role="alert">{commentFormError}</p>}
            <footer>
              <span>{commentContent.length} ký tự</span>
              <button type="submit" disabled={isSubmittingComment || !commentContent.trim()}>
                <Send size={15} /> {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </footer>
          </form>

          <div className="comments-list" aria-live="polite">
            {isLoadingComments && Array.from({ length: 2 }, (_, index) => <div className="comment-skeleton" key={index} />)}
            {!isLoadingComments && commentsErrorMessage && <div className="comments-state comments-state--error" role="alert">{commentsErrorMessage}</div>}
            {!isLoadingComments && !commentsErrorMessage && comments.length === 0 && (
              <div className="comments-state"><MessageCircle size={22} /><strong>Chưa có bình luận</strong><p>Hãy là người đầu tiên chia sẻ suy nghĩ về bài viết.</p></div>
            )}
            {!isLoadingComments && !commentsErrorMessage && comments.map((comment) => (
              <CommentItem
                comment={comment}
                currentUserId={user?.id ?? null}
                onReply={(parentId, content) => submitComment(parentId, content)}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                key={comment.id}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default PostDetailPage
