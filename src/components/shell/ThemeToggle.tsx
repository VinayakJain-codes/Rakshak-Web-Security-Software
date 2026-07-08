'use client';

import { useTheme } from '../../providers/ThemeProvider';
import clsx from 'clsx';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={clsx(
        'p-2 rounded-full transition-colors active:opacity-80 flex items-center justify-center w-10 h-10',
        'hover:bg-surface-container-high text-on-surface-variant'
      )}
      title="Toggle Dark Mode"
    >
      <span className="material-symbols-outlined">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
