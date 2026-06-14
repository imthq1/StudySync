import { useState, type InputHTMLAttributes } from "react";

import "../../styles/components/auth/AuthForm.scss";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: string;
}

export function FormField({ label, error, icon, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  const labelClass = [
    "form-field__label",
    error ? "form-field__label--error" : "",
    focused && !error ? "form-field__label--focused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inputClass = [
    "form-field__input",
    icon ? "form-field__input--with-icon" : "",
    error ? "form-field__input--error" : "",
    focused && !error ? "form-field__input--focused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-field">
      <label className={labelClass}>{label}</label>
      <div className="form-field__input-wrap">
        {icon && <span className="form-field__icon">{icon}</span>}
        <input
          {...inputProps}
          onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e); }}
          className={inputClass}
        />
      </div>
      {error && <span className="form-field__error">⚠ {error}</span>}
    </div>
  );
}

interface PasswordFieldProps extends Omit<FormFieldProps, "type"> {}

export function PasswordField({ ...props }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-field">
      <FormField {...props} type={show ? "text" : "password"} icon="🔒" />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setShow((s) => !s)}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

interface SocialButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button type="button" className="social-btn" onClick={onClick}>
      <span className="social-btn__icon">{icon}</span>
      {label}
    </button>
  );
}

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
}

export function SubmitButton({ loading, label, loadingLabel = "Đang xử lý..." }: SubmitButtonProps) {
  return (
    <button type="submit" disabled={loading} className="submit-btn">
      {loading ? (
        <>
          <span className="submit-btn__spinner" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function Divider({ label = "hoặc" }: { label?: string }) {
  return (
    <div className="form-divider">
      <div className="form-divider__line" />
      <span className="form-divider__label">{label}</span>
      <div className="form-divider__line" />
    </div>
  );
}
