import { colors as C } from "../../constants/theme";

import "../../styles/components/ui/LiveDot.scss";

export default function LiveDot({ size = 6, color = C.green }) {
  return (
    <span
      className="live-dot"
      style={{
        "--live-dot-size": `${size}px`,
        "--live-dot-color": color,
      }}
    />
  );
}
