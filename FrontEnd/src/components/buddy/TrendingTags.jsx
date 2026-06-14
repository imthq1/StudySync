import { TRENDING_TAGS } from "../../constants/mockData";

import "../../styles/components/buddy/TrendingTags.scss";

export default function TrendingTags({ activeTag, onTagChange }) {
  return (
    <div className="trending-tags">
      <p className="trending-tags__title">🔥 Chủ đề hot</p>
      <div className="trending-tags__list">
        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagChange(activeTag === tag ? null : tag)}
            className={`trending-tags__btn${activeTag === tag ? " trending-tags__btn--active" : ""}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
