import { useDeferredValue, useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  FileText,
  Flame,
  Heart,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  Paperclip,
  PenLine,
  Plus,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppNavbar from "../components/layout/AppNavbar";
import StudySidebar from "../components/layout/StudySidebar";
import { getApiErrorMessage } from "../services/api-client";
import {
  bookmarkPost,
  likePost,
  removePostBookmark,
  unlikePost,
} from "../services/interactions.service";
import { getPosts } from "../services/posts.service";
import { getStudyRooms } from "../services/study-rooms.service";
import { getTags } from "../services/tags.service";
import type { PageMetadata, Post, PostContentType, Tag } from "../types/post";
import type { StudyRoom } from "../types/study-room";
import "../styles/posts.css";

const PAGE_SIZE = 8;

const roomColors = ["blue", "pink", "green"] as const;

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
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areRoomsLoading, setAreRoomsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomsErrorMessage, setRoomsErrorMessage] = useState("");
  const [pendingInteraction, setPendingInteraction] = useState<string | null>(
    null,
  );
  const [interactionErrorMessage, setInteractionErrorMessage] = useState("");

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

    async function loadStudyRooms() {
      setAreRoomsLoading(true);
      setRoomsErrorMessage("");

      try {
        setStudyRooms(await getStudyRooms(controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) {
          setStudyRooms([]);
          setRoomsErrorMessage(
            getApiErrorMessage(error, "Không thể tải danh sách phòng học."),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAreRoomsLoading(false);
        }
      }
    }

    void loadStudyRooms();
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

  function updatePost(postId: number, updater: (post: Post) => Post) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? updater(post) : post)),
    );
  }

  async function handleToggleLike(post: Post) {
    const interactionKey = `like-${post.id}`;

    if (pendingInteraction) {
      return;
    }

    const wasLiked = post.likedByCurrentUser;
    const previousLikeCount = post.likeCount;

    setPendingInteraction(interactionKey);
    setInteractionErrorMessage("");
    updatePost(post.id, (currentPost) => ({
      ...currentPost,
      likedByCurrentUser: !wasLiked,
      likeCount: Math.max(0, previousLikeCount + (wasLiked ? -1 : 1)),
    }));

    try {
      if (wasLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      updatePost(post.id, (currentPost) => ({
        ...currentPost,
        likedByCurrentUser: wasLiked,
        likeCount: previousLikeCount,
      }));
      setInteractionErrorMessage(
        getApiErrorMessage(error, "Không thể cập nhật lượt thích."),
      );
    } finally {
      setPendingInteraction(null);
    }
  }

  async function handleToggleBookmark(post: Post) {
    const interactionKey = `bookmark-${post.id}`;

    if (pendingInteraction) {
      return;
    }

    const wasBookmarked = post.bookmarkedByCurrentUser;

    setPendingInteraction(interactionKey);
    setInteractionErrorMessage("");
    updatePost(post.id, (currentPost) => ({
      ...currentPost,
      bookmarkedByCurrentUser: !wasBookmarked,
    }));

    try {
      if (wasBookmarked) {
        await removePostBookmark(post.id);
      } else {
        await bookmarkPost(post.id);
      }
    } catch (error) {
      updatePost(post.id, (currentPost) => ({
        ...currentPost,
        bookmarkedByCurrentUser: wasBookmarked,
      }));
      setInteractionErrorMessage(
        getApiErrorMessage(error, "Không thể cập nhật bài viết đã lưu."),
      );
    } finally {
      setPendingInteraction(null);
    }
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

            {interactionErrorMessage && (
              <div className="posts-interaction-error" role="alert">
                {interactionErrorMessage}
              </div>
            )}

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
                        <button
                          className={post.likedByCurrentUser ? "is-active" : ""}
                          type="button"
                          onClick={() => handleToggleLike(post)}
                          disabled={pendingInteraction === `like-${post.id}`}
                          aria-label={
                            post.likedByCurrentUser
                              ? "Bỏ thích bài viết"
                              : "Thích bài viết"
                          }
                          aria-pressed={post.likedByCurrentUser}
                        >
                          <Heart
                            size={13}
                            fill={
                              post.likedByCurrentUser ? "currentColor" : "none"
                            }
                          />{" "}
                          {post.likeCount}
                        </button>
                        <span>
                          <MessageCircle size={13} /> {post.commentCount}
                        </span>
                        <button
                          className={
                            post.bookmarkedByCurrentUser ? "is-active" : ""
                          }
                          type="button"
                          onClick={() => handleToggleBookmark(post)}
                          disabled={
                            pendingInteraction === `bookmark-${post.id}`
                          }
                          aria-label={
                            post.bookmarkedByCurrentUser
                              ? "Bỏ lưu bài viết"
                              : "Lưu bài viết"
                          }
                          aria-pressed={post.bookmarkedByCurrentUser}
                        >
                          <Bookmark
                            size={13}
                            fill={
                              post.bookmarkedByCurrentUser
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
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
                <Link to="/study-rooms">
                  Xem tất cả <ArrowRight size={13} />
                </Link>
              </header>

              <div className="compact-room-list">
                {areRoomsLoading &&
                  Array.from({ length: 3 }, (_, index) => (
                    <div className="compact-room-skeleton" key={index} />
                  ))}

                {!areRoomsLoading && roomsErrorMessage && (
                  <div className="compact-room-state" role="alert">
                    {roomsErrorMessage}
                  </div>
                )}

                {!areRoomsLoading &&
                  !roomsErrorMessage &&
                  studyRooms.length === 0 && (
                    <div className="compact-room-state">
                      Chưa có phòng học đang hoạt động.
                    </div>
                  )}

                {!areRoomsLoading &&
                  !roomsErrorMessage &&
                  studyRooms.slice(0, 3).map((room, index) => {
                    const color = roomColors[index % roomColors.length];
                    const occupancy =
                      room.maxMembers > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (room.memberCount / room.maxMembers) * 100,
                            ),
                          )
                        : 0;

                    return (
                      <article
                        className={`compact-room compact-room--${color}`}
                        key={room.id}
                      >
                        <div className="compact-room-title">
                          <strong>{room.name}</strong>
                          <span>
                            <i /> LIVE
                          </span>
                        </div>
                        <p>{room.topic || "Học tập tự do"}</p>
                        <div className="compact-progress">
                          <span style={{ width: `${occupancy}%` }} />
                        </div>
                        <small>
                          {room.memberCount}/{room.maxMembers}
                        </small>
                        <Link to={`/study-rooms/${room.id}`}>
                          {room.isMember ? "Xem phòng" : "Tham gia ngay"}
                        </Link>
                      </article>
                    );
                  })}
              </div>

              <Link className="new-room-button" to="/study-rooms">
                <Plus size={14} /> Tạo phòng học mới
              </Link>
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
