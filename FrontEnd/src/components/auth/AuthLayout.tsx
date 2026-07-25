import type { ReactNode } from 'react'
import { BookOpen, CheckCircle2, Sparkles } from 'lucide-react'
import '../../styles/auth.css'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="auth-title">
        <div className="login-content">
          <a className="brand" href="/" aria-label="StudySync home">
            <span className="brand-mark" aria-hidden="true">
              <BookOpen size={19} strokeWidth={2.5} />
            </span>
            StudySync
          </a>

          <h1 id="auth-title" className="login-heading">{title}</h1>
          <p className="login-subtitle">{subtitle}</p>
          {children}
        </div>
      </section>

      <aside className="showcase-panel" aria-label="StudySync introduction">
        <div className="showcase-content">
          <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> Học tập cùng cộng đồng</p>
          <h2 className="showcase-title">Biến kiến thức thành tiến bộ mỗi ngày.</h2>
          <p className="showcase-text">Kết nối, chia sẻ tài liệu và theo dõi hành trình phát triển của bạn trong một không gian tập trung.</p>

          <div className="progress-card">
            <div className="progress-card-header">
              <span>Tiến độ tuần này</span>
              <span>72%</span>
            </div>
            <div className="progress-card-title">
              <span>React TypeScript</span>
              <CheckCircle2 size={19} color="#22c55e" aria-label="Completed" />
            </div>
            <div className="progress-track" aria-label="72% complete" role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
              <span className="progress-value" />
            </div>
            <div className="progress-members">
              <div className="avatars" aria-hidden="true">
                <span className="avatar">AN</span>
                <span className="avatar">ML</span>
                <span className="avatar">TK</span>
              </div>
              24 người đang học cùng bạn
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
}

export default AuthLayout
