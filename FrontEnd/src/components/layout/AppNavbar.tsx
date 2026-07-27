import {
  Bookmark,
  ChevronDown,
  Clock3,
  LogOut,
  Play,
  Settings,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import '../../styles/navbar.css'

function AppNavbar() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const userName = user?.name ?? 'Người dùng'
  const userEmail = user?.email ?? ''
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  function handleLogout() {
    signOut()
    navigate('/login')
  }

  return (
    <header className="app-navbar">
      <nav className="navbar-content" aria-label="Điều hướng phiên học">
        <Link className="study-brand" to="/" aria-label="StudySync trang chủ">
          <span aria-hidden="true"><i /><i /></span>
          <strong>StudySync</strong>
        </Link>

        <button className="finish-session-button" type="button">Kết thúc phiên</button>

        <div className="navbar-session-actions">
          <button className="start-focus-button" type="button">
            <Play size={16} fill="currentColor" aria-hidden="true" />
            <span><strong>Bắt đầu tập trung</strong><small>Focus+</small></span>
          </button>
          <button className="timer-button" type="button" aria-label="Đồng hồ Pomodoro"><Clock3 size={18} /><span>25:00</span></button>

          <details className="user-menu">
            <summary aria-label="Mở menu tài khoản">
              <span className="user-avatar">{userInitials}</span>
              <span className="user-name">{userName}</span>
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <div className="user-menu-popover">
              <div className="user-menu-header">
                <span className="user-avatar user-avatar--large">{userInitials}</span>
                <span><strong>{userName}</strong><small>{userEmail}</small></span>
              </div>
              <div className="user-menu-links">
                <Link to="/profile"><UserRound size={17} aria-hidden="true" /> Hồ sơ</Link>
                <Link to="/saved-posts"><Bookmark size={17} aria-hidden="true" /> Bài viết đã lưu</Link>
                <Link to="/settings"><Settings size={17} aria-hidden="true" /> Cài đặt</Link>
                <button type="button" onClick={handleLogout}><LogOut size={17} aria-hidden="true" /> Đăng xuất</button>
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  )
}

export default AppNavbar
