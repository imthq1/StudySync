import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/axiosInstance";
import {
  FormField,
  PasswordField,
  SubmitButton,
  SocialButton,
  Divider,
} from "../components/auth/AuthForm";
import type { FormErrors, LoginDto } from "../types/auth";

import "../styles/pages/LoginPage.scss";

function validate(form: LoginDto): FormErrors<LoginDto> {
  const errs: FormErrors<LoginDto> = {};
  if (!form.email) errs.email = "Email không được để trống";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = "Email không đúng định dạng";
  if (!form.password) errs.password = "Mật khẩu không được để trống";
  else if (form.password.length < 6)
    errs.password = "Mật khẩu phải có ít nhất 6 ký tự";
  return errs;
}

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from: string = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [form, setForm] = useState<LoginDto>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors<LoginDto>>({});
  const [apiError, setApiError] = useState("");

  const set = (field: keyof LoginDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e_) => ({ ...e_, [field]: undefined }));
    setApiError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left auth-panel-left--login">
        <div className="auth-deco auth-deco--accent-top-left" />
        <div className="auth-deco auth-deco--green-bottom-right" />

        <div className="auth-brand-block">
          <div className="auth-logo">
            <div className="auth-logo__icon">⚡</div>
            <span className="auth-logo__name">StudyVerse</span>
          </div>

          <h2 className="auth-heading">
            Cùng nhau học, <br />
            <span className="auth-heading__gradient--login">tiến xa hơn mỗi ngày.</span>
          </h2>
          <p className="auth-description">
            Tham gia cùng <strong>8.200+</strong> học viên đang chia sẻ kiến thức, đặt câu hỏi và tìm bạn cùng tiến trên StudyVerse.
          </p>
        </div>

        <div className="auth-mini-stats">
          {[["📝","12.4K","Bài viết"],["✅","31K","Câu giải đáp"],["🏠","340","Study Rooms"]].map(([icon,val,label])=>(
            <div key={label} className="auth-mini-stat">
              <div className="auth-mini-stat__icon">{icon}</div>
              <div className="auth-mini-stat__value">{val}</div>
              <div className="auth-mini-stat__label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-panel-right">
        <h1 className="auth-form-title">Đăng nhập</h1>
        <p className="auth-form-subtitle">
          Chưa có tài khoản?{" "}
          <Link to="/register">Tạo tài khoản miễn phí →</Link>
        </p>

        <div className="auth-social-row">
          <SocialButton icon="🔵" label="Google" />
          <SocialButton icon="⚫" label="GitHub" />
        </div>

        <Divider />

        {apiError && (
          <div className="auth-error-banner">
            ❌ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <FormField
            label="Email"
            type="email"
            placeholder="ten@example.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            icon="✉️"
            autoComplete="email"
          />

          <div>
            <PasswordField
              label="Mật khẩu"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              autoComplete="current-password"
            />
            <div className="auth-forgot-link">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </div>

          <label className="auth-checkbox-label">
            <input type="checkbox" />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <div className="auth-submit-wrap">
            <SubmitButton loading={isLoading} label="Đăng nhập" loadingLabel="Đang đăng nhập..." />
          </div>
        </form>

        <p className="auth-footer-text">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <Link to="/terms">Điều khoản dịch vụ</Link>{" "}
          và{" "}
          <Link to="/privacy">Chính sách bảo mật</Link>.
        </p>
      </div>
    </div>
  );
}
