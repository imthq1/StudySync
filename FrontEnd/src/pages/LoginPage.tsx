import { useState, type FormEvent } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordField from '../components/auth/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/api-client'
import { login } from '../services/auth.service'

interface LoginPageProps {
  onLoggedIn: () => void
  onNavigateToRegister: () => void
}

function LoginPage({ onLoggedIn, onNavigateToRegister }: LoginPageProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const session = await login({ email, password })
      signIn(session)
      onLoggedIn()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Đăng nhập không thành công. Vui lòng thử lại.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục hành trình học tập của bạn."
    >
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Email</span>
          <span className="input-wrap">
            <Mail className="input-icon" size={19} aria-hidden="true" />
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ban@email.com"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <PasswordField value={password} autoComplete="current-password" onChange={setPassword} />

        {errorMessage && <div className="status-message status-message--error" role="alert">{errorMessage}</div>}
        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          {!isSubmitting && <ArrowRight size={19} aria-hidden="true" />}
        </button>
      </form>

      <div className="login-footer">
        <p>Chưa có tài khoản?<button className="text-button" type="button" onClick={onNavigateToRegister}>Tạo tài khoản</button></p>
        <p>Bằng cách tiếp tục, bạn đồng ý với điều khoản sử dụng của StudySync.</p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
