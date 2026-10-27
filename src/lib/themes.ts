export type Theme = {
  id: string;
  name: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
};

export const THEMES: Theme[] = [
  { id: "violet", name: "Violet", bg: "#f5f3ff", card: "#ffffff", text: "#1e1b4b", muted: "#6b6b8a", accent: "#6d28d9", accentText: "#ffffff" },
  { id: "midnight", name: "Midnight", bg: "#0f172a", card: "#1e293b", text: "#f1f5f9", muted: "#94a3b8", accent: "#38bdf8", accentText: "#0f172a" },
  { id: "sunset", name: "Sunset", bg: "#fff7ed", card: "#ffffff", text: "#431407", muted: "#9a5b3c", accent: "#ea580c", accentText: "#ffffff" },
  { id: "forest", name: "Forest", bg: "#ecfdf5", card: "#ffffff", text: "#064e3b", muted: "#4b7a68", accent: "#059669", accentText: "#ffffff" },
  { id: "rose", name: "Rose", bg: "#fff1f2", card: "#ffffff", text: "#4c0519", muted: "#9f5468", accent: "#e11d48", accentText: "#ffffff" },
  { id: "mono", name: "Mono", bg: "#fafafa", card: "#ffffff", text: "#0a0a0a", muted: "#737373", accent: "#0a0a0a", accentText: "#ffffff" },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
