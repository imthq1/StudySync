import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/axiosInstance";
import {
  FormField,
  PasswordField,
  SubmitButton,
  SocialButton,
  Divider,
} from "../components/auth/AuthForm";
import type { FormErrors, RegisterDto } from "../types/auth";
import { colors as C } from "../constants/theme";

import "../styles/pages/RegisterPage.scss";

function validate(form: RegisterDto): FormErrors<RegisterDto> {
  const errs: FormErrors<RegisterDto> = {};
  if (!form.fullName.trim()) errs.fullName = "Họ và tên không được để trống";
  if (!form.email) errs.email = "Email không được để trống";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = "Email không đúng định dạng";
  if (!form.password) errs.password = "Mật khẩu không được để trống";
  else if (form.password.length < 6)
    errs.password = "Mật khẩu phải có ít nhất 6 ký tự";
  return errs;
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: C.border };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Rất yếu", color: "#FF4444" },
    { label: "Yếu",     color: "#FF8C00" },
    { label: "Trung bình", color: C.amber },
    { label: "Tốt",     color: "#90EE90" },
    { label: "Mạnh",    color: C.green },
    { label: "Rất mạnh",color: C.green },
  ];
  return { score, ...map[score] };
}

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterDto>({ fullName:"", email:"", password:"" });
  const [errors, setErrors] = useState<FormErrors<RegisterDto>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getStrength(form.password);

  const set = (field: keyof RegisterDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e_) => ({ ...e_, [field]: undefined }));
    setApiError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left auth-panel-left--register">
        <div className="auth-deco auth-deco--green-top-right" />
        <div className="auth-deco auth-deco--accent-bottom-left" />

        <div className="auth-brand-block">
          <div className="auth-logo">
            <div className="auth-logo__icon">⚡</div>
            <span className="auth-logo__name">StudyVerse</span>
          </div>

          <h2 className="auth-heading auth-heading--register">
            Bắt đầu hành trình <br />
            <span className="auth-heading__gradient--register">học tập của bạn.</span>
          </h2>
          <p className="auth-description">
            Tạo tài khoản miễn phí và tiếp cận kho tài liệu, cộng đồng hỏi đáp và study rooms 24/7.
          </p>
        </div>

        <div className="auth-benefits">
          {[
            ["✅","Hoàn toàn miễn phí, không giới hạn"],
            ["📚","Truy cập 12.400+ bài viết & tài liệu"],
            ["🤝","Kết nối với 8.200+ học viên"],
            ["🏠","Tham gia study rooms theo chủ đề"],
          ].map(([icon, text]) => (
            <div key={text} className="auth-benefit">
              <span className="auth-benefit__icon">{icon}</span>
              <span className="auth-benefit__text">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-panel-right auth-panel-right--scroll">
        {success ? (
          <div className="auth-success">
            <div className="auth-success__icon">✅</div>
            <h2 className="auth-success__title">Đăng ký thành công!</h2>
            <p className="auth-success__text">
              Chào mừng {form.fullName} 🎉 Đang chuyển trang...
            </p>
          </div>
        ) : (
          <>
            <h1 className="auth-form-title">Tạo tài khoản</h1>
            <p className="auth-form-subtitle auth-form-subtitle--register">
              Đã có tài khoản?{" "}
              <Link to="/login">Đăng nhập →</Link>
            </p>

            <div className="auth-social-row auth-social-row--register">
              <SocialButton icon="🔵" label="Google" />
              <SocialButton icon="⚫" label="GitHub" />
            </div>

            <Divider />

            {apiError && (
              <div className="auth-error-banner auth-error-banner--register">
                ❌ {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="auth-form auth-form--register">
              <FormField
                label="Họ và tên"
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={set("fullName")}
                error={errors.fullName}
                icon="👤"
                autoComplete="name"
              />

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
                  autoComplete="new-password"
                />
                {form.password && (
                  <div className="auth-strength">
                    <div className="auth-strength__bars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="auth-strength__bar"
                          style={{
                            background: i <= strength.score ? strength.color : C.border,
                          }}
                        />
                      ))}
                    </div>
                    <span className="auth-strength__label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <label className="auth-checkbox-label auth-checkbox-label--terms">
                <input type="checkbox" required />
                <span>
                  Tôi đồng ý với{" "}
                  <Link to="/terms">Điều khoản dịch vụ</Link>{" "}
                  và{" "}
                  <Link to="/privacy">Chính sách bảo mật</Link> của StudyVerse
                </span>
              </label>

              <div className="auth-submit-wrap">
                <SubmitButton loading={isLoading} label="Tạo tài khoản" loadingLabel="Đang tạo tài khoản..." />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
