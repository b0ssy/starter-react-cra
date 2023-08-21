export type Action =
  | { type: "app/SET_THEME_MODE"; themeMode: "light" | "dark" }
  | { type: "app/REFRESH_DASHBOARD" };
