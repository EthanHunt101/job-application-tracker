import { useEffect, useState } from 'react';

const STORAGE_KEY = 'jobTrackerTheme';

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Tracks light/dark theme as an explicit user choice (persisted in
// localStorage) that overrides the OS-level preference. No stored choice
// means "follow the system," same as index.css's default behavior.
export function useTheme() {
  const [theme, setTheme] = useState(() => getStoredTheme() || 'system');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    try {
      if (theme === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    } catch {
      // localStorage unavailable - theme just won't persist across reloads
    }
  }, [theme]);

  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark());

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return { isDark, toggleTheme };
}
