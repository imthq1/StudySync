import BuddyCard from "./BuddyCard";

import "../../styles/components/buddy/BuddyList.scss";

export default function BuddyList({ buddies }) {
  return (
    <div className="buddy-list">
      <div className="buddy-list__header">
        <span className="buddy-list__title">🤝 Bạn cùng tiến</span>
        <button type="button" className="buddy-list__more-btn">
          Tìm thêm →
        </button>
      </div>

      <div className="buddy-list__items">
        {buddies.map((buddy) => (
          <BuddyCard key={buddy.id} buddy={buddy} />
        ))}
      </div>
    </div>
  );
}
