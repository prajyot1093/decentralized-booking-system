import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

// Context to manage light/dark theme with an "anime blast" transition effect.
const ThemeModeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
});

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('theme-mode') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Persist + body class
  useEffect(() => {
    try { localStorage.setItem('theme-mode', mode); } catch {}
    document.body.classList.toggle('light-mode', mode === 'light');
    document.body.classList.toggle('dark-mode', mode === 'dark');
  }, [mode]);

  // Creates a radial blast wave element at coordinates (x,y)
  const spawnBlast = useCallback((x, y, nextMode) => {
    // Respect reduced motion or perf mode
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || document.body.classList.contains('perf-mode')) return;
    const blast = document.createElement('span');
    blast.className = `theme-blast ${nextMode}`; // allow different palette per target mode
    const diameter = Math.max(window.innerWidth, window.innerHeight) * 2; // ensure covers screen
    const scaleFactor = diameter / 20; // element base is 20px
    blast.style.left = `${x}px`;
    blast.style.top = `${y}px`;
    blast.style.setProperty('--blast-scale', scaleFactor.toString());
    document.body.appendChild(blast);
    // Remove after animation ends
    blast.addEventListener('animationend', () => blast.remove());
  }, []);

  const toggleTheme = useCallback((x, y) => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      // Fallback coordinates (center) if not provided
      const cx = typeof x === 'number' ? x : window.innerWidth / 2;
      const cy = typeof y === 'number' ? y : window.innerHeight / 2;
      requestAnimationFrame(() => spawnBlast(cx, cy, next));
      return next;
    });
  }, [spawnBlast]);

  const value = { mode, toggleTheme };
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => useContext(ThemeModeContext);
