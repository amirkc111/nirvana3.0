"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import PersonalizedHoroscope from "./PersonalizedHoroscope";
import NepaliMiniCalendar from "./NepaliMiniCalendar";

export default function Hero() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [currentText, setCurrentText] = useState(0);
  const [videoError, setVideoError] = useState(false);

  const animatedWords = [
    t('astra'),
    t('you'),
    t('reliable')
  ];

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setVideoError(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % animatedWords.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <section
      className="relative pt-16 sm:pt-32 pb-8 sm:pb-16 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Content Section - Left Side */}
          <div className="w-full md:w-1/2">
            <p className="hidden md:block text-sm uppercase tracking-[0.3em] text-white/90">{t('heroSubtitle')}</p>
            <h1 className={`hidden md:flex mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent min-h-[4rem] flex-wrap items-center`}>
              <span className="whitespace-nowrap">{t('nirvanaIs')}&nbsp;</span>
              <span
                key={currentText}
                className="inline-block animate-bounce whitespace-nowrap"
                style={{
                  animation: 'fadeInScale 0.6s ease-out'
                }}
              >
                {animatedWords[currentText]}
              </span>
            </h1>
            <p className="hidden md:block mt-6 text-base/7 text-white/80 max-w-prose">
              {t('heroDescription')}
            </p>
            {/* Nepali Mini Calendar for Home Page - Mobile Only */}
            <div className="mt-4 w-full max-w-sm md:hidden">
              <NepaliMiniCalendar />
            </div>

            {/* PersonalizedHoroscope for logged-in users */}
            <div>
              <PersonalizedHoroscope />
            </div>
          </div>

          {/* Video Section - Right Side (Desktop Only) */}
          <div className="hidden md:flex w-full md:w-1/2 justify-center items-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentTheme.colors.primary} opacity-20 blur-3xl`} />
              <video
                className="relative w-full h-full object-contain mix-blend-screen z-10"
                src="/bgvid.mp4"
                autoPlay
                muted
                loop
                playsInline
                onError={handleVideoError}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


