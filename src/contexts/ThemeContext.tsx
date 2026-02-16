'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  mode: 'light' | 'dark';
  bg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  sidebarBg: string;
  text: string;
  textMuted: string;
  border: string;
  navActive: string;
  navItem: string;
  inputBg: string;
  inputBorder: string;
  accent: string;
  accentBg: string;
  danger: string;
  overlay: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    mode: 'light',
    bg: 'bg-stone-100',
    cardBg: 'bg-white',
    cardBorder: 'border border-black/[0.04]',
    cardShadow: 'shadow-sm',
    sidebarBg: 'bg-stone-100/90 backdrop-blur-2xl border-r border-black/[0.03]',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    border: 'border-black/[0.06]',
    navActive: 'bg-blue-600 text-white',
    navItem: 'text-gray-600 hover:bg-black/[0.04]',
    inputBg: 'bg-gray-100',
    inputBorder: 'border-gray-200',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-600',
    danger: 'text-red-500 hover:text-red-600',
    overlay: 'bg-black/60 backdrop-blur-2xl',
  },
  dark: {
    mode: 'dark',
    bg: 'bg-neutral-950',
    cardBg: 'bg-neutral-900',
    cardBorder: 'border border-white/[0.06]',
    cardShadow: 'shadow-none',
    sidebarBg: 'bg-neutral-950 border-r border-white/[0.03]',
    text: 'text-white',
    textMuted: 'text-neutral-500',
    border: 'border-white/[0.06]',
    navActive: 'bg-blue-600 text-white',
    navItem: 'text-neutral-400 hover:bg-white/[0.05]',
    inputBg: 'bg-neutral-800',
    inputBorder: 'border-neutral-700',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500',
    danger: 'text-red-400 hover:text-red-300',
    overlay: 'bg-black/80 backdrop-blur-2xl',
  },
};

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  t: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('light');

  useEffect(() => {
    const saved = localStorage.getItem('album-theme') as ThemeType;
    if (saved && themes[saved]) {
      setCurrentTheme(saved);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.className = currentTheme === 'dark' ? 'dark' : '';
    localStorage.setItem('album-theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeType) => setCurrentTheme(theme);
  const toggleTheme = () => setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    toggleTheme,
    t: themes[currentTheme],
    isDark: currentTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
