'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Definición de tipos para los temas
export type ThemeType = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'cosmic';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  gradient: {
    from: string;
    via: string;
    to: string;
  };
}

// Definición de todos los temas disponibles
export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    background: 'bg-gray-50',
    surface: 'bg-white',
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    accent: 'bg-blue-500',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    hover: 'hover:bg-blue-50',
    gradient: {
      from: 'from-blue-400',
      via: 'via-blue-500',
      to: 'to-blue-600'
    }
  },
  dark: {
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    primary: 'bg-blue-500',
    secondary: 'bg-gray-700',
    accent: 'bg-blue-400',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-700',
    gradient: {
      from: 'from-blue-500',
      via: 'via-blue-600',
      to: 'to-blue-700'
    }
  },
  ocean: {
    background: 'bg-gradient-to-br from-cyan-50 to-blue-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    primary: 'bg-cyan-600',
    secondary: 'bg-teal-600',
    accent: 'bg-cyan-500',
    text: 'text-cyan-900',
    textSecondary: 'text-cyan-700',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-50',
    gradient: {
      from: 'from-cyan-400',
      via: 'via-blue-500',
      to: 'to-teal-600'
    }
  },
  sunset: {
    background: 'bg-gradient-to-br from-orange-50 to-red-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    primary: 'bg-orange-600',
    secondary: 'bg-red-600',
    accent: 'bg-orange-500',
    text: 'text-orange-900',
    textSecondary: 'text-orange-700',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-50',
    gradient: {
      from: 'from-orange-400',
      via: 'via-red-500',
      to: 'to-pink-600'
    }
  },
  forest: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-100',
    surface: 'bg-white/80 backdrop-blur-sm',
    primary: 'bg-green-600',
    secondary: 'bg-emerald-600',
    accent: 'bg-green-500',
    text: 'text-green-900',
    textSecondary: 'text-green-700',
    border: 'border-green-200',
    hover: 'hover:bg-green-50',
    gradient: {
      from: 'from-green-400',
      via: 'via-emerald-500',
      to: 'to-teal-600'
    }
  },
  cosmic: {
    background: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    surface: 'bg-purple-800/80 backdrop-blur-sm',
    primary: 'bg-purple-600',
    secondary: 'bg-indigo-600',
    accent: 'bg-purple-500',
    text: 'text-white',
    textSecondary: 'text-purple-200',
    border: 'border-purple-600',
    hover: 'hover:bg-purple-700/50',
    gradient: {
      from: 'from-purple-400',
      via: 'via-pink-500',
      to: 'to-indigo-600'
    }
  }
};

// Información descriptiva de los temas
export const themeInfo: Record<ThemeType, { name: string; description: string; icon: string }> = {
  light: { name: 'Claro', description: 'Tema limpio y minimalista', icon: '☀️' },
  dark: { name: 'Oscuro', description: 'Perfecto para usar de noche', icon: '🌙' },
  ocean: { name: 'Océano', description: 'Aires frescos del mar', icon: '🌊' },
  sunset: { name: 'Atardecer', description: 'Tonos cálidos del ocaso', icon: '🌅' },
  forest: { name: 'Bosque', description: 'Verdes naturales y relajantes', icon: '🌲' },
  cosmic: { name: 'Cósmico', description: 'Misterios del universo', icon: '🌌' }
};

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeColors: ThemeColors;
  availableThemes: ThemeType[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('light');

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('album-theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Aplicar tema al documento
  useEffect(() => {
    document.documentElement.className = `theme-${currentTheme}`;
    localStorage.setItem('album-theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themeColors: themes[currentTheme],
    availableThemes: Object.keys(themes) as ThemeType[]
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
