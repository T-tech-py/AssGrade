'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem('gradassess-theme') as Theme | null;
    const preferredDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = stored ?? (preferredDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('gradassess-theme', nextTheme);
    setTheme(nextTheme);
  };

  if (!mounted) {
    return <div className="landing-dark-button h-10 w-10 rounded-full" />;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="landing-dark-button flex h-10 w-10 items-center justify-center rounded-full transition"
    >
      <span className="text-base">{theme === 'light' ? '◐' : '☼'}</span>
    </motion.button>
  );
}
