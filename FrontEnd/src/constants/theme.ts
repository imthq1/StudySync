export const colors = {
  bg: "#0D0F14",
  surface: "#13161D",
  card: "#181C26",
  border: "#252A38",
  accent: "#6C8FFF",
  accentSoft: "#1A2240",
  green: "#3ECFA0",
  greenSoft: "#0D2820",
  amber: "#F5A623",
  amberSoft: "#2A1E08",
  pink: "#FF6B9D",
  pinkSoft: "#2A0F1E",
  textPrimary: "#EDF0FA",
  textSecondary: "#7A82A0",
  textMuted: "#3E4560",
} as const;

export const fonts = {
  sans: "'DM Sans', sans-serif",
  serif: "'Fraunces', serif",
} as const;

export type ThemeColors = typeof colors;
export type ThemeFonts = typeof fonts;
