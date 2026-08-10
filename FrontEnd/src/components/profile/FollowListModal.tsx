import { useEffect, useState } from 'react'
import { LoaderCircle, UserRound, Users, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../services/api-client'
import { getFollowers, getFollowing } from '../../services/social.service'
import type { ProfileUser } from '../../types/profile'

type FollowListModalProps = {
  kind: 'followers' | 'following'
  userId: number
  onClose: () => void
}

function getInitials(user: ProfileUser) {
  return (user.fullName || user.email).split(/[\s@]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export default function FollowListModal({ kind, userId, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<ProfileUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const title = kind === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        setUsers(await (kind === 'followers' ? getFollowers(userId, controller.signal) : getFollowing(userId, controller.signal)))
      } catch (error) {
        if (!controller.signal.aborted) setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách người dùng.'))
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadUsers()
    return () => controller.abort()
  }, [kind, userId])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return <div className="follow-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="follow-modal" role="dialog" aria-modal="true" aria-labelledby="follow-modal-title">
      <header><div><Users size={18} /><h2 id="follow-modal-title">{title}</h2></div><button type="button" onClick={onClose} aria-label="Đóng danh sách"><X size={17} /></button></header>
      <div className="follow-modal-content" aria-live="polite">
        {isLoading && <div className="follow-modal-state"><LoaderCircle className="follow-modal-spinner" size={23} /><p>Đang tải danh sách...</p></div>}
        {!isLoading && errorMessage && <div className="follow-modal-state follow-modal-state--error" role="alert">{errorMessage}</div>}
        {!isLoading && !errorMessage && users.length === 0 && <div className="follow-modal-state"><UserRound size={25} /><strong>Chưa có người dùng</strong><p>{kind === 'followers' ? 'Chưa có ai theo dõi tài khoản này.' : 'Tài khoản này chưa theo dõi ai.'}</p></div>}
        {!isLoading && !errorMessage && users.map((item) => <Link className="follow-user-row" to={`/users/${item.id}`} onClick={onClose} key={item.id}>
          {item.avatarUrl ? <img src={item.avatarUrl} alt="" /> : <span>{getInitials(item)}</span>}
          <div><strong>{item.fullName || item.email.split('@')[0]}</strong><small>{item.bio || `${item.reputationPoints} điểm uy tín`}</small></div>
          <i>Xem hồ sơ</i>
        </Link>)}
      </div>
    </section>
  </div>
}
