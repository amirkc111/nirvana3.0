"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Footer from './Footer';

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

// Nepali sign name to API slug mapping
const RASHI_API_SLUGS = {
  'मेष': 'mesh',
  'वृष': 'brish',
  'मिथुन': 'mithun',
  'कर्कट': 'karkat',
  'सिंह': 'singha',
  'कन्या': 'kanya',
  'तुला': 'tula',
  'वृश्चिक': 'brischik',
  'धनु': 'dhanu',
  'मकर': 'makar',
  'कुम्भ': 'kumbh',
  'मीन': 'meen',
};

const API_BASE = 'https://www.hamropatro.com/rashifal/daily';

export default function Horoscope() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [rashifals, setRashifals] = useState(Array(ZODIAC_SIGNS.length).fill({ loading: true, text: '' }));
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [expandedCards, setExpandedCards] = useState(new Set());

  const timePeriods = [
    { value: 'daily', label: t('daily'), icon: '☀️' },
    { value: 'weekly', label: t('weekly'), icon: '📅' },
    { value: 'monthly', label: t('monthly'), icon: '🗓️' },
    { value: 'yearly', label: t('yearly'), icon: '📆' }
  ];

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const cleanHoroscopeText = (text) => {
    if (!text) return '';
    // Remove "More..." and similar patterns from the text
    return text
      .replace(/\s*More\.\.\.\s*/g, '')
      .replace(/\s*more\.\.\.\s*/g, '')
      .replace(/\s*MORE\.\.\.\s*/g, '')
      .replace(/\s*थप\.\.\.\s*/g, '')
      .replace(/\s*अधिक\.\.\.\s*/g, '')
      .trim();
  };

  const renderFormattedHoroscope = (text, period = 'daily') => {
    if (!text) return null;

    const sections = [
      { id: 'overview', name: 'अवलोकन', icon: '✨' },
      { id: 'career', name: 'कार्यक्षेत्र', icon: '💼' },
      { id: 'love', name: 'प्रेम सम्बन्ध', icon: '❤️' },
      { id: 'health', name: 'स्वास्थ्य', icon: '🏥' },
      { id: 'education', name: 'शिक्षा', icon: '📚' },
      { id: 'remedy', name: 'उपाय', icon: '🧘' }
    ];

    const majorSections = sections.map(s => s.name);
    const subTraits = ['शुभ रंग', 'शुभ अंक', 'शुभ बार', 'शुभ महिना'];
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
            <p className="text-sm opacity-85 leading-relaxed mb-4 text-justify text-white/80">
              {combinedText}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {traits.filter(t => t.name === 'शुभ रंग' || t.name === 'शुभ अंक').map((trait, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
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
            <div key={idx} className="inline-flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 shadow-sm">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-tight">{trait.name}:</span>
              <span className="text-xs font-semibold text-white/90">{trait.content}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getDateRange = (period) => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    switch (period) {
      case 'daily':
        return today.toLocaleDateString(undefined, options);
      case 'weekly': {
        const firstDay = new Date(today);
        // Set to Sunday of current week
        firstDay.setDate(today.getDate() - today.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);

        return `${firstDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      case 'monthly':
        return today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      case 'yearly':
        return today.getFullYear().toString();
      default:
        return '';
    }
  };

  useEffect(() => {
    let cancelled = false;
    setRashifals(Array(ZODIAC_SIGNS.length).fill({ loading: true, text: '' }));

    const fetchAllHoroscopes = async () => {
      try {
        const res = await fetch(`/api/rashifal?sign=all&period=${selectedPeriod}`);
        const json = await res.json();

        if (cancelled) return;

        if (json.rashifal && Array.isArray(json.rashifal)) {
          const results = ZODIAC_SIGNS.map(sign => {
            const match = json.rashifal.find(item =>
              (item.name && (item.name === sign.name || item.name.includes(sign.name)))
            );
            return {
              loading: false,
              text: match ? match.text : 'राशिफल फेला परेन।'
            };
          });
          setRashifals(results);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Batch horoscope fetch error:', err);
          setRashifals(ZODIAC_SIGNS.map(() => ({
            loading: false,
            text: 'राशिफल लोड गर्न सकिएन।'
          })));
        }
      }
    };

    fetchAllHoroscopes();

    return () => { cancelled = true; };
  }, [selectedPeriod, t]);

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Time Period Selector */}
      <section className="pt-8 sm:pt-12 pb-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className={`text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
              {t('horoscopeTitle')}
            </h1>
            <p className={`${currentTheme.colors.textSecondary} text-lg`}>
              {t('horoscopeSubtitle')}
            </p>
          </div>

          {/* Time Period Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-3 sm:px-6 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${selectedPeriod === period.value
                  ? `bg-gradient-to-r ${currentTheme.colors.primary} ${currentTheme.colors.text} shadow-lg`
                  : `${currentTheme.colors.surface} ${currentTheme.colors.textSecondary} ${currentTheme.colors.hover}`
                  }`}
              >
                <span className="text-base sm:text-lg">{period.icon}</span>
                <span className="truncate">{period.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Horoscope Grid */}
      <section className="pt-2 pb-8 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-8 shadow-2xl`}>

            {/* Dynamic Date Display */}
            <div className="mb-6 sm:mb-8 text-center sm:text-left border-b border-white/10 pb-4">
              <h2 className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
                {getDateRange(selectedPeriod)}
              </h2>
              <p className={`${currentTheme.colors.textSecondary} text-sm mt-1 uppercase tracking-wider opacity-70`}>
                {t(selectedPeriod)} {t('horoscope')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {ZODIAC_SIGNS.map((sign, idx) => (
                <div
                  key={sign.en}
                  className={`${currentTheme.colors.surface} rounded-xl p-4 sm:p-6 border ${currentTheme.colors.border}`}
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mr-3 sm:mr-4">
                      <img
                        src={`/zodiac/${sign.file}`}
                        alt={sign.en}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent truncate`}>{sign.name}</h3>
                      <p className={`${currentTheme.colors.textSecondary} text-xs sm:text-sm truncate`}>{sign.en}</p>
                    </div>
                  </div>

                  {rashifals[idx]?.loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${currentTheme.colors.text}`}></div>
                      <span className={`ml-2 ${currentTheme.colors.textSecondary}`}>{t('loading')}</span>
                    </div>
                  ) : (
                    <div className={`${currentTheme.colors.text} text-xs sm:text-sm leading-relaxed`}>
                      <div className={`${currentTheme.colors.textSecondary} ${expandedCards.has(idx) ? '' : 'line-clamp-6'} sm:line-clamp-none whitespace-pre-wrap`}>
                        {(() => {
                          const cleanedText = cleanHoroscopeText(rashifals[idx]?.text || '');
                          return expandedCards.has(idx)
                            ? renderFormattedHoroscope(cleanedText, selectedPeriod)
                            : <p>{truncateText(cleanedText, 180)}</p>;
                        })()}
                      </div>
                      {(() => {
                        const cleanedText = cleanHoroscopeText(rashifals[idx]?.text || '');
                        return cleanedText && cleanedText.length > 180 && (
                          <button
                            onClick={() => toggleExpanded(idx)}
                            className={`bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent text-xs font-medium mt-4 transition-colors block w-full text-left pt-2 border-t border-white/5`}
                          >
                            {expandedCards.has(idx) ? t('readLess') : t('readMore')}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
