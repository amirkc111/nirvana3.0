"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';

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

export default function PersonalizedHoroscope() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
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
      setLoading(false);
    }
  }, [user]);

  // Load horoscope data when preferences are available
  useEffect(() => {
    if (userPreferences && userPreferences.zodiac_sign !== undefined) {
      loadHoroscopeData(userPreferences.zodiac_sign);
    }
  }, [userPreferences]);

  // Load user preferences
  const loadUserPreferences = async (userId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_preferences', { user_uuid: userId });

      if (error) {
        console.error('Error loading user preferences:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const prefs = data[0];
        setUserPreferences(prefs);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setLoading(false);
    }
  };

  // Load horoscope data for the selected zodiac sign
  const loadHoroscopeData = async (zodiacIndex) => {
    try {
      setLoading(true);
      const zodiacSign = zodiacSigns[zodiacIndex];
      console.log('Loading horoscope for:', zodiacSign.name);

      const response = await fetch(`/api/rashifal?sign=${zodiacSign.name}&period=daily`);
      const data = await response.json();

      console.log('Horoscope API response:', data);

      if (data && data.rashifal) {
        setHoroscopeData({
          text: data.rashifal,
          time_period: data.time_period || 'daily'
        });
      } else {
        console.log('No horoscope data received');
        setHoroscopeData(null);
      }
    } catch (error) {
      console.error('Error loading horoscope data:', error);
      setHoroscopeData(null);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is not logged in or no preferences
  if (!user || !userPreferences) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="mt-0 sm:mt-8">
        <div className="p-4 sm:p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10"></div>
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-white/5 rounded-full w-1/3"></div>
              <div className="h-3 bg-white/5 rounded-full w-1/4"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-white/5 rounded-full w-full"></div>
            <div className="h-4 bg-white/5 rounded-full w-full"></div>
            <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
            <div className="flex gap-2 mt-6">
              <div className="h-8 bg-white/5 rounded-xl w-24"></div>
              <div className="h-8 bg-white/5 rounded-xl w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderFormattedHoroscope = (text, period = 'daily') => {
    if (!text) return null;

    const sections = [
      { id: 'overview', name: t('overview'), icon: '✨' },
      { id: 'career', name: t('career'), icon: '💼' },
      { id: 'love', name: t('love'), icon: '❤️' },
      { id: 'health', name: t('health'), icon: '🏥' },
      { id: 'education', name: t('education'), icon: '📚' },
      { id: 'remedy', name: t('remedy'), icon: '🧘' }
    ];

    const majorSections = sections.map(s => s.name);
    const subTraits = [t('luckyColor'), t('luckyNumber'), t('luckyBar'), t('luckyMonth')];
    const months = ['वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मङ्सिर', 'पुस', 'माघ', 'फागुन', 'चैत'];

    const allKeywords = [...majorSections, ...subTraits, ...months];
    const regex = new RegExp(`(${allKeywords.join('|')})`, 'g');
    const parts = text.split(regex);

    if (parts.length <= 1) {
      const cleaned = text.replace(/(आजको|यो साताको)\s*$/, '').trim();
      return <p className="text-sm opacity-90 leading-relaxed text-white/80">{cleaned}</p>;
    }

    const traits = [];
    const groupedContent = { overview: '' };
    let currentSection = 'overview';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const isMonth = months.includes(part);
      const isMajor = majorSections.includes(part);
      const isTrait = subTraits.includes(part);

      if (isMajor) {
        currentSection = sections.find(s => s.name === part)?.id || 'overview';
        if (!groupedContent[currentSection]) groupedContent[currentSection] = '';
        continue;
      }

      if (isTrait) {
        let content = (parts[i + 1] || '').trim().replace(/^[:\s,.-]+/, '');
        if (part === 'शुभ महिना') {
          let lookAhead = i + 2;
          while (lookAhead < parts.length) {
            const p = parts[lookAhead];
            if (months.includes(p) || /^[\s, र]+$/.test(p)) {
              content += p;
              lookAhead++;
            } else break;
          }
          i = lookAhead - 1;
        } else {
          i++;
        }
        const cleanedContent = content.replace(/\s*(हो भने|रहेको छ।|रहेका छन्।|रहेकी छिन्।|छ।|छ)\s*$/, '').trim();
        traits.push({ name: part, content: cleanedContent });
        continue;
      }

      const cleanedPart = part.trim().replace(/^[:\s,.-]+/, '');
      if (cleanedPart) {
        if (isMonth) {
          const nextPart = (parts[i + 1] || '').trim().replace(/^[:\s,.-]+/, '');
          const monthText = part + ': ' + nextPart;
          groupedContent[currentSection] = (groupedContent[currentSection] ? groupedContent[currentSection] + ' ' : '') + monthText;
          i++;
        } else {
          groupedContent[currentSection] = (groupedContent[currentSection] ? groupedContent[currentSection] + ' ' : '') + cleanedPart;
        }
      }
    }

    if (period !== 'yearly') {
      const combinedText = Object.values(groupedContent).join(' ').replace(/(आजको|यो साताको)\s*$/, '').trim();
      return (
        <div className="formatted-horoscope">
          {combinedText && (
            <p className="text-sm opacity-90 leading-relaxed mb-4 text-justify text-white/80">
              {combinedText}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {traits.filter(t => t.name === 'शुभ रंग' || t.name === 'शुभ अंक').map((trait, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-md">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-tight">{trait.name}:</span>
                <span className="text-xs font-semibold text-white/90">{trait.content}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Yearly Layout: Categorized
    return (
      <div className="formatted-horoscope space-y-6">
        {sections.map(section => {
          const content = groupedContent[section.id]?.trim();
          if (!content) return null;
          return (
            <div key={section.id} className="relative pl-6 border-l border-white/10">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{section.icon}</span>
                <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400">{section.name}</h4>
              </div>
              <p className="text-sm opacity-85 leading-relaxed text-justify text-white/80">
                {content}
              </p>
            </div>
          );
        })}

        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
          {traits.filter(t => t.name === 'शुभ रंग' || t.name === 'शुभ अंक').map((trait, idx) => (
            <div key={idx} className="inline-flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 shadow-sm backdrop-blur-md">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-tight">{trait.name}:</span>
              <span className="text-xs font-semibold text-white/90">{trait.content}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const selectedZodiac = userPreferences ? zodiacSigns[userPreferences.zodiac_sign] : null;

  if (!selectedZodiac) {
    return (
      <div className="mt-4 sm:mt-8">
        <div className="p-4 sm:p-6">
          <p className="text-white/70">{t('setZodiacPreference')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-0 sm:mt-8">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={`/zodiac/${selectedZodiac.file}`}
              alt={selectedZodiac.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {selectedZodiac.name} ({selectedZodiac.en})
            </h3>
          </div>
        </div>

        <div className="text-white/90 leading-relaxed text-base">
          {horoscopeData?.text
            ? (
              <div className="relative">
                {renderFormattedHoroscope(horoscopeData.text, horoscopeData.time_period)}
              </div>
            )
            : t('noHoroscopeData')}
        </div>
      </div>
    </div >
  );
}
