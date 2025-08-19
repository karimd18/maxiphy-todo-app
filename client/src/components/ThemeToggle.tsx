'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    setDark(isDark);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = !dark;
    setDark(next);
    if (next) root.classList.add('dark'); else root.classList.remove('dark');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }

  if (!mounted) return null;
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="rounded-xl border border-border bg-card p-2 text-sm hover:bg-card/70"
      title="Toggle light/dark"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
