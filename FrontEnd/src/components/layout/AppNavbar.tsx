import {
  Bookmark,
  ChevronDown,
  LoaderCircle,
  LogOut,
  Search,
  Settings,
  UserPlus,
  UserRoundCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/api-client";
import { followUser, searchUsers, unfollowUser } from "../../services/social.service";
import type { UserSearchResult } from "../../types/social";
import "../../styles/navbar.css";

function AppNavbar() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [pendingFollowId, setPendingFollowId] = useState<number | null>(null);
  const userName = user?.name ?? "Người dùng";
  const userEmail = user?.email ?? "";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const result = await searchUsers(query, controller.signal);
        setSearchResults(result.content);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSearchResults([]);
          setSearchError(getApiErrorMessage(error, "Không thể tìm người dùng."));
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  async function handleToggleFollow(result: UserSearchResult) {
    if (pendingFollowId !== null) return;
    setPendingFollowId(result.id);
    setSearchError("");
    try {
      if (result.isFollowing) await unfollowUser(result.id);
      else await followUser(result.id);
      setSearchResults((current) => current.map((item) => item.id === result.id
        ? { ...item, isFollowing: !item.isFollowing }
        : item));
    } catch (error) {
      setSearchError(getApiErrorMessage(error, "Không thể cập nhật theo dõi."));
    } finally {
      setPendingFollowId(null);
    }
  }

  return (
    <header className="app-navbar">
      <nav className="navbar-content" aria-label="Điều hướng phiên học">
        <Link className="study-brand" to="/" aria-label="StudySync trang chủ">
          <span aria-hidden="true">
            <i />
            <i />
          </span>
          <strong>StudySync</strong>
        </Link>

        <div className="navbar-user-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm người học để kết nối..."
            aria-label="Tìm người dùng"
          />
          {isSearching && <LoaderCircle className="navbar-search-spinner" size={15} />}
          {searchQuery.trim().length >= 2 && <div className="navbar-search-results">
            {searchError && <p className="navbar-search-state navbar-search-state--error" role="alert">{searchError}</p>}
            {!isSearching && !searchError && searchResults.length === 0 && <p className="navbar-search-state">Không tìm thấy người dùng phù hợp.</p>}
            {searchResults.map((result) => {
              const initials = result.fullName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
              return <article className="navbar-search-user" key={result.id}>
                <Link className="navbar-search-avatar" to={`/users/${result.id}`} onClick={() => setSearchQuery("")}>{result.avatarUrl ? <img src={result.avatarUrl} alt="" /> : <span>{initials}</span>}</Link>
                <Link className="navbar-search-profile" to={`/users/${result.id}`} onClick={() => setSearchQuery("")}><strong>{result.fullName}</strong><small>{result.bio || `${result.reputationPoints} điểm uy tín`}</small></Link>
                <button
                  type="button"
                  className={result.isFollowing ? "is-following" : ""}
                  onClick={() => void handleToggleFollow(result)}
                  disabled={pendingFollowId !== null}
                  aria-label={result.isFollowing ? `Bỏ theo dõi ${result.fullName}` : `Theo dõi ${result.fullName}`}
                >
                  {pendingFollowId === result.id ? <LoaderCircle className="navbar-search-spinner" size={14} /> : result.isFollowing ? <UserRoundCheck size={14} /> : <UserPlus size={14} />}
                  {result.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </article>;
            })}
          </div>}
        </div>

        <div className="navbar-session-actions">
          <details className="user-menu">
            <summary aria-label="Mở menu tài khoản">
              <span className="user-avatar">{userInitials}</span>
              <span className="user-name">{userName}</span>
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <div className="user-menu-popover">
              <div className="user-menu-header">
                <span className="user-avatar user-avatar--large">
                  {userInitials}
                </span>
                <span>
                  <strong>{userName}</strong>
                  <small>{userEmail}</small>
                </span>
              </div>
              <div className="user-menu-links">
                <Link to="/profile">
                  <UserRound size={17} aria-hidden="true" /> Hồ sơ
                </Link>
                <Link to="/profile?tab=saved">
                  <Bookmark size={17} aria-hidden="true" /> Bài viết đã lưu
                </Link>
                <Link to="/settings">
                  <Settings size={17} aria-hidden="true" /> Cài đặt
                </Link>
                <button type="button" onClick={handleLogout}>
                  <LogOut size={17} aria-hidden="true" /> Đăng xuất
                </button>
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}

export default AppNavbar;
