import { useState, useEffect, createContext, useContext } from "react";
import React from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Apple-style theme resolution:
 * 1. System preference (prefers-color-scheme) — always wins if set
 * 2. Time-based: dark from 22:00–06:59, light otherwise
 */
function resolveTheme(): Theme {
  // 1. Respect OS-level preference
  if (typeof window !== "undefined" && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    // Only honour the media query if the OS has an explicit preference
    // (some browsers return "no-preference" — matchMedia reports false for dark in that case)
    if (mq.matches) return "dark";
    // If the browser explicitly supports the query and returns light, honour it
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  }
  // 2. Time-based fallback: dark 22:00–06:59, light otherwise
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7 ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(resolveTheme);

  // Apply class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Re-sync if OS preference changes while the tab is open
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
