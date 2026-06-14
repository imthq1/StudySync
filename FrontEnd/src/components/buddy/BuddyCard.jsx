import { colors as C } from "../../constants/theme";
import { Avatar, Button } from "../ui";

import "../../styles/components/buddy/BuddyCard.scss";

export default function BuddyCard({ buddy }) {
  return (
    <div className="buddy-card">
      <div className="buddy-card__avatar-wrap">
        <Avatar initials={buddy.avatar} size={38} color={C.accent} />
        <span
          className={`buddy-card__status-dot buddy-card__status-dot--${buddy.online ? "online" : "offline"}`}
        />
      </div>

      <div className="buddy-card__info">
        <p className="buddy-card__name">{buddy.name}</p>
        <p className="buddy-card__goal">{buddy.goal}</p>
        <div className="buddy-card__skills">
          {buddy.skills.map((skill) => (
            <span key={skill} className="buddy-card__skill">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <Button variant="ghost" size="sm" className="buddy-card__connect-btn">
        + Kết nối
      </Button>
    </div>
  );
}
