import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'

interface PasswordFieldProps {
  value: string
  autoComplete: 'current-password' | 'new-password'
  onChange: (value: string) => void
}

function PasswordField({ value, autoComplete, onChange }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <label className="field">
      <span className="field-label">Mật khẩu</span>
      <span className="input-wrap">
        <LockKeyhole className="input-icon" size={19} aria-hidden="true" />
        <input
          className="field-input"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Nhập mật khẩu"
          autoComplete={autoComplete}
          required
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </span>
    </label>
  )
}

export default PasswordField
