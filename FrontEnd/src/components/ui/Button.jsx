import { colors as C } from "../../constants/theme";

import "../../styles/components/ui/Button.scss";

export default function Button({
  children,
  onClick,
  variant = "primary",
  color = C.accent,
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      style={{ "--btn-color": color }}
      {...props}
    >
      {children}
    </button>
  );
}
