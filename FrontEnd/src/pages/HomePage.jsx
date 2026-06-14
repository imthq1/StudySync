import { STATS, BUDDIES, ROOMS } from "../constants/mockData";

import { Navbar, PageWrapper }    from "../components/layout";
import { FilterBar, PostList, WriteCTA } from "../components/feed";
import { RoomList }               from "../components/room";
import { BuddyList, TrendingTags } from "../components/buddy";

import { useFeed }     from "../hooks/useFeed";
import { useScrolled } from "../hooks/useScrolled";

import "../styles/pages/HomePage.scss";

function HeroSection() {
  return (
    <div className="home-hero">
      <div className="home-hero__badge">
        <span className="home-hero__badge-dot" />
        <span className="home-hero__badge-text">
          340 study rooms đang hoạt động
        </span>
      </div>

      <h1 className="home-hero__title">
        Học cùng nhau,{" "}
        <span className="home-hero__title-gradient">
          tiến xa hơn.
        </span>
      </h1>

      <p className="home-hero__subtitle">
        Chia sẻ kiến thức, giải đáp thắc mắc và tìm bạn cùng học lập trình — tất cả trong một nơi.
      </p>

      <div className="home-hero__actions">
        <button type="button" className="home-hero__btn-primary">
          ✍️ Viết bài ngay
        </button>
        <button type="button" className="home-hero__btn-secondary">
          🔍 Khám phá nội dung
        </button>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <div className="home-stats">
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className="home-stats__card"
          style={{ animationDelay: `${0.1 + i * 0.05}s` }}
        >
          <div className="home-stats__icon">{s.icon}</div>
          <div className="home-stats__value">{s.value}</div>
          <div className="home-stats__label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { scrolled, ref } = useScrolled();
  const {
    filteredPosts,
    activeTab, setActiveTab,
    activeTag, setActiveTag,
    query, setQuery,
  } = useFeed();

  return (
    <>
      <Navbar query={query} onSearch={setQuery} scrolled={scrolled} />

      <PageWrapper>
        <div ref={ref}>
          <HeroSection />
          <StatsSection />

          <div className="home-layout">
            <div>
              <FilterBar
                activeTab={activeTab}
                activeTag={activeTag}
                onTabChange={setActiveTab}
                onTagChange={setActiveTag}
              />
              <PostList posts={filteredPosts} />
              <WriteCTA />
            </div>

            <div className="home-sidebar">
              <RoomList rooms={ROOMS} />
              <BuddyList buddies={BUDDIES} />
              <TrendingTags activeTag={activeTag} onTagChange={setActiveTag} />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
