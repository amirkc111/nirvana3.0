"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Available themes
export const themes = {
  dark: {
    name: 'Dark Cosmic',
    flag: '🌌',
    description: 'Deep space with purple and pink accents',
    colors: {
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-blue-500 to-purple-500',
      background: 'bg-black',
      surface: 'bg-white/10',
      text: 'text-white',
      textSecondary: 'text-white/70',
      border: 'border-white/20',
      hover: 'hover:bg-white/10'
    }
  },
  light: {
    name: 'Light Cosmic',
    flag: '☀️',
    description: 'Bright cosmic with light backgrounds',
    colors: {
      primary: 'from-blue-400 to-purple-400',
      secondary: 'from-pink-400 to-orange-400',
      background: 'bg-gradient-to-br from-blue-50 to-purple-50',
      surface: 'bg-white/80',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100'
    }
  },
  aurora: {
    name: 'Aurora',
    flag: '🌌',
    description: 'Green and blue aurora colors',
    colors: {
      primary: 'from-green-400 to-blue-500',
      secondary: 'from-cyan-400 to-teal-500',
      background: 'bg-gradient-to-br from-green-900 to-blue-900',
      surface: 'bg-white/10',
      text: 'text-white',
      textSecondary: 'text-white/70',
      border: 'border-white/20',
      hover: 'hover:bg-white/10'
    }
  },
  sunset: {
    name: 'Sunset',
    flag: '🌅',
    description: 'Warm orange and pink sunset colors',
    colors: {
      primary: 'from-orange-500 to-pink-500',
      secondary: 'from-yellow-400 to-red-500',
      background: 'bg-gradient-to-br from-orange-900 to-pink-900',
      surface: 'bg-white/10',
      text: 'text-white',
      textSecondary: 'text-white/70',
      border: 'border-white/20',
      hover: 'hover:bg-white/10'
    }
  },
  moon: {
    name: 'Moon',
    flag: '🌙',
    description: 'Silver and blue lunar colors',
    colors: {
      primary: 'from-slate-400 to-blue-400',
      secondary: 'from-gray-300 to-slate-500',
      background: 'bg-gradient-to-br from-slate-900 to-blue-900',
      surface: 'bg-white/10',
      text: 'text-white',
      textSecondary: 'text-white/70',
      border: 'border-white/20',
      hover: 'hover:bg-white/10'
    }
  },
  star: {
    name: 'Star',
    flag: '⭐',
    description: 'Gold and yellow stellar colors',
    colors: {
      primary: 'from-yellow-400 to-orange-500',
      secondary: 'from-amber-400 to-yellow-500',
      background: 'bg-gradient-to-br from-yellow-900 to-orange-900',
      surface: 'bg-white/10',
      text: 'text-white',
      textSecondary: 'text-white/70',
      border: 'border-white/20',
      hover: 'hover:bg-white/10'
    }
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nirvana-theme');
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('nirvana-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
    }
  };

  const getThemeColors = () => {
    return themes[theme]?.colors || themes.dark.colors;
  };

  const value = {
    theme,
    changeTheme,
    getThemeColors,
    currentTheme: themes[theme] || themes.dark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
