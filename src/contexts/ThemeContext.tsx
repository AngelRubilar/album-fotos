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
  glassCard: string;
  glassBg: string;
  glowAccent: string;
  gradientBg: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    mode: 'light',
    bg: 'bg-stone-50',
    cardBg: 'bg-white/60 backdrop-blur-xl',
    cardBorder: 'border border-white/60',
    cardShadow: 'shadow-lg shadow-black/[0.04]',
    sidebarBg: 'bg-white/40 backdrop-blur-2xl border-r border-white/50',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    border: 'border-black/[0.06]',
    navActive: 'bg-blue-600/80 backdrop-blur-sm text-white shadow-lg shadow-blue-600/20',
    navItem: 'text-gray-600 hover:bg-black/[0.04]',
    inputBg: 'bg-white/50 backdrop-blur-sm',
    inputBorder: 'border-gray-200/60',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-600',
    danger: 'text-red-500 hover:text-red-600',
    overlay: 'bg-black/60 backdrop-blur-2xl',
    glassCard: 'bg-white/70 backdrop-blur-2xl border border-white/80 shadow-xl shadow-black/[0.03]',
    glassBg: 'bg-white/30 backdrop-blur-xl',
    glowAccent: 'shadow-blue-500/20',
    gradientBg: 'bg-gradient-to-br from-blue-50/50 via-stone-50 to-purple-50/30',
  },
  dark: {
    mode: 'dark',
    bg: 'bg-[#0a0a0f]',
    cardBg: 'bg-white/[0.04] backdrop-blur-xl',
    cardBorder: 'border border-white/[0.08]',
    cardShadow: 'shadow-lg shadow-black/20',
    sidebarBg: 'bg-white/[0.02] backdrop-blur-2xl border-r border-white/[0.06]',
    text: 'text-white',
    textMuted: 'text-neutral-500',
    border: 'border-white/[0.06]',
    navActive: 'bg-blue-600/80 backdrop-blur-sm text-white shadow-lg shadow-blue-600/20',
    navItem: 'text-neutral-400 hover:bg-white/[0.05]',
    inputBg: 'bg-white/[0.06] backdrop-blur-sm',
    inputBorder: 'border-white/[0.1]',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500',
    danger: 'text-red-400 hover:text-red-300',
    overlay: 'bg-black/80 backdrop-blur-2xl',
    glassCard: 'bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-xl shadow-black/30',
    glassBg: 'bg-white/[0.03] backdrop-blur-xl',
    glowAccent: 'shadow-blue-500/10',
    gradientBg: 'bg-gradient-to-br from-blue-950/20 via-[#0a0a0f] to-purple-950/10',
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
