"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme, themes } from '../contexts/ThemeContext';
import { useWeather } from '../contexts/WeatherContext';
import AuthModal from './AuthModal';
import MembershipModal from './MembershipModal';
import { supabase } from '../lib/supabaseClient';
import { localizeDigits } from '../utils/localization';

const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  ne: { name: 'नेपाली', flag: '🇳🇵' },
  fi: { name: 'Suomi', flag: '🇫🇮' }
};

const zodiacSigns = [
  { name: 'मेष', en: 'Aries', file: 'aries.png', icon: '♈' },
  { name: 'वृष', en: 'Taurus', file: 'taurus.png', icon: '♉' },
  { name: 'मिथुन', en: 'Gemini', file: 'gemini.png', icon: '♊' },
  { name: 'कर्कट', en: 'Cancer', file: 'cancer.png', icon: '♋' },
  { name: 'सिंह', en: 'Leo', file: 'leo.png', icon: '♌' },
  { name: 'कन्या', en: 'Virgo', file: 'virgo.png', icon: '♍' },
  { name: 'तुला', en: 'Libra', file: 'libra.png', icon: '♎' },
  { name: 'वृश्चिक', en: 'Scorpio', file: 'scorpio.png', icon: '♏' },
  { name: 'धनु', en: 'Sagittarius', file: 'sagittarius.png', icon: '♐' },
  { name: 'मकर', en: 'Capricorn', file: 'capricorn.png', icon: '♑' },
  { name: 'कुम्भ', en: 'Aquarius', file: 'aquarius.png', icon: '♒' },
  { name: 'मीन', en: 'Pisces', file: 'pisces.png', icon: '♓' }
];

