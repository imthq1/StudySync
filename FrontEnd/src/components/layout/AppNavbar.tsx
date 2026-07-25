import {
  Bell,
  Bookmark,
  ChevronDown,
  Compass,
  LogOut,
  PenSquare,
  Search,
  Settings,
  UserRound,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearAuthSession } from '../../services/auth.service'
import '../../styles/navbar.css'

function AppNavbar() {
  const navigate = useNavigate()

  function handleLogout() {
    clearAuthSession()
    navigate('/login')
  }

  return (
    <header className="app-navbar">
      <nav className="navbar-content" aria-label="Điều hướng chính">
        <Link className="brand" to="/" aria-label="StudySync trang chủ">
          <span className="brand-mark" aria-hidden="true">S</span>
          StudySync
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end>Trang chủ</NavLink>
          <a href="#discover"><Compass size={16} aria-hidden="true" /> Khám phá</a>
          <a href="#questions">Hỏi đáp</a>
          <a href="#study-rooms">Phòng học</a>
        </div>

        <div className="navbar-actions">
          <button className="navbar-icon-button" type="button" aria-label="Tìm kiếm">
            <Search size={19} aria-hidden="true" />
          </button>
          <button className="navbar-icon-button" type="button" aria-label="Thông báo">
            <Bell size={19} aria-hidden="true" />
            <span className="notification-dot" aria-hidden="true" />
          </button>
          <button className="create-post-button" type="button">
            <PenSquare size={17} aria-hidden="true" />
            <span>Viết bài</span>
          </button>

          <details className="user-menu">
            <summary aria-label="Mở menu tài khoản">
              <span className="user-avatar">MN</span>
              <span className="user-name">Minh Nguyễn</span>
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <div className="user-menu-popover">
              <div className="user-menu-header">
                <span className="user-avatar user-avatar--large">MN</span>
                <span><strong>Minh Nguyễn</strong><small>minh@studysync.vn</small></span>
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
