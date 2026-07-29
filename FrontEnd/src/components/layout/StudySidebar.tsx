import {
  BarChart3,
  BookOpen,
  Flame,
  Home,
  Library,
  MessageCircle,
  Settings2,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const sidebarItems = [
  { label: 'Trang chủ', icon: Home, href: '/' },
  { label: 'Hồ sơ', icon: UserRound, href: '/profile' },
  { label: 'Tin nhắn', icon: MessageCircle, href: '/#messages' },
  { label: 'Phòng học', icon: UsersRound, href: '/#rooms' },
  { label: 'Kho kiến thức', icon: Library, href: '/posts' },
  { label: 'Thống kê', icon: BarChart3, href: '/#stats' },
  { label: 'Cài đặt', icon: Settings2, href: '/settings' },
]

function StudySidebar() {
  const location = useLocation()

  return (
    <aside className="study-sidebar" aria-label="Điều hướng ứng dụng">
      <div className="sidebar-profile"><BookOpen size={18} /><span>YOU</span></div>
      <div className="sidebar-links">
        {sidebarItems.map(({ label, icon: Icon, href }) => (
          <Link className={location.pathname === href ? 'is-active' : ''} to={href} key={label} aria-label={label} title={label}>
            <Icon size={20} aria-hidden="true" />
          </Link>
        ))}
      </div>
      <div className="sidebar-streak"><Flame size={21} fill="currentColor" /><strong>7</strong></div>
    </aside>
  )
}

export default StudySidebar
