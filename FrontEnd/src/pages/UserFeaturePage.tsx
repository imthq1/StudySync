import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import '../styles/home.css'

interface UserFeaturePageProps {
  title: string
}

function UserFeaturePage({ title }: UserFeaturePageProps) {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="feature-placeholder"><Construction size={32} aria-hidden="true" /><p className="section-eyebrow">Module người dùng</p><h1>{title}</h1><p>Trang này sẽ được phát triển ở bước tiếp theo. Hiện tại menu đã sẵn sàng điều hướng.</p><Link to="/"><ArrowLeft size={17} /> Về trang chủ</Link></main>
    </div>
  )
}

export default UserFeaturePage
