import { Button } from "../ui";
import RoomCard from "./RoomCard";

import "../../styles/components/room/RoomList.scss";

export default function RoomList({ rooms }) {
  return (
    <div className="room-list">
      <div className="room-list__header">
        <span className="room-list__title">🏠 Study Rooms</span>
        <button type="button" className="room-list__more-btn">
          Xem tất cả →
        </button>
      </div>

      <div className="room-list__items">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      <Button variant="dashed" fullWidth className="room-list__create-btn">
        + Tạo phòng học mới
      </Button>
    </div>
  );
}
