import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui";
import { useAuth } from "../../context/AuthContext";

import "../../styles/components/layout/Navbar.scss";

export default function Navbar({
  query,
  onSearch,
  scrolled,
}: {
  query: string;
  onSearch: (v: string) => void;
  scrolled: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    navigate("/login");
  };

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo">⚡</div>
          <span className="navbar__title">StudyVerse</span>
        </Link>

        <div className="navbar__search-wrap">
          <span className="navbar__search-icon">🔍</span>
          <input
            className="navbar__search-input"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm bài viết, câu hỏi, tài liệu..."
          />
        </div>

        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user-menu">
              <button
                type="button"
                className="navbar__user-btn"
                onClick={() => setDropOpen((o) => !o)}
              >
                <div className="navbar__user-avatar">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </div>
                <span className="navbar__user-name">{user.fullName.split(" ").pop()}</span>
                <span className="navbar__user-caret">▾</span>
              </button>
              {dropOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <p className="navbar__dropdown-name">{user.fullName}</p>
                    <p className="navbar__dropdown-email">{user.email}</p>
                    <p className="navbar__dropdown-points">⭐ {user.reputationPoints} điểm</p>
                  </div>
                  {[
                    { label: "👤  Hồ sơ", to: "/profile" },
                    { label: "📝  Bài viết", to: "/my-posts" },
                    { label: "⚙️  Cài đặt", to: "/settings" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="navbar__dropdown-link"
                      onClick={() => setDropOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button type="button" className="navbar__dropdown-logout" onClick={handleLogout}>
                    🚪  Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Đăng nhập</Button></Link>
              <Link to="/register"><Button variant="primary" size="sm">Tham gia miễn phí</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
