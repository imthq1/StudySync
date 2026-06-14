import "../../styles/components/ui/Avatar.scss";

export default function Avatar({ initials, size = 36, color = "#6C8FFF" }) {
  return (
    <div
      className="avatar"
      style={{
        "--avatar-size": `${size}px`,
        "--avatar-color": color,
      }}
    >
      {initials}
    </div>
  );
}
