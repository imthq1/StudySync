import { useState, type FormEvent } from 'react'
import { ArrowRight, Mail, UserRound } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordField from '../components/auth/PasswordField'
import { getApiErrorMessage } from '../services/api-client'
import { register } from '../services/auth.service'

interface RegisterPageProps {
  onNavigateToLogin: () => void
  onRegistered: () => void
}

function RegisterPage({ onNavigateToLogin, onRegistered }: RegisterPageProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await register({ email, password, fullName })
      onRegistered()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Đăng ký không thành công. Vui lòng thử lại.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Bắt đầu hành trình mới"
      subtitle="Tạo tài khoản để học tập, chia sẻ và kết nối cùng cộng đồng."
    >
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Họ và tên</span>
          <span className="input-wrap">
            <UserRound className="input-icon" size={19} aria-hidden="true" />
            <input
              className="field-input"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nguyễn Văn An"
              autoComplete="name"
              required
            />
          </span>
        </label>

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

        <PasswordField value={password} autoComplete="new-password" onChange={setPassword} />

        {errorMessage && <div className="status-message status-message--error" role="alert">{errorMessage}</div>}

        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          {!isSubmitting && <ArrowRight size={19} aria-hidden="true" />}
        </button>
      </form>

      <div className="login-footer">
        <p>Đã có tài khoản?<button className="text-button" type="button" onClick={onNavigateToLogin}>Đăng nhập</button></p>
        <p>Bằng cách tiếp tục, bạn đồng ý với điều khoản sử dụng của StudySync.</p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