export default function Navbar() {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, changeTheme, currentTheme } = useTheme();
  const { weather } = useWeather();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isZodiacOpen, setIsZodiacOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedZodiac, setSelectedZodiac] = useState(0);
  const [userPreferences, setUserPreferences] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    selectedVoice: null,
    voices: []
  });
  const [isMobileProfileExpanded, setIsMobileProfileExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Check authentication state
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load user preferences when user changes
  useEffect(() => {
    if (user) {
      loadUserPreferences(user.id);
    } else {
      setUserPreferences(null);
      setSelectedZodiac(0);
    }
  }, [user]);

  // Initialize voice settings
  useEffect(() => {
    const initializeVoiceSettings = () => {
      if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const loadVoices = () => {
          const voices = synthesis.getVoices();
          setVoiceSettings(prev => ({
            ...prev,
            voices: voices,
            selectedVoice: voices.find(v => v.name.includes('Samantha')) || voices[0] || null
          }));
        };

        if (synthesis.getVoices().length > 0) {
          loadVoices();
        } else {
          synthesis.onvoiceschanged = loadVoices;
        }
      }
    };

    initializeVoiceSettings();
  }, []);

  // Load voice settings from localStorage
  useEffect(() => {
    const loadVoiceSettings = () => {
      const savedSettings = localStorage.getItem('voiceSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setVoiceSettings(prev => ({
            ...prev,
            ...settings
          }));
        } catch (error) {
          console.error('Error loading voice settings:', error);
        }
      }
    };

    loadVoiceSettings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserPreferences(null);
  };

  // Load user preferences
  const loadUserPreferences = async (userId) => {
    try {
      // Try to load user preferences with better error handling
      const { data, error } = await supabase
        .rpc('get_user_preferences', { user_uuid: userId });

      if (error) {
        console.warn('User preferences RPC not available, using fallback:', error.message);
        // Fallback: try direct table access
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fallbackError) {
          console.warn('Fallback user preferences also failed:', fallbackError.message);
          // Set default preferences
          setUserPreferences({
            zodiac_sign: 0,
            theme_preference: 'dark_cosmic',
            language_preference: 'en',
            membership: 'free'
          });
          setSelectedZodiac(0);
          return;
        }

        if (fallbackData) {
          setUserPreferences(fallbackData);
          setSelectedZodiac(fallbackData.zodiac_sign || 0);
        }
        return;
      }

      if (data && data.length > 0) {
        const prefs = data[0];
        setUserPreferences(prefs);
        setSelectedZodiac(prefs.zodiac_sign || 0);
      } else {
        // Set default preferences if no data found
        setUserPreferences({
          zodiac_sign: 0,
          theme_preference: 'dark_cosmic',
          language_preference: 'en',
          membership: 'free'
        });
        setSelectedZodiac(0);
      }
    } catch (error) {
      console.warn('Error loading user preferences, using defaults:', error.message);
      // Set default preferences on error
      setUserPreferences({
        zodiac_sign: 0,
        theme_preference: 'dark_cosmic',
        language_preference: 'en',
        membership: 'free'
      });
      setSelectedZodiac(0);
    }
  };

  // Save zodiac selection to database
  const saveZodiacSelection = async (zodiacIndex) => {
    if (!user) return;

    try {
      const zodiacSign = zodiacSigns[zodiacIndex];
      const { data, error } = await supabase
        .rpc('upsert_user_preferences', {
          user_uuid: user.id,
          zodiac_sign_param: zodiacIndex,
          zodiac_sign_name_param: zodiacSign.name,
          zodiac_sign_english_param: zodiacSign.en,
          zodiac_sign_icon_param: zodiacSign.icon
        });

      if (error) {
        console.warn('RPC save failed, trying direct table update:', error.message);
        // Fallback: try direct table update
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            zodiac_sign: zodiacIndex,
            zodiac_sign_name: zodiacSign.name,
            zodiac_sign_english: zodiacSign.en,
            zodiac_sign_icon: zodiacSign.icon,
            updated_at: new Date().toISOString()
          })
          .select();

        if (fallbackError) {
          console.warn('Fallback save also failed:', fallbackError.message);
          // Still update local state even if save fails
          setUserPreferences(prev => ({
            ...prev,
            zodiac_sign: zodiacIndex,
            zodiac_sign_name: zodiacSign.name,
            zodiac_sign_english: zodiacSign.en,
            zodiac_sign_icon: zodiacSign.icon,
            updated_at: new Date().toISOString()
          }));
        } else {
          console.log('Zodiac selection saved successfully via fallback');
          // Update local state
          setUserPreferences(prev => ({
            ...prev,
            zodiac_sign: zodiacIndex,
            zodiac_sign_name: zodiacSign.name,
            zodiac_sign_english: zodiacSign.en,
            zodiac_sign_icon: zodiacSign.icon,
            updated_at: new Date().toISOString()
          }));
        }
      } else {
        console.log('Zodiac selection saved successfully');
        // Update local state
        setUserPreferences(prev => ({
          ...prev,
          zodiac_sign: zodiacIndex,
          zodiac_sign_name: zodiacSign.name,
          zodiac_sign_english: zodiacSign.en,
          zodiac_sign_icon: zodiacSign.icon,
          updated_at: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error saving zodiac selection:', error);
    }
  };

  // Voice settings management
  const handleVoiceToggle = () => {
    const newSettings = {
      ...voiceSettings,
      enabled: !voiceSettings.enabled
    };
    setVoiceSettings(newSettings);
    localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
  };

  const handleVoiceSelection = (voice) => {
    const newSettings = {
      ...voiceSettings,
      selectedVoice: voice
    };
    setVoiceSettings(newSettings);
    localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
        setIsLanguageOpen(false); // Close language dropdown when profile closes
        setIsThemeOpen(false); // Close theme dropdown when profile closes
        setIsZodiacOpen(false); // Close zodiac dropdown when profile closes
        setIsVoiceOpen(false); // Close voice dropdown when profile closes
      }
      if (isLanguageOpen && !event.target.closest('.language-dropdown') && !event.target.closest('.profile-dropdown')) {
        setIsLanguageOpen(false);
      }
      if (isThemeOpen && !event.target.closest('.theme-dropdown') && !event.target.closest('.profile-dropdown')) {
        setIsThemeOpen(false);
      }
      if (isZodiacOpen && !event.target.closest('.zodiac-dropdown') && !event.target.closest('.profile-dropdown')) {
        setIsZodiacOpen(false);
      }
      if (isVoiceOpen && !event.target.closest('.voice-dropdown') && !event.target.closest('.profile-dropdown')) {
        setIsVoiceOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isLanguageOpen, isThemeOpen, isZodiacOpen, isVoiceOpen]);

  const pathname = usePathname();

  // Hide navbar on vedicjyotish page and chat detail pages (but not the main chat/guru list)
  if (pathname === '/vedicjyotish' || pathname?.startsWith('/chat/')) {
    return null;
  }

  return (
    <>

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
        ? 'bg-[#030014]/70 backdrop-blur-xl border-b border-white/10'
        : 'bg-transparent'
        }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">

              <Link href="/" className="flex items-center gap-3">
                <Image src="/an.png" alt="Nirvana Astro" width={40} height={40} className="rounded-full object-contain" priority />
                <span className="font-bold tracking-tight text-xl sm:text-2xl text-white">Nirvana Astro</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link href="/" className="text-white/80 hover:text-white transition-colors font-medium">{t('home')}</Link>
              <Link href="/kundli" className="text-white/80 hover:text-white transition-colors font-medium">{t('kundli')}</Link>
              <Link href="/horoscope" className="text-white/80 hover:text-white transition-colors font-medium">{t('horoscope')}</Link>
              <Link href="/panchang" className="text-white/80 hover:text-white transition-colors font-medium">{t('panchang')}</Link>
              <Link href="/calendar" className="text-white/80 hover:text-white transition-colors font-medium">{t('calendar')}</Link>
              <Link href="/weather" className="text-white/80 hover:text-white transition-colors font-medium">{t('weather')}</Link>
              <Link href="/astro-clock" className="text-white/80 hover:text-white transition-colors font-medium">{t('astroClock')}</Link>
            </nav>
            <div className="flex items-center gap-4">
              {/* Authentication Section */}
              {isLoading ? (
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                /* User Profile Dropdown */
                <div className="flex items-center">
                  <div className="relative profile-dropdown flex items-center">
                    {weather?.temp !== null && weather?.temp !== undefined && (
                      <div className="flex items-center mr-2 px-2 py-1">
                        <span className="text-white text-xs font-bold">{localizeDigits(weather?.temp, language)}°C</span>
                      </div>
                    )}
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center justify-center p-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200"
                    >
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-lg">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-white text-base font-bold">
                              {(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0])?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl z-50">
                        <div className="py-2">
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0">
                                {user.user_metadata?.avatar_url ? (
                                  <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover shadow-lg"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg font-bold">
                                      {(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0])?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm font-medium">
                                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                                  </span>
                                  {userPreferences?.membership && userPreferences?.membership !== 'free' && (
                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-[9px] font-bold text-white uppercase tracking-tighter">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                <span className="text-white/70 text-xs">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                setIsMembershipOpen(true);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              {t('membership')}
                            </button>

                            <div className="relative theme-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsThemeOpen(!isThemeOpen);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.317l.707-.707M3.988 3.988l.707.707m-.707 15.325l.707-.707m15.325-.707l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                                </svg>
                                <span>{t('theme')}</span>
                                <span className="ml-auto text-xs text-white/60">
                                  {currentTheme.flag} {currentTheme.name}
                                </span>
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {isThemeOpen && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-black/95 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-50">
                                  <div className="py-1">
                                    {Object.entries(themes).map(([code, themeData]) => (
                                      <button
                                        key={code}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          changeTheme(code);
                                          setIsThemeOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-3 ${theme === code
                                          ? 'bg-white/10 text-white'
                                          : 'text-white/70 hover:text-white hover:bg-white/5'
                                          }`}
                                      >
                                        <span className="text-sm">{themeData.flag}</span>
                                        <span>{themeData.name}</span>
                                        {theme === code && (
                                          <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="relative language-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsLanguageOpen(!isLanguageOpen);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 018 10.5c0-7.87 4.32-11.34 9.5-11.34C22.68 0 27 3.47 27 11.34c0 7.87-4.32 11.34-9.5 11.34A18.022 18.022 0 0110.048 14.5M11 19l-2 2-2-2" />
                                </svg>
                                <span>{t('language')}</span>
                                <span className="ml-auto text-xs text-white/60">
                                  {languages[language].flag} {languages[language].name}
                                </span>
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {isLanguageOpen && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-black/95 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-50">
                                  <div className="py-1">
                                    {Object.entries(languages).map(([code, lang]) => (
                                      <button
                                        key={code}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          changeLanguage(code);
                                          setIsLanguageOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-3 ${language === code
                                          ? 'bg-white/10 text-white'
                                          : 'text-white/70 hover:text-white hover:bg-white/5'
                                          }`}
                                      >
                                        <span className="text-sm">{lang.flag}</span>
                                        <span>{lang.name}</span>
                                        {language === code && (
                                          <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="relative zodiac-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsZodiacOpen(!isZodiacOpen);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>{t('horoscope')}</span>
                                <span className="ml-auto text-xs text-white/60 flex items-center gap-1">
                                  <Image
                                    src={`/zodiac/${zodiacSigns[selectedZodiac].file}`}
                                    alt={zodiacSigns[selectedZodiac].name}
                                    width={12}
                                    height={12}
                                    className="w-3 h-3 object-contain"
                                  />
                                  {zodiacSigns[selectedZodiac].name}
                                </span>
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {isZodiacOpen && (
                                <div className="absolute right-0 top-full mt-1 w-64 bg-black/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-xl z-50">
                                  <div className="p-1">
                                    <div className="grid grid-cols-3 gap-1">
                                      {zodiacSigns.map((sign, index) => (
                                        <button
                                          key={sign.en}
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            setSelectedZodiac(index);
                                            setIsZodiacOpen(false);
                                            setIsProfileOpen(false);
                                            // Save to database
                                            await saveZodiacSelection(index);
                                          }}
                                          className={`p-2 text-center transition-all duration-200 rounded-md ${selectedZodiac === index
                                            ? 'bg-purple-500/30 text-white border border-purple-400/50'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }`}
                                          title={`${sign.name} (${sign.en})`}
                                        >
                                          <div className="w-6 h-6 mb-1 mx-auto">
                                            <Image
                                              src={`/zodiac/${sign.file}`}
                                              alt={sign.name}
                                              width={24}
                                              height={24}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                          <div className="text-xs font-medium truncate">{sign.name}</div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>


                          </div>

                          {/* Logout Button */}
                          <div className="border-t border-white/10 pt-1">
                            <button
                              onClick={() => {
                                handleLogout();
                                setIsProfileOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              {t('logout')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {weather?.temp !== null && weather?.temp !== undefined && (
                    <div className="flex items-center px-2 py-1">
                      <span className="text-white text-xs font-bold">{localizeDigits(weather?.temp, language)}°C</span>
                    </div>
                  )}
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden xs:inline">{t('login')}</span>
                  </button>
                </div>
              )}

              {weather?.temp !== null && weather?.temp !== undefined && (
                <div className="hidden xs:flex sm:hidden items-center px-2 py-1 mr-2">
                  <span className="text-white text-xs font-bold">{localizeDigits(weather?.temp, language)}°C</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-[9999] md:hidden transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-[#030014]/40 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Sidebar Content */}
        <div
          className={`absolute left-0 top-0 h-full w-[85%] max-w-[320px] border-r border-white/10 transition-transform duration-500 ease-out transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } overflow-y-auto flex flex-col shadow-2xl`}
          style={{ backgroundColor: '#030014' }} // Force solid background
        >
          {/* Cosmic Background Elements */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-600/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-40 left-10 w-40 h-40 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>


          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Image src="/an.png" alt="Nirvana" width={32} height={32} className="rounded-full object-contain" />
              <span className="font-bold text-lg text-white">Nirvana</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Section */}
          <div className="relative flex-1 px-4 py-4">
            <div className="flex flex-col gap-2">
              {[
                { name: t('home'), href: '/', icon: '🏠' },
                { name: t('kundli'), href: '/kundli', icon: '✨' },
                { name: t('horoscope'), href: '/horoscope', icon: '🔮' },
                { name: t('panchang'), href: '/panchang', icon: '📅' },
                { name: t('calendar'), href: '/calendar', icon: '🗓️' },
                { name: t('weather'), href: '/weather', icon: '🌡️' },
                { name: t('astroClock'), href: '/astro-clock', icon: '🕒' },
                { name: t('cosmicNews'), href: '/news', icon: '📰' }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`relative flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group overflow-hidden
                      ${pathname === link.href
                      ? "bg-gradient-to-r from-purple-600/30 to-transparent text-white border-l-2 border-purple-500"
                      : "text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                    }`}
                >
                  {/* Icon */}
                  <span className={`text-xl transition-transform duration-300 ${pathname === link.href ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {link.icon}
                  </span>

                  {/* Text */}
                  <span className={`text-base font-medium tracking-wide ${pathname === link.href ? 'text-white' : 'group-hover:text-white'}`}>
                    {link.name}
                  </span>

                  {/* Subtle Glow for Active */}
                  {pathname === link.href && (
                    <div className="absolute inset-0 bg-purple-500/5 blur-sm -z-10"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={() => setIsMembershipOpen(false)}
        user={user}
        onMemberUpdate={() => loadUserPreferences(user?.id)}
      />
    </>
  );
}
