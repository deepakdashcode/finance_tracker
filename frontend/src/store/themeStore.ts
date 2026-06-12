import { create } from "zustand";

type Theme = "light" | "dark" | "glass";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light" || stored === "glass") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("dark", "glass");
  if (theme !== "light") {
    document.documentElement.classList.add(theme);
  }
  localStorage.setItem("theme", theme);
}

const initial = getInitialTheme();
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initial,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggle: () =>
    set((state) => {
      let next: Theme = "light";
      if (state.theme === "light") next = "dark";
      else if (state.theme === "dark") next = "glass";
      else next = "light";
      applyTheme(next);
      return { theme: next };
    }),
}));
