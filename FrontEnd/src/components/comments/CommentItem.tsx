import { useState, type FormEvent } from 'react'
import { Check, CornerDownRight, MessageCircle, Pencil, Send, Trash2, X } from 'lucide-react'
import type { Comment } from '../../types/comment'

interface CommentItemProps {
  comment: Comment
  currentUserId: number | null
  onReply: (parentId: number, content: string) => Promise<void>
  onUpdate: (commentId: number, content: string) => Promise<void>
  onDelete: (commentId: number) => Promise<void>
}

function formatCommentDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function CommentItem({ comment, currentUserId, onReply, onUpdate, onDelete }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isOwnComment = currentUserId === comment.author.id
  const authorName = comment.author.fullName || comment.author.email
  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = replyContent.trim()

    if (!content) {
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await onReply(comment.id, content)
      setReplyContent('')
      setIsReplying(false)
    } catch {
      setErrorMessage('Không thể gửi phản hồi. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = editContent.trim()

    if (!content || content === comment.content) {
      setIsEditing(false)
      setEditContent(comment.content)
      return
    }

    setErrorMessage('')
    setIsUpdating(true)

    try {
      await onUpdate(comment.id, content)
      setIsEditing(false)
    } catch {
      setErrorMessage('Không thể cập nhật bình luận. Vui lòng thử lại.')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDelete() {
    setErrorMessage('')
    setIsDeleting(true)

    try {
      await onDelete(comment.id)
    } catch {
      setErrorMessage('Không thể xóa bình luận. Vui lòng thử lại.')
      setIsDeleting(false)
      setIsConfirmingDelete(false)
    }
  }

  return (
    <article className="comment-item">
      <div className="comment-avatar">
        {comment.author.avatarUrl
          ? <img src={comment.author.avatarUrl} alt="" />
          : initials}
      </div>

      <div className="comment-body">
        <header className="comment-header">
          <div><strong>{authorName}</strong><span>{comment.author.reputationPoints} điểm uy tín</span></div>
          <div className="comment-header-actions">
            <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
            {isOwnComment && !isEditing && (
              <span className="own-comment-actions">
                <button type="button" onClick={() => setIsEditing(true)} aria-label="Chỉnh sửa bình luận"><Pencil size={13} /></button>
                <button type="button" onClick={() => setIsConfirmingDelete(true)} aria-label="Xóa bình luận"><Trash2 size={13} /></button>
              </span>
            )}
          </div>
        </header>

        {isEditing ? (
          <form className="comment-edit-form" onSubmit={handleUpdate}>
            <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={3} autoFocus required />
            <div>
              <button type="button" onClick={() => { setIsEditing(false); setEditContent(comment.content) }}><X size={14} /> Hủy</button>
              <button type="submit" disabled={isUpdating || !editContent.trim()}><Check size={14} /> {isUpdating ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}

        {isConfirmingDelete && (
          <div className="comment-delete-confirm" role="alert">
            <span>Xóa bình luận này?</span>
            <div>
              <button type="button" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting}>Hủy</button>
              <button type="button" onClick={handleDelete} disabled={isDeleting}><Trash2 size={13} /> {isDeleting ? 'Đang xóa...' : 'Xóa'}</button>
            </div>
          </div>
        )}

        {!isEditing && !isConfirmingDelete && (
          <button className="comment-reply-button" type="button" onClick={() => setIsReplying(!isReplying)}>
            <MessageCircle size={14} /> Phản hồi
          </button>
        )}

        {isReplying && (
          <form className="comment-reply-form" onSubmit={handleReply}>
            <textarea
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              placeholder={`Phản hồi ${authorName}...`}
              rows={3}
              autoFocus
              required
            />
            {errorMessage && <p className="comment-form-error" role="alert">{errorMessage}</p>}
            <div>
              <button type="button" onClick={() => setIsReplying(false)}><X size={14} /> Hủy</button>
              <button type="submit" disabled={isSubmitting}><Send size={14} /> {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}</button>
            </div>
          </form>
        )}

        {comment.replies.length > 0 && (
          <div className="comment-replies">
            <span className="reply-connector" aria-hidden="true"><CornerDownRight size={16} /></span>
            {comment.replies.map((reply) => (
              <CommentItem
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
                key={reply.id}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default CommentItem
