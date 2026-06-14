import { Button, LiveDot } from "../ui";

import "../../styles/components/room/RoomCard.scss";

export default function RoomCard({ room }) {
  const pct = room.members / room.max;

  return (
    <div
      className={`room-card${room.live ? " room-card--live" : ""}`}
      style={{ "--room-color": room.color }}
    >
      <div className="room-card__header">
        <span className="room-card__name">{room.name}</span>
        {room.live && (
          <span className="room-card__live-badge">
            <LiveDot size={5} />
            LIVE
          </span>
        )}
      </div>

      <p className="room-card__topic">{room.topic}</p>

      <div className="room-card__progress-row">
        <div className="room-card__progress-track">
          <div
            className="room-card__progress-fill"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <span className="room-card__members">
          {room.members}/{room.max}
        </span>
      </div>

      <Button
        variant={room.live ? "primary" : "outline"}
        color={room.color}
        size="sm"
        fullWidth
      >
        {room.live ? "Tham gia ngay" : "Xem phòng"}
      </Button>
    </div>
  );
}
