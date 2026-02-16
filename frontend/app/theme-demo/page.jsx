"use client";

import { useTheme, themes } from '../../contexts/ThemeContext';
import { useState } from 'react';

export default function ThemeDemo() {
  const { theme, changeTheme, currentTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    changeTheme(newTheme);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent mb-4`}>
            Theme Showcase
          </h1>
          <p className="text-white/80 text-lg">
            Experience the cosmic beauty of our astrological themes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(themes).map(([code, themeData]) => (
            <div
              key={code}
              onClick={() => handleThemeChange(code)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedTheme === code
                  ? 'border-white/50 shadow-2xl scale-105'
                  : 'border-white/20 hover:border-white/40 hover:scale-102'
              }`}
              style={{
                background: `linear-gradient(135deg, ${getThemeBackground(code)}, transparent)`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Theme Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{themeData.flag}</span>
                  <h3 className="text-xl font-semibold text-white">{themeData.name}</h3>
                </div>
                {selectedTheme === code && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Theme Description */}
              <p className="text-white/70 text-sm mb-4">{themeData.description}</p>

              {/* Color Preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeData.colors.primary}`}></div>
                  <span className="text-white/60 text-xs">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeData.colors.secondary}`}></div>
                  <span className="text-white/60 text-xs">Secondary</span>
                </div>
              </div>

              {/* Theme Preview Elements */}
              <div className="mt-4 space-y-2">
                <div className={`h-2 rounded-full bg-gradient-to-r ${themeData.colors.primary} opacity-60`}></div>
                <div className={`h-1 rounded-full bg-gradient-to-r ${themeData.colors.secondary} opacity-40`}></div>
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${themeData.colors.primary} opacity-80`}></div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${themeData.colors.secondary} opacity-60`}></div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${themeData.colors.primary} opacity-40`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Theme Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-2xl">{currentTheme.flag}</span>
            <span className="text-white font-medium">Current Theme: {currentTheme.name}</span>
          </div>
        </div>

        {/* Theme Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <h3 className="text-white font-semibold mb-2">Dynamic Colors</h3>
            <p className="text-white/70 text-sm">All components automatically adapt to your selected theme</p>
          </div>
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <h3 className="text-white font-semibold mb-2">Persistent Storage</h3>
            <p className="text-white/70 text-sm">Your theme preference is saved and remembered</p>
          </div>
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <h3 className="text-white font-semibold mb-2">Cosmic Themes</h3>
            <p className="text-white/70 text-sm">Each theme represents different cosmic energies</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getThemeBackground(themeCode) {
  const backgrounds = {
    dark: 'rgba(0, 0, 0, 0.8)',
    light: 'rgba(59, 130, 246, 0.1)',
    aurora: 'rgba(34, 197, 94, 0.1)',
    sunset: 'rgba(251, 146, 60, 0.1)',
    moon: 'rgba(148, 163, 184, 0.1)',
    star: 'rgba(251, 191, 36, 0.1)'
  };
  return backgrounds[themeCode] || backgrounds.dark;
}
