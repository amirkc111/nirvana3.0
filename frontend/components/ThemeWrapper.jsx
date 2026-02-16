"use client";

import { useTheme } from '../contexts/ThemeContext';
import { useEffect } from 'react';

export default function ThemeWrapper({ children }) {
  const { theme, currentTheme } = useTheme();

  useEffect(() => {
    // Apply theme colors to CSS custom properties
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // Update CSS custom properties based on theme
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-hover', colors.hover);

    // Apply background based on theme
    if (theme === 'light') {
      document.body.className = document.body.className.replace(/bg-.*?(?=\s|$)/g, '');
      document.body.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-purple-50');
    } else if (theme === 'aurora') {
      document.body.className = document.body.className.replace(/bg-.*?(?=\s|$)/g, '');
      document.body.classList.add('bg-gradient-to-br', 'from-green-900', 'to-blue-900');
    } else if (theme === 'sunset') {
      document.body.className = document.body.className.replace(/bg-.*?(?=\s|$)/g, '');
      document.body.classList.add('bg-gradient-to-br', 'from-orange-900', 'to-pink-900');
    } else if (theme === 'moon') {
      document.body.className = document.body.className.replace(/bg-.*?(?=\s|$)/g, '');
      document.body.classList.add('bg-gradient-to-br', 'from-slate-900', 'to-blue-900');
    } else if (theme === 'star') {
      document.body.className = document.body.className.replace(/bg-.*?(?=\s|$)/g, '');
      document.body.classList.add('bg-gradient-to-br', 'from-yellow-900', 'to-orange-900');
    } else {
      // Default dark theme - allow globals.css to handle background
      document.body.className = document.body.className.replace(/bg-.*?(?=\s|$)/g, '');
      // document.body.classList.add('bg-black'); // RECOVERY: Removed to allow globals.css image
    }
  }, [theme, currentTheme]);

  return <>{children}</>;
}
