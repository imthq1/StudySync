import { FEED_TABS, TRENDING_TAGS } from "../../constants/mockData";

import "../../styles/components/feed/FilterBar.scss";

export default function FilterBar({ activeTab, activeTag, onTabChange, onTagChange }) {
  return (
    <div>
      <div className="filter-bar__tabs">
        {FEED_TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(i)}
            className={`filter-bar__tab${activeTab === i ? " filter-bar__tab--active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="filter-bar__tags">
        {TRENDING_TAGS.slice(0, 7).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagChange(activeTag === tag ? null : tag)}
            className={`filter-bar__tag${activeTag === tag ? " filter-bar__tag--active" : ""}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
