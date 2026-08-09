import { useDeferredValue, useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  FileText,
  Flame,
  Heart,
  Link2,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  Paperclip,
  PenLine,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppNavbar from "../components/layout/AppNavbar";
import StudySidebar from "../components/layout/StudySidebar";
import { getApiErrorMessage } from "../services/api-client";
import { getPosts } from "../services/posts.service";
import { getTags } from "../services/tags.service";
import type { PageMetadata, PostContentType, Tag } from "../types/post";
import "../styles/posts.css";

const PAGE_SIZE = 8;

const roomItems = [
  {
    title: "LeetCode Daily #88",
    topic: "Array & Hashing",
    progress: 62,
    members: "5/8",
    color: "blue",
  },
  {
    title: "React Deep Dive",
    topic: "Hooks & Performance",
    progress: 48,
    members: "3/6",
    color: "pink",
  },
  {
    title: "SQL Practice Zone",
    topic: "Window Functions",
    progress: 70,
    members: "7/10",
    color: "green",
  },
];

const suggestedPeople = [
  {
    name: "An Nhiên",
    initials: "AN",
    role: "Frontend Dev",
    tags: ["React", "TypeScript"],
  },
  {
    name: "Khoa Lê",
    initials: "KL",
    role: "Data Science",
    tags: ["Python", "ML"],
  },
  {
    name: "Thảo Vy",
    initials: "TV",
    role: "Backend Dev",
    tags: ["Node.js", "Database"],
  },
];

const typeMeta: Record<
  PostContentType,
  { label: string; icon: typeof PenLine; className: string }
> = {
  BLOG: { label: "Bài viết", icon: PenLine, className: "post" },
  QUESTION: { label: "Câu hỏi", icon: FileQuestion, className: "question" },
  DISCUSSION: {
    label: "Thảo luận",
    icon: MessagesSquare,
    className: "discussion",
  },
  NOTE: { label: "Ghi chú", icon: NotebookPen, className: "note" },
};

const initialPage: PageMetadata = {
  size: PAGE_SIZE,
  number: 0,
  totalElements: 0,
  totalPages: 0,
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);

  return Array.from(
    { length: Math.max(0, end - start) },
    (_, index) => start + index,
  );
}

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function PostsPage() {
  const [activeTag, setActiveTag] = useState("");
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword.trim());
  const [pageNumber, setPageNumber] = useState(0);
  const [posts, setPosts] = useState<
    Awaited<ReturnType<typeof getPosts>>["content"]
  >([]);
  const [page, setPage] = useState<PageMetadata>(initialPage);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTags() {
      try {
        setTags(await getTags(controller.signal));
      } catch {
        if (!controller.signal.aborted) {
          setTags([]);
        }
      }
    }

    loadTags();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await getPosts(
          {
            tag: activeTag || undefined,
            keyword: deferredKeyword || undefined,
            contentType: undefined,
            page: pageNumber,
            size: PAGE_SIZE,
          },
          controller.signal,
        );

        setPosts(result.content);
        setPage(result.page);
      } catch (error) {
        if (!controller.signal.aborted) {
          setPosts([]);
          setPage(initialPage);
          setErrorMessage(
            getApiErrorMessage(error, "Không thể tải danh sách bài viết."),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadPosts();
    return () => controller.abort();
  }, [activeTag, deferredKeyword, pageNumber]);

  function changeTag(tagName: string) {
    setActiveTag(tagName);
    setPageNumber(0);
  }

  const visiblePages = getVisiblePages(page.number, page.totalPages);

  return (
    <div className="posts-app-shell">
      <AppNavbar />
      <StudySidebar />

      <main className="posts-page">
        <div className="posts-layout">
          <section className="knowledge-feed" aria-labelledby="knowledge-title">
            <div className="knowledge-page-heading">
              <div>
                <p>Knowledge Hub</p>
                <h1 id="knowledge-title">Khám phá kiến thức</h1>
              </div>
              <Link className="heading-create-button" to="/posts/new">
                <Plus size={16} /> Tạo bài viết
              </Link>
            </div>

            <label className="posts-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPageNumber(0);
                }}
                placeholder="Tìm theo tiêu đề hoặc nội dung..."
              />
            </label>

            <div className="content-tabs" aria-label="Lọc theo tag">
              <button
                className={!activeTag ? "is-active" : ""}
                type="button"
                onClick={() => changeTag("")}
              >
                Tất cả tags
              </button>
              {tags.map((tag) => (
                <button
                  className={activeTag === tag.name ? "is-active" : ""}
                  type="button"
                  onClick={() => changeTag(tag.name)}
                  key={tag.id}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            <div className="knowledge-list" aria-live="polite">
              {isLoading &&
                Array.from({ length: 4 }, (_, index) => (
                  <div className="knowledge-card-skeleton" key={index} />
                ))}

              {!isLoading && errorMessage && (
                <div className="posts-state posts-state--error" role="alert">
                  <FileText size={24} />
                  <strong>Không thể tải bài viết</strong>
                  <p>{errorMessage}</p>
                </div>
              )}

              {!isLoading && !errorMessage && posts.length === 0 && (
                <div className="posts-state">
                  <FileText size={24} />
                  <strong>Chưa có nội dung phù hợp</strong>
                  <p>Hãy thử thay đổi từ khóa, tag hoặc loại nội dung.</p>
                </div>
              )}

              {!isLoading &&
                !errorMessage &&
                posts.map((post) => {
                  const meta = typeMeta[post.contentType];
                  const TypeIcon = meta.icon;
                  const authorName = post.author.fullName || post.author.email;
                  const initials = authorName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <article
                      className={`knowledge-card knowledge-card--${meta.className}`}
                      key={post.id}
                    >
                      <span className="knowledge-avatar">{initials}</span>
                      <div className="knowledge-card-content">
                        <div className="knowledge-labels">
                          <span className="content-type">
                            <TypeIcon size={12} /> {meta.label}
                          </span>
                          {post.tags.map((tag) => (
                            <span className="content-tag" key={tag.id}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                        <h2>
                          <Link to={`/posts/${post.id}`}>{post.title}</Link>
                        </h2>
                        <p>
                          {authorName} · {formatPostDate(post.createdAt)}
                        </p>
                      </div>
                      <div className="knowledge-stats">
                        <span>
                          <Heart size={13} /> {post.likeCount}
                        </span>
                        <span>
                          <MessageCircle size={13} /> {post.commentCount}
                        </span>
                      </div>
                    </article>
                  );
                })}
            </div>

            {!isLoading && !errorMessage && page.totalPages > 1 && (
              <nav
                className="posts-pagination"
                aria-label="Phân trang bài viết"
              >
                <button
                  type="button"
                  onClick={() => setPageNumber(page.number - 1)}
                  disabled={page.number === 0}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={17} />
                </button>
                {visiblePages.map((pageIndex) => (
                  <button
                    className={pageIndex === page.number ? "is-active" : ""}
                    type="button"
                    onClick={() => setPageNumber(pageIndex)}
                    aria-current={
                      pageIndex === page.number ? "page" : undefined
                    }
                    key={pageIndex}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPageNumber(page.number + 1)}
                  disabled={page.number >= page.totalPages - 1}
                  aria-label="Trang tiếp theo"
                >
                  <ChevronRight size={17} />
                </button>
                <span>{page.totalElements} nội dung</span>
              </nav>
            )}

            <section className="share-knowledge-card">
              <div>
                <h2>Chia sẻ kiến thức của bạn</h2>
                <p>Viết bài, đặt câu hỏi hoặc chia sẻ ghi chú học tập.</p>
              </div>
              <div>
                <Link className="create-content-button" to="/posts/new">
                  <Plus size={16} /> Tạo bài
                </Link>
                <button className="upload-content-button" type="button">
                  <Paperclip size={15} /> Upload
                </button>
              </div>
            </section>
          </section>

          <aside className="posts-sidebar">
            <section className="sidebar-panel study-rooms-panel">
              <header className="panel-heading">
                <h2>
                  <Flame size={17} /> Study Rooms
                </h2>
                <button type="button">
                  Xem tất cả <ArrowRight size={13} />
                </button>
              </header>

              <div className="compact-room-list">
                {roomItems.map((room) => (
                  <article
                    className={`compact-room compact-room--${room.color}`}
                    key={room.title}
                  >
                    <div className="compact-room-title">
                      <strong>{room.title}</strong>
                      <span>
                        <i /> LIVE
                      </span>
                    </div>
                    <p>{room.topic}</p>
                    <div className="compact-progress">
                      <span style={{ width: `${room.progress}%` }} />
                    </div>
                    <small>{room.members}</small>
                    <button type="button">
                      {room.color === "green" ? "Xem phòng" : "Tham gia ngay"}
                    </button>
                  </article>
                ))}
              </div>

              <button className="new-room-button" type="button">
                <Plus size={14} /> Tạo phòng học mới
              </button>
            </section>

            <section className="sidebar-panel people-panel">
              <header className="panel-heading">
                <h2>
                  <Users size={17} /> Bạn cùng tiến
                </h2>
                <button type="button">
                  Tìm thêm <ArrowRight size={13} />
                </button>
              </header>

              <div className="suggested-list">
                {suggestedPeople.map((person) => (
                  <article className="suggested-person" key={person.name}>
                    <span className="suggested-avatar">
                      {person.initials}
                      <i />
                    </span>
                    <div>
                      <strong>{person.name}</strong>
                      <small>{person.role}</small>
                      <p>
                        {person.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </p>
                    </div>
                    <button type="button">
                      <Link2 size={12} /> Kết nối
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <button className="posts-mobile-filter" type="button">
          Bộ lọc <ChevronDown size={16} />
        </button>
      </main>
    </div>
  );
}

export default PostsPage;
