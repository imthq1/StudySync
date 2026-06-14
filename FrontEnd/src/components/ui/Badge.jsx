import "../../styles/components/ui/Badge.scss";

export default function Badge({ label, color }) {
  return (
    <span className="badge" style={{ "--badge-color": color }}>
      {label}
    </span>
  );
}
