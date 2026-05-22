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

// Paleta "Editorial sereno": papel frío + tinta pizarra + acento verde petróleo.
export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    mode: 'light',
    bg: 'bg-[#f4f3f0]',
    cardBg: 'bg-[#fcfcfa]',
    cardBorder: 'border border-[#23262b]/[0.10]',
    cardShadow: 'shadow-[0_6px_26px_rgba(35,38,43,0.07)]',
    sidebarBg: 'bg-[#efeeea] border-r border-[#23262b]/[0.08]',
    text: 'text-[#23262b]',
    textMuted: 'text-[#767b80]',
    border: 'border-[#23262b]/[0.10]',
    navActive: 'bg-[#2f6b6b] text-white shadow-sm shadow-[#2f6b6b]/25',
    navItem: 'text-[#767b80] hover:bg-[#23262b]/[0.05]',
    inputBg: 'bg-[#fcfcfa]',
    inputBorder: 'border-[#23262b]/15',
    accent: 'text-[#2f6b6b]',
    accentBg: 'bg-[#2f6b6b]',
    danger: 'text-red-600 hover:text-red-700',
    overlay: 'bg-[#14171a]/70 backdrop-blur-xl',
    glassCard: 'bg-[#fcfcfa] border border-[#23262b]/[0.10] shadow-[0_6px_26px_rgba(35,38,43,0.07)]',
    glassBg: 'bg-[#f4f3f0]',
    glowAccent: 'shadow-[#2f6b6b]/20',
    gradientBg: 'bg-[#f4f3f0]',
  },
  dark: {
    mode: 'dark',
    bg: 'bg-[#14171a]',
    cardBg: 'bg-[#1d2125]',
    cardBorder: 'border border-[#e7e9ea]/[0.10]',
    cardShadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
    sidebarBg: 'bg-[#171a1d] border-r border-[#e7e9ea]/[0.07]',
    text: 'text-[#e7e9ea]',
    textMuted: 'text-[#8b9197]',
    border: 'border-[#e7e9ea]/[0.10]',
    navActive: 'bg-[#2f6b6b] text-white shadow-sm shadow-[#2f6b6b]/30',
    navItem: 'text-[#8b9197] hover:bg-[#e7e9ea]/[0.06]',
    inputBg: 'bg-[#e7e9ea]/[0.05]',
    inputBorder: 'border-[#e7e9ea]/[0.12]',
    accent: 'text-[#5fa3a0]',
    accentBg: 'bg-[#2f6b6b]',
    danger: 'text-red-400 hover:text-red-300',
    overlay: 'bg-[#0c0e10]/85 backdrop-blur-xl',
    glassCard: 'bg-[#1d2125] border border-[#e7e9ea]/[0.10] shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
    glassBg: 'bg-[#14171a]',
    glowAccent: 'shadow-[#2f6b6b]/15',
    gradientBg: 'bg-[#14171a]',
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
