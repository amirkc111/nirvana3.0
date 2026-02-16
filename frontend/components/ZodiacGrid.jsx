"use client";

import { useState, useEffect, useRef } from "react";
import SectionHeading from "./SectionHeading";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import NewsWidget from "./NewsWidget";
import PanchangWidget from "./PanchangWidget";
import WeatherWidget from "./WeatherWidget";

const ZODIAC_SIGNS = [
  { name: 'मेष', en: 'Aries', file: 'aries.png' },
  { name: 'वृष', en: 'Taurus', file: 'taurus.png' },
  { name: 'मिथुन', en: 'Gemini', file: 'gemini.png' },
  { name: 'कर्कट', en: 'Cancer', file: 'cancer.png' },
  { name: 'सिंह', en: 'Leo', file: 'leo.png' },
  { name: 'कन्या', en: 'Virgo', file: 'virgo.png' },
  { name: 'तुला', en: 'Libra', file: 'libra.png' },
  { name: 'वृश्चिक', en: 'Scorpio', file: 'scorpio.png' },
  { name: 'धनु', en: 'Sagittarius', file: 'sagittarius.png' },
  { name: 'मकर', en: 'Capricorn', file: 'capricorn.png' },
  { name: 'कुम्भ', en: 'Aquarius', file: 'aquarius.png' },
  { name: 'मीन', en: 'Pisces', file: 'pisces.png' },
];

export default function ZodiacGrid() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchHoroscope = async () => {
      setLoading(true);
      try {
        const sign = ZODIAC_SIGNS[selectedIdx];
        const res = await fetch(`/api/rashifal?sign=${encodeURIComponent(sign.name)}&period=daily`);
        const json = await res.json();
        setHoroscope(json.rashifal || t('horoscopeSubtitle'));
      } catch (err) {
        setHoroscope(t('horoscopeSubtitle'));
      } finally {
        setLoading(false);
      }
    };

    fetchHoroscope();
  }, [selectedIdx, t]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSign = ZODIAC_SIGNS[selectedIdx];

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-[95rem] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

          {/* Column 1: Split - Horoscope & Weather */}
          <div className="flex flex-col gap-6 h-full">

            {/* Row 1: Horoscope Card */}
            <div className={`rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-2xl px-5 py-4 shadow-2xl transition-all duration-500 flex-grow min-h-[160px] flex flex-col justify-between overflow-hidden relative`}>

              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                  {t('dailyHoroscope')}
                </span>
                <button onClick={() => setIsOpen(!isOpen)} className="text-xl hover:scale-110 transition-transform">
                  {isOpen ? '✕' : '✨'}
                </button>
              </div>

              <div className="flex-grow flex flex-col relative" ref={dropdownRef}>

                {/* View State: Toggle between Content and Selector */}
                {isOpen ? (
                  /* Selector View (Scrollable Grid) */
                  <div className="absolute inset-0 z-10 bg-[#0a0118]/95 backdrop-blur-xl rounded-xl overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 gap-1 p-2">
                      {ZODIAC_SIGNS.map((s, idx) => (
                        <button
                          key={s.en}
                          onClick={() => {
                            setSelectedIdx(idx);
                            setIsOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${selectedIdx === idx
                            ? 'bg-purple-600/20 text-white border border-purple-500/30'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          <div className="w-6 h-6 p-0.5">
                            <img src={`/zodiac/${s.file}`} alt={s.en} className="w-full h-full object-contain" />
                          </div>
                          <div className="text-left flex-grow">
                            <div className="text-xs font-semibold">{s.en}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest leading-none">{s.name}</div>
                          </div>
                          {selectedIdx === idx && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Content View */
                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                    {/* Selected Sign Display */}
                    <button
                      onClick={() => setIsOpen(true)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 group mb-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center p-1 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                        <img src={`/zodiac/${currentSign.file}`} alt={currentSign.en} className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left flex-grow">
                        <div className="text-sm font-bold tracking-wide">{currentSign.en}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest leading-none">{currentSign.name}</div>
                      </div>
                      <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Text */}
                    <div className="flex-grow overflow-y-auto pr-1">
                      {loading || !horoscope ? (
                        <div className="space-y-3 py-1 animate-pulse">
                          <div className="h-3 bg-white/5 rounded-full w-full"></div>
                          <div className="h-3 bg-white/5 rounded-full w-11/12"></div>
                          <div className="h-3 bg-white/5 rounded-full w-4/5"></div>
                          <div className="h-3 bg-white/5 rounded-full w-5/6"></div>
                        </div>
                      ) : (
                        <p className={`${currentTheme.colors.text} leading-relaxed text-base animate-in fade-in duration-500`}>
                          {horoscope
                            .split(/(शुभ रंग|शुभ अंक|शुभ बार|शुभ महिना)/)[0]
                            .replace(/(आजको|यो साताको)\s*$/, '')
                            .trim()}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end pt-2 mt-auto">
                      <a href="/horoscope" className="text-xs uppercase font-bold text-white/30 hover:text-white transition-colors">
                        {t('viewFullHoroscope')} →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Weather Widget */}
            <div className="h-auto">
              <WeatherWidget />
            </div>
          </div>

          {/* Other Columns... */}
          <div className="h-full">
            <NewsWidget />
          </div>

          <div className="h-full">
            <PanchangWidget />
          </div>

        </div>
      </div>
    </section>
  );
}
