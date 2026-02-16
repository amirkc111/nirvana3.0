"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
// import realPanchangCalculator from '../lib/realPanchangCalculator';
import Footer from './Footer';
// import { NepaliDate } from 'nepali-datetime';

// Nepali months in Bikram Sambat
const nepaliMonths = [
  'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

const nepaliMonthsEnglish = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Days in each Nepali month (approximate) - this is not strictly accurate for all years
const daysInNepaliMonth = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];

// Approximate range of BS years corresponding to AD 1969-2200
const MIN_BS_YEAR = 2025; // Corresponds to ~AD 1969
const MAX_BS_YEAR = 2257; // Corresponds to ~AD 2200

// Comprehensive date conversion using ad-bs-date-conversion
const convertBSToAD = async (bsYear, bsMonth, bsDay) => {
  try {
    const { BSToAD } = await import('ad-bs-date-conversion');
    const bsDateStr = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-${bsDay.toString().padStart(2, '0')}`;
    const adDateStr = BSToAD(bsDateStr); // Returns "YYYY-MM-DD"
    const [year, month, day] = adDateStr.split('-').map(Number);
    return { year, month, day };
  } catch (error) {
    console.warn('Fallback conversion used', error);
    return { year: bsYear - 57, month, day: bsDay };
  }
};

const convertADToBS = async (adYear, adMonth, adDay) => {
  try {
    const { ADToBS } = await import('ad-bs-date-conversion');
    const adDateStr = `${adYear}-${adMonth.toString().padStart(2, '0')}-${adDay.toString().padStart(2, '0')}`;
    const bsDateStr = ADToBS(adDateStr); // Returns "YYYY-MM-DD"
    const [year, month, day] = bsDateStr.split('-').map(Number);
    return { year, month, day };
  } catch (error) {
    console.warn('Fallback conversion used', error);
    return { year: adYear + 57, month: adMonth, day: adDay };
  }
};

// Convert English numbers to Nepali numerals
const convertToNepaliNumerals = (num) => {
  const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num.toString().split('').map(digit => nepaliNumerals[parseInt(digit)]).join('');
};

// Generate calendar days for a given month
const generateCalendarDays = (year, month) => {
  const daysInMonth = daysInNepaliMonth[month - 1];
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
};

export default function Panchang() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panchangData, setPanchangData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isClient, setIsClient] = useState(false);

  // Nepali date state - default to Poush 2082 (approx today) until hydrated
  const [selectedBSYear, setSelectedBSYear] = useState(2082);
  const [selectedBSMonth, setSelectedBSMonth] = useState(9); // Poush (December)
  const [selectedBSDay, setSelectedBSDay] = useState(8);

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarYear, setCurrentCalendarYear] = useState(2082);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(9);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isToday, setIsToday] = useState(true);
  const [currentBSYear, setCurrentBSYear] = useState(2082);
  const [currentBSMonth, setCurrentBSMonth] = useState(9);
  const [currentBSDay, setCurrentBSDay] = useState(8);
  const datePickerRef = useRef(null);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);


  // Set today's BS date on component mount and keep it current
  useEffect(() => {
    if (isClient) {
      const updateToCurrentDate = async () => {
        const todayAD = new Date();

        // Use the new async conversion function (library-backed)
        const bsDate = await convertADToBS(todayAD.getFullYear(), todayAD.getMonth() + 1, todayAD.getDate());

        if (bsDate) {
          console.log('📅 Setting current BS date dynamically:', {
            AD: { year: todayAD.getFullYear(), month: todayAD.getMonth() + 1, day: todayAD.getDate() },
            BS: bsDate
          });

          setSelectedBSYear(bsDate.year);
          setSelectedBSMonth(bsDate.month);
          setSelectedBSDay(bsDate.day);

          setCurrentBSYear(bsDate.year);
          setCurrentBSMonth(bsDate.month);
          setCurrentBSDay(bsDate.day);

          setCurrentCalendarYear(bsDate.year);
          setCurrentCalendarMonth(bsDate.month);
        }
      };

      // Set initial date immediately
      updateToCurrentDate();

      // Update every minute (optional, but good for keeping "today" state fresh)
      const interval = setInterval(updateToCurrentDate, 60000);

      return () => clearInterval(interval);
    }
  }, [isClient]);

  // Close calendar when clicking outside
  // Note: Calendar positioning is now handled with absolute positioning relative to date picker

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest('.calendar-container') && !event.target.closest('.popup-calendar')) {
        setShowCalendar(false);
      }
      if (showYearPicker && !event.target.closest('.year-picker')) {
        setShowYearPicker(false);
      }
    };

    const handleKeyDown = (event) => {
      if (showCalendar && event.key === 'Escape') {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showCalendar]);

  // Sync calendar view with selected date
  useEffect(() => {
    setCurrentCalendarYear(selectedBSYear);
    setCurrentCalendarMonth(selectedBSMonth);
  }, [selectedBSYear, selectedBSMonth]);

  // Year navigation functions
  const navigateYear = (direction) => {
    if (direction === 'prev') {
      setCurrentCalendarYear(prev => Math.max(prev - 1, 1900)); // Minimum API year
    } else if (direction === 'next') {
      setCurrentCalendarYear(prev => Math.min(prev + 1, 2054)); // Maximum API year
    }
  };

  const selectYear = (year) => {
    setCurrentCalendarYear(year);
    setShowYearPicker(false);
  };

  // Generate year options for picker - show current year ± 7 years
  // API supports years from 1900 to 2054 (based on testing)
  const generateYearOptions = () => {
    const currentYear = currentCalendarYear;
    const years = [];

    // If near boundaries, show more years in the valid direction
    let startYear = currentYear - 7;
    let endYear = currentYear + 7;

    if (currentYear <= 1907) {
      // Near minimum, show more years forward
      startYear = 1900;
      endYear = currentYear + 14;
    } else if (currentYear >= 2047) {
      // Near maximum, show more years backward
      startYear = currentYear - 14;
      endYear = 2054;
    }

    for (let year = startYear; year <= endYear; year++) {
      if (year >= 1900 && year <= 2054) {
        years.push(year);
      }
    }
    return years;
  };

  // Check if selected date is today
  useEffect(() => {
    if (isClient && currentBSYear && currentBSMonth && currentBSDay) {
      const isSelectedToday =
        selectedBSYear === currentBSYear &&
        selectedBSMonth === currentBSMonth &&
        selectedBSDay === currentBSDay;
      setIsToday(isSelectedToday);
    }
  }, [selectedBSYear, selectedBSMonth, selectedBSDay, currentBSYear, currentBSMonth, currentBSDay, isClient]);

  // Calculate today's BS date for calendar highlighting (recalculated each render to stay current)
  const getTodayBSDate = () => {
    if (!isClient) return { year: null, month: null, day: null };
    const todayAD = new Date();
    return convertADToBS(todayAD.getFullYear(), todayAD.getMonth() + 1, todayAD.getDate());
  };

  // Calculate panchang data using VedicJyotish-based calculator
  useEffect(() => {
    if (!isClient || !selectedBSYear || !selectedBSMonth || !selectedBSDay) return;

    const calculatePanchangData = async () => {
      setLoading(true);
      setPanchangData(null); // Clear previous data

      try {
        // Convert selected BS date to AD date using reliable library
        const adDate = await convertBSToAD(selectedBSYear, selectedBSMonth, selectedBSDay);
        const adYear = adDate.year;
        const adMonth = adDate.month;
        const adDay = adDate.day;

        console.log('🔍 Calculating panchang data for BS:', { selectedBSYear, selectedBSMonth, selectedBSDay });
        console.log('🔍 Converted to AD:', { adYear, adMonth, adDay });

        // Format date as YYYY-MM-DD for API
        const dateStr = `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`;

        // Fetch panchang data from Next.js API route
        const response = await fetch(`/api/panchang?date=${dateStr}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const apiResponse = await response.json();
        const calculatedPanchang = apiResponse.panchang;

        console.log('✅ Fetched panchang data:', calculatedPanchang);

        // The API already returns Nepali names in the 'name' fields, but we may need to translate
        // English names to Nepali using the translation function if needed
        const nepaliPanchangData = translatePanchangToNepali(calculatedPanchang);
        console.log('🇳🇵 Translated to Nepali:', nepaliPanchangData);

        // Create final data with explicitly formatted dates to avoid duplication
        const finalData = {
          ...nepaliPanchangData,
          calendar: {
            ...nepaliPanchangData.calendar,
            nepaliDate: `${convertToNepaliNumerals(selectedBSYear)} ${nepaliMonths[selectedBSMonth - 1]} ${convertToNepaliNumerals(selectedBSDay)}`,
            englishDate: `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`
          }
        };

        setPanchangData(finalData);

      } catch (error) {
        console.error('🚨 Error calculating panchang data:', error);
        // No fallback data - API only
        setPanchangData(null);
      } finally {
        setLoading(false);
      }
    };

    calculatePanchangData();
  }, [isClient, selectedBSYear, selectedBSMonth, selectedBSDay]); // Depend on BS date state

  // Nepali translation functions for panchang elements
  const translateToNepali = {
    // Tithi translations
    tithi: {
      'Pratipada': 'प्रतिपदा',
      'Dwitiya': 'द्वितीया',
      'Tritiya': 'तृतीया',
      'Chaturthi': 'चतुर्थी',
      'Panchami': 'पञ्चमी',
      'Shashthi': 'षष्ठी',
      'Saptami': 'सप्तमी',
      'Ashtami': 'अष्टमी',
      'Navami': 'नवमी',
      'Dashami': 'दशमी',
      'Ekadashi': 'एकादशी',
      'Dwadashi': 'द्वादशी',
      'Trayodashi': 'त्रयोदशी',
      'Chaturdashi': 'चतुर्दशी',
      'Purnima': 'पूर्णिमा',
      'Amavasya': 'अमावस्या'
    },

    // Nakshatra translations
    nakshatra: {
      'Ashwini': 'अश्विनी',
      'Bharani': 'भरणी',
      'Krittika': 'कृत्तिका',
      'Rohini': 'रोहिणी',
      'Mrigashira': 'मृगशिरा',
      'Ardra': 'आर्द्रा',
      'Punarvasu': 'पुनर्वसु',
      'Pushya': 'पुष्य',
      'Ashlesha': 'आश्लेषा',
      'Magha': 'मघा',
      'Purva Phalguni': 'पूर्व फाल्गुनी',
      'Uttara Phalguni': 'उत्तर फाल्गुनी',
      'Hasta': 'हस्त',
      'Chitra': 'चित्रा',
      'Swati': 'स्वाती',
      'Vishakha': 'विशाखा',
      'Anuradha': 'अनुराधा',
      'Jyeshtha': 'ज्येष्ठा',
      'Mula': 'मूल',
      'Purva Ashadha': 'पूर्वाषाढा',
      'Uttara Ashadha': 'उत्तराषाढा',
      'Shravana': 'श्रवण',
      'Dhanishtha': 'धनिष्ठा',
      'Shatabhisha': 'शतभिषा',
      'Purva Bhadrapada': 'पूर्वभाद्रपद',
      'Uttara Bhadrapada': 'उत्तरभाद्रपद',
      'Revati': 'रेवती'
    },

    // Yoga translations
    yoga: {
      'Vishkambha': 'विष्कम्भ',
      'Priti': 'प्रीति',
      'Ayushman': 'आयुष्मान्',
      'Saubhagya': 'सौभाग्य',
      'Shobhana': 'शोभन',
      'Atiganda': 'अतिगण्ड',
      'Sukarma': 'सुकर्म',
      'Dhriti': 'धृति',
      'Shula': 'शूल',
      'Ganda': 'गण्ड',
      'Vriddhi': 'वृद्धि',
      'Dhruva': 'ध्रुव',
      'Vyaghata': 'व्याघात',
      'Harshana': 'हर्षण',
      'Vajra': 'वज्र',
      'Siddhi': 'सिद्धि',
      'Vyatipata': 'व्यतिपात',
      'Variyan': 'वरीयान्',
      'Parigha': 'परिघ',
      'Shiva': 'शिव',
      'Siddha': 'सिद्ध',
      'Sadhya': 'साध्य',
      'Shubha': 'शुभ',
      'Shukla': 'शुक्ल',
      'Brahma': 'ब्रह्म',
      'Indra': 'इन्द्र',
      'Vaidhriti': 'वैधृति'
    },

    // Karana translations
    karana: {
      'Kimstughna': 'किंस्तुघ्न',
      'Bava': 'बव',
      'Balava': 'बालव',
      'Kaulava': 'कौलव',
      'Taitila': 'तैतिल',
      'Gara': 'गर',
      'Vanija': 'वणिज',
      'Vishti': 'विष्टि',
      'Shakuni': 'शकुनि',
      'Chatushpada': 'चतुष्पाद',
      'Naga': 'नाग',
      'Kintughna': 'किंतुघ्न'
    },

    // Hindu month translations to Nepali
    hinduMonth: {
      'Chaitra': 'चैत',
      'Vaishakha': 'बैशाख',
      'Jyeshtha': 'जेठ',
      'Ashadha': 'असार',
      'Shravana': 'साउन',
      'Bhadrapada': 'भदौ',
      'Ashwin': 'असोज',
      'Kartika': 'कार्तिक',
      'Margashirsha': 'मंसिर',
      'Pausha': 'पुस',
      'Magha': 'माघ',
      'Phalguna': 'फागुन'
    },

    // Planetary sign translations
    planetarySigns: {
      'Aries': 'मेष',
      'Taurus': 'वृषभ',
      'Gemini': 'मिथुन',
      'Cancer': 'कर्क',
      'Leo': 'सिंह',
      'Virgo': 'कन्या',
      'Libra': 'तुला',
      'Scorpio': 'वृश्चिक',
      'Sagittarius': 'धनु',
      'Capricorn': 'मकर',
      'Aquarius': 'कुम्भ',
      'Pisces': 'मीन'
    },

    // Nakshatra lord translations
    nakshatraLord: {
      'Ketu': 'केतु',
      'Venus': 'शुक्र',
      'Sun': 'सूर्य',
      'Moon': 'चन्द्र',
      'Mars': 'मंगल',
      'Rahu': 'राहु',
      'Jupiter': 'गुरु',
      'Saturn': 'शनि',
      'Mercury': 'बुध'
    },

    // Planetary aspect translations
    planetaryAspects: {
      'Conjunction': 'संयोग',
      'Sextile': 'षष्ठांश',
      'Square': 'चतुर्थांश',
      'Trine': 'त्रिकोण',
      'Opposition': 'विपरीत',
      'Minor Aspect': 'लघु दृष्टि'
    },

    // Inauspicious times translations
    inauspiciousTimes: {
      'Rahu Kalam': 'राहु काल',
      'Yamaganda': 'यमगण्ड',
      'Gulika Kalam': 'गुलिक काल'
    }
  };

  // Function to translate panchang data to Nepali
  const translatePanchangToNepali = (data) => {
    if (!data) return data;

    return {
      ...data,
      tithi: {
        ...data.tithi,
        name: translateToNepali.tithi[data.tithi?.name] || data.tithi?.name,
        english: data.tithi?.english
      },
      nakshatra: {
        ...data.nakshatra,
        name: translateToNepali.nakshatra[data.nakshatra?.name] || data.nakshatra?.name,
        english: data.nakshatra?.english,
        lord: translateToNepali.nakshatraLord[data.nakshatra?.lord] || data.nakshatra?.lord
      },
      yoga: {
        ...data.yoga,
        name: translateToNepali.yoga[data.yoga?.name] || data.yoga?.name,
        english: data.yoga?.english
      },
      karana: {
        ...data.karana,
        name: translateToNepali.karana[data.karana?.name] || data.karana?.name,
        english: data.karana?.english
      },
      calendar: {
        ...data.calendar,
        hinduMonth: translateToNepali.hinduMonth[data.calendar?.hinduMonth] || data.calendar?.hinduMonth
      },
      planetary: data.planetary ? {
        ...data.planetary,
        sun: {
          ...data.planetary.sun,
          sign: translateToNepali.planetarySigns[data.planetary.sun?.sign] || data.planetary.sun?.sign
        },
        moon: {
          ...data.planetary.moon,
          sign: translateToNepali.planetarySigns[data.planetary.moon?.sign] || data.planetary.moon?.sign
        },
        mars: {
          ...data.planetary.mars,
          sign: translateToNepali.planetarySigns[data.planetary.mars?.sign] || data.planetary.mars?.sign
        },
        mercury: {
          ...data.planetary.mercury,
          sign: translateToNepali.planetarySigns[data.planetary.mercury?.sign] || data.planetary.mercury?.sign
        },
        jupiter: {
          ...data.planetary.jupiter,
          sign: translateToNepali.planetarySigns[data.planetary.jupiter?.sign] || data.planetary.jupiter?.sign
        },
        venus: {
          ...data.planetary.venus,
          sign: translateToNepali.planetarySigns[data.planetary.venus?.sign] || data.planetary.venus?.sign
        },
        saturn: {
          ...data.planetary.saturn,
          sign: translateToNepali.planetarySigns[data.planetary.saturn?.sign] || data.planetary.saturn?.sign
        },
        rahu: {
          ...data.planetary.rahu,
          sign: translateToNepali.planetarySigns[data.planetary.rahu?.sign] || data.planetary.rahu?.sign
        },
        ketu: {
          ...data.planetary.ketu,
          sign: translateToNepali.planetarySigns[data.planetary.ketu?.sign] || data.planetary.ketu?.sign
        },
        aspects: data.planetary?.aspects ? {
          sunMoon: translateToNepali.planetaryAspects[data.planetary.aspects?.sunMoon] || data.planetary.aspects?.sunMoon,
          marsJupiter: translateToNepali.planetaryAspects[data.planetary.aspects?.marsJupiter] || data.planetary.aspects?.marsJupiter,
          venusMercury: translateToNepali.planetaryAspects[data.planetary.aspects?.venusMercury] || data.planetary.aspects?.venusMercury
        } : data.planetary?.aspects
      } : data.planetary,
      inauspiciousTimes: data.inauspiciousTimes ? data.inauspiciousTimes.map(time => ({
        ...time,
        name: translateToNepali.inauspiciousTimes[time.name] || time.name
      })) : data.inauspiciousTimes,
      // Preserve additionalTimings field
      additionalTimings: data.additionalTimings || null,
      // Preserve era object with fallback to eras
      era: data.era || data.eras || {}
    };
  };


  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to calculate day length
  const calculateDayLength = (sunrise, sunset) => {
    try {
      if (!sunrise || !sunset) {
        return "";
      }
      const sunriseTime = new Date(`2000-01-01 ${sunrise}`);
      const sunsetTime = new Date(`2000-01-01 ${sunset}`);
      const diffMs = sunsetTime - sunriseTime;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return "";
    }
  };

  if (loading || !isClient || !panchangData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${currentTheme.colors.text} mx-auto mb-4`}></div>
          <p className={currentTheme.colors.textSecondary}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Header */}
      <section className="py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">

          </div>
        </div>
      </section>


      {/* Tab Navigation Section */}
      <section className="py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`${currentTheme.colors.surface} backdrop-blur-xl rounded-2xl p-3 shadow-xl border ${currentTheme.colors.border}`}>
            {/* Mobile: Vertical Stack */}
            <div className="flex flex-col sm:hidden gap-3">
              {/* Nepali Calendar for Mobile */}
              <div className={`${currentTheme.colors.surface} backdrop-blur-xl rounded-xl p-3 border ${currentTheme.colors.border} flex flex-col gap-2 relative z-50 calendar-container`}>
                <label className={`block text-xs font-semibold ${currentTheme.colors.text}`}>
                  नेपाली मिति (BS)
                </label>

                {/* Selected Date Display */}
                <div
                  ref={datePickerRef}
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`px-3 py-2 border-2 ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.surface} ${currentTheme.colors.text} cursor-pointer hover:bg-opacity-80 transition-all text-sm flex items-center justify-between`}
                >
                  <span>{convertToNepaliNumerals(selectedBSYear)} {nepaliMonths[selectedBSMonth - 1]} {convertToNepaliNumerals(selectedBSDay)}</span>
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-colors ${isToday ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                    {convertToNepaliNumerals(selectedBSDay)}
                  </div>
                </div>
              </div>

              {/* Tab Buttons for Mobile */}
              <div className="flex flex-col gap-3">
                {[
                  { id: 'overview', label: t('overview'), icon: '📅', color: 'from-blue-500 to-cyan-500' },
                  { id: 'timings', label: t('timings'), icon: '🕐', color: 'from-orange-500 to-red-500' },
                  { id: 'planetary', label: t('planetary'), icon: '🌍', color: 'from-green-500 to-emerald-500' },
                  { id: 'muhurat', label: t('muhurat'), icon: '⭐', color: 'from-purple-500 to-pink-500' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : `${currentTheme.colors.textSecondary} ${currentTheme.colors.hover} hover:bg-white/5`
                      }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="ml-auto">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Horizontal Layout with Tab Buttons Only */}
            <div className="hidden sm:flex flex-wrap items-center gap-3">
              {/* Tab Buttons for Desktop */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'overview', label: t('overview'), icon: '📅', color: 'from-blue-500 to-cyan-500' },
                  { id: 'timings', label: t('timings'), icon: '🕐', color: 'from-orange-500 to-red-500' },
                  { id: 'planetary', label: t('planetary'), icon: '🌍', color: 'from-green-500 to-emerald-500' },
                  { id: 'muhurat', label: t('muhurat'), icon: '⭐', color: 'from-purple-500 to-pink-500' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : `${currentTheme.colors.textSecondary} ${currentTheme.colors.hover} hover:bg-white/5`
                      }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="ml-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
              {/* Mini Calendar - Left Side (2/9 width) */}
              <div className="lg:col-span-2">
                <div className={`relative ${currentTheme.colors.surface} backdrop-blur-xl rounded-xl p-4 border ${currentTheme.colors.border} z-40`}>
                  {/* Calendar Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm border-b border-white/30 rounded-t-xl -m-4 -mt-4 mb-4">
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">नेपाली मिति</h3>
                        <p className="text-white/90 text-sm">तारीख छान्नुहोस्</p>
                      </div>
                    </div>
                  </div>

                  {/* Month/Year Navigation */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev > 1 ? prev - 1 : 12)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="text-center px-2 relative">
                        <div className="text-white text-lg font-bold mb-1">{nepaliMonths[currentCalendarMonth - 1]}</div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigateYear('prev')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            className="year-picker text-white/90 text-sm font-medium hover:text-white hover:scale-105 transition-all cursor-pointer"
                          >
                            {convertToNepaliNumerals(currentCalendarYear)}
                          </button>
                          <button
                            onClick={() => navigateYear('next')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* Year Picker Dropdown */}
                        {showYearPicker && (
                          <div className="year-picker absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-2 z-50 w-28 max-h-32 overflow-y-auto">
                            <div className="text-center mb-1">
                              <h3 className="text-gray-800 font-bold text-xs">वर्ष</h3>
                            </div>
                            <div className="space-y-0.5">
                              {generateYearOptions().map(year => (
                                <button
                                  key={year}
                                  onClick={() => selectYear(year)}
                                  className={`w-full px-1 py-0.5 rounded text-xs font-medium transition-all hover:scale-105 ${year === currentCalendarYear
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                  {convertToNepaliNumerals(year)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev < 12 ? prev + 1 : 1)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'].map((day, index) => (
                        <div key={index} className="text-center py-1">
                          <span className="text-white/90 text-xs font-bold">{day}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(currentCalendarYear, currentCalendarMonth).map(day => {
                        const todayBS = getTodayBSDate();
                        const isToday = todayBS &&
                          todayBS.year === currentCalendarYear &&
                          todayBS.month === currentCalendarMonth &&
                          todayBS.day === day;
                        const isSelected =
                          selectedBSYear === currentCalendarYear &&
                          selectedBSMonth === currentCalendarMonth &&
                          selectedBSDay === day;

                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedBSYear(currentCalendarYear);
                              setSelectedBSMonth(currentCalendarMonth);
                              setSelectedBSDay(day);
                            }}
                            className={`w-8 h-8 rounded-lg transition-all duration-200 font-bold text-xs flex items-center justify-center ${isToday
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105 border-2 border-white/40 ring-2 ring-green-300'
                              : isSelected
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105 border-2 border-white/40'
                                : 'text-white hover:bg-white/20 hover:text-white hover:scale-105 border border-white/20 hover:border-white/40'
                              }`}
                            title={isToday ? "आज (Today)" : ""}
                          >
                            {convertToNepaliNumerals(day)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Cards - Right Side (7/9 width) - 2x3 Grid */}
              <div className="lg:col-span-7">
                {/* 2x3 Grid Layout */}
                <div className="grid grid-cols-1 grid-rows-2 gap-4 h-full">
                  {/* Row 1: Tithi, Nakshatra, Calendar Info */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Enhanced Tithi Card */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 -m-3 -mt-3 mb-3 flex items-center gap-1">
                        <span className="text-lg">🌙</span>
                        <h3 className="font-bold text-xs">{t('tithi')}</h3>
                      </div>
                      <div className={currentTheme.colors.text}>
                        <h4 className="text-sm font-bold mb-1">{panchangData?.tithi?.name || ''}</h4>
                        <p className={`${currentTheme.colors.textSecondary} text-xs mb-1`}>{panchangData?.tithi?.english || ''}</p>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                          <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                            <span className="font-semibold">{t('end')}:</span> {panchangData?.tithi?.end_time || ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Nakshatra Card */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 -m-3 -mt-3 mb-3 flex items-center gap-1">
                        <span className="text-lg">⭐</span>
                        <h3 className="font-bold text-xs">{t('nakshatra')}</h3>
                      </div>
                      <div className={currentTheme.colors.text}>
                        <h4 className="text-sm font-bold mb-1">{panchangData?.nakshatra?.name || ''}</h4>
                        <p className={`${currentTheme.colors.textSecondary} text-xs mb-1`}>{panchangData?.nakshatra?.english || ''}</p>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                            <span className="font-semibold">{t('lord')}:</span> {panchangData?.nakshatra?.lord || ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Calendar Info Card */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 -m-3 -mt-3 mb-3 flex items-center gap-1">
                        <span className="text-lg">📅</span>
                        <h3 className="font-bold text-xs">{t('calendarInfo')}</h3>
                      </div>
                      <div className={currentTheme.colors.text}>
                        <h4 className="text-sm font-bold mb-1 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                          {panchangData?.calendar?.nepaliDate || ''}
                        </h4>
                        <p className={`text-xs ${currentTheme.colors.textSecondary} mb-1`}>
                          {panchangData?.calendar?.englishDate || ''}
                        </p>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                            <span className="font-semibold">{t('hinduMonth')}:</span> {panchangData?.calendar?.hinduMonth || ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                            <span className="font-semibold">{t('dayLength')}:</span> {panchangData?.calendar?.dayLength || ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                            <span className="font-semibold">{t('ayan')}:</span> {panchangData?.calendar?.ayan || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Yoga, Karana, Era Years */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Enhanced Yoga Card */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 -m-3 -mt-3 mb-3 flex items-center gap-1">
                        <span className="text-lg">🧘</span>
                        <h3 className="font-bold text-xs">{t('yoga')}</h3>
                      </div>
                      <div className={currentTheme.colors.text}>
                        <h4 className="text-sm font-bold mb-1">{panchangData?.yoga?.name || ''}</h4>
                        <p className={`${currentTheme.colors.textSecondary} text-xs mb-1`}>{panchangData?.yoga?.english || ''}</p>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                            <span className="font-semibold">{t('end')}:</span> {panchangData?.yoga?.end_time || ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Karana Card */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 -m-3 -mt-3 mb-3 flex items-center gap-1">
                        <span className="text-lg">⚡</span>
                        <h3 className="font-bold text-xs">{t('karana')}</h3>
                      </div>
                      <div className={currentTheme.colors.text}>
                        <h4 className="text-sm font-bold mb-1">{panchangData?.karana?.name || ''}</h4>
                        <p className={`${currentTheme.colors.textSecondary} text-xs mb-1`}>{panchangData?.karana?.english || ''}</p>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                            <span className="font-semibold">{t('type')}:</span> {panchangData?.karana?.type || ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Era Years Card */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 -m-3 -mt-3 mb-3 flex items-center gap-1">
                        <span className="text-lg">🏛️</span>
                        <h3 className="font-bold text-xs">{t('eraYears')}</h3>
                      </div>
                      <div className={`${currentTheme.colors.text} space-y-1`}>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-bold`}>{t('nepalSamvat')}:</span>
                          <span className="text-red-400 font-bold text-xs">{panchangData.era?.traditional_nepali_date || 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('vikramaSamvat')}:</span>
                          <span className="text-orange-400 font-bold text-xs">{panchangData.era?.vikrama || ''}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('shakaSamvat')}:</span>
                          <span className="text-green-400 font-bold text-xs">{panchangData.era?.shaka || ''}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('kaliYuga')}:</span>
                          <span className="text-blue-400 font-bold text-xs">{panchangData.era?.kali || ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timings' && (
            <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
              {/* Mini Calendar - Left Side (2/9 width) */}
              <div className="lg:col-span-2">
                <div className={`relative ${currentTheme.colors.surface} backdrop-blur-xl rounded-xl p-4 border ${currentTheme.colors.border} z-40`}>
                  {/* Calendar Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm border-b border-white/30 rounded-t-xl -m-4 -mt-4 mb-4">
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">नेपाली मिति</h3>
                        <p className="text-white/90 text-sm">तारीख छान्नुहोस्</p>
                      </div>
                    </div>
                  </div>

                  {/* Month/Year Navigation */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev > 1 ? prev - 1 : 12)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="text-center px-2 relative">
                        <div className="text-white text-lg font-bold mb-1">{nepaliMonths[currentCalendarMonth - 1]}</div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigateYear('prev')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            className="year-picker text-white/90 text-sm font-medium hover:text-white hover:scale-105 transition-all cursor-pointer"
                          >
                            {convertToNepaliNumerals(currentCalendarYear)}
                          </button>
                          <button
                            onClick={() => navigateYear('next')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* Year Picker Dropdown */}
                        {showYearPicker && (
                          <div className="year-picker absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-2 z-50 w-28 max-h-32 overflow-y-auto">
                            <div className="text-center mb-1">
                              <h3 className="text-gray-800 font-bold text-xs">वर्ष</h3>
                            </div>
                            <div className="space-y-0.5">
                              {generateYearOptions().map(year => (
                                <button
                                  key={year}
                                  onClick={() => selectYear(year)}
                                  className={`w-full px-1 py-0.5 rounded text-xs font-medium transition-all hover:scale-105 ${year === currentCalendarYear
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                  {convertToNepaliNumerals(year)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev < 12 ? prev + 1 : 1)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'].map((day, index) => (
                        <div key={index} className="text-center py-1">
                          <span className="text-white/90 text-xs font-bold">{day}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(currentCalendarYear, currentCalendarMonth).map(day => {
                        const todayBS = getTodayBSDate();
                        const isToday = todayBS &&
                          todayBS.year === currentCalendarYear &&
                          todayBS.month === currentCalendarMonth &&
                          todayBS.day === day;
                        const isSelected =
                          selectedBSYear === currentCalendarYear &&
                          selectedBSMonth === currentCalendarMonth &&
                          selectedBSDay === day;

                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedBSYear(currentCalendarYear);
                              setSelectedBSMonth(currentCalendarMonth);
                              setSelectedBSDay(day);
                            }}
                            className={`w-8 h-8 rounded-lg transition-all duration-200 font-bold text-xs flex items-center justify-center ${isToday
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105 border-2 border-white/40 ring-2 ring-green-300'
                              : isSelected
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105 border-2 border-white/40'
                                : 'text-white hover:bg-white/20 hover:text-white hover:scale-105 border border-white/20 hover:border-white/40'
                              }`}
                            title={isToday ? "आज (Today)" : ""}
                          >
                            {convertToNepaliNumerals(day)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Cards - Right Side (7/9 width) */}
              <div className="lg:col-span-7">
                <div className="space-y-4">
                  <h2 className={`text-2xl lg:text-3xl font-bold ${currentTheme.colors.text} mb-4 lg:mb-6`}>{t('timings')}</h2>

                  {/* Sun & Moon Timings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Sun Timings */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">☀️</span>
                        <h3 className="font-bold text-sm">{t('sunTimings')}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('sunrise')}:</span>
                          <span className="text-yellow-400 font-bold text-sm">{panchangData?.timings?.sunrise || ""}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('sunset')}:</span>
                          <span className="text-orange-400 font-bold text-sm">{panchangData?.timings?.sunset || ""}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('dayLength')}:</span>
                          <span className="text-red-400 font-bold text-sm">
                            {panchangData?.timings?.sunrise && panchangData?.timings?.sunset
                              ? calculateDayLength(panchangData.timings.sunrise, panchangData.timings.sunset)
                              : ""
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Moon Timings */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">🌙</span>
                        <h3 className="font-bold text-sm">{t('moonTimings')}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('moonrise')}:</span>
                          <span className="text-blue-400 font-bold text-sm">
                            {panchangData?.timings?.moonrise || ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('moonset')}:</span>
                          <span className="text-indigo-400 font-bold text-sm">
                            {panchangData?.timings?.moonset || ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('moonPhase')}:</span>
                          <span className="text-purple-400 font-bold text-sm">{panchangData?.tithi?.lunar_phase || ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Timings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {/* Rahu Kalam */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">🔴</span>
                        <h3 className="font-bold text-sm">{t('rahuKalam')}</h3>
                      </div>
                      <div className="text-center">
                        <p className="text-red-400 font-bold text-base">
                          {panchangData.additionalTimings?.rahuKalam || ''}
                        </p>
                        <p className={`${currentTheme.colors.textSecondary} text-xs mt-1`}>{t('avoidImportantWork')}</p>
                      </div>
                    </div>

                    {/* Yamaganda */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <h3 className="font-bold text-sm">{t('yamaganda')}</h3>
                      </div>
                      <div className="text-center">
                        <p className="text-orange-400 font-bold text-base">
                          {panchangData.additionalTimings?.yamaganda || ''}
                        </p>
                        <p className={`${currentTheme.colors.textSecondary} text-xs mt-1`}>{t('avoidNewVentures')}</p>
                      </div>
                    </div>

                    {/* Gulika Kalam */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">💜</span>
                        <h3 className="font-bold text-sm">{t('gulikaKalam')}</h3>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-400 font-bold text-base">
                          {panchangData.additionalTimings?.gulikaKalam || ''}
                        </p>
                        <p className={`${currentTheme.colors.textSecondary} text-xs mt-1`}>{t('avoidLegalMatters')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planetary' && (
            <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
              {/* Mini Calendar - Left Side (2/9 width) */}
              <div className="lg:col-span-2">
                <div className={`relative ${currentTheme.colors.surface} backdrop-blur-xl rounded-xl p-4 border ${currentTheme.colors.border} z-40`}>
                  {/* Calendar Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm border-b border-white/30 rounded-t-xl -m-4 -mt-4 mb-4">
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">नेपाली मिति</h3>
                        <p className="text-white/90 text-sm">तारीख छान्नुहोस्</p>
                      </div>
                    </div>
                  </div>

                  {/* Month/Year Navigation */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev > 1 ? prev - 1 : 12)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="text-center px-2 relative">
                        <div className="text-white text-lg font-bold mb-1">{nepaliMonths[currentCalendarMonth - 1]}</div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigateYear('prev')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            className="year-picker text-white/90 text-sm font-medium hover:text-white hover:scale-105 transition-all cursor-pointer"
                          >
                            {convertToNepaliNumerals(currentCalendarYear)}
                          </button>
                          <button
                            onClick={() => navigateYear('next')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* Year Picker Dropdown */}
                        {showYearPicker && (
                          <div className="year-picker absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-2 z-50 w-28 max-h-32 overflow-y-auto">
                            <div className="text-center mb-1">
                              <h3 className="text-gray-800 font-bold text-xs">वर्ष</h3>
                            </div>
                            <div className="space-y-0.5">
                              {generateYearOptions().map(year => (
                                <button
                                  key={year}
                                  onClick={() => selectYear(year)}
                                  className={`w-full px-1 py-0.5 rounded text-xs font-medium transition-all hover:scale-105 ${year === currentCalendarYear
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                  {convertToNepaliNumerals(year)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev < 12 ? prev + 1 : 1)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'].map((day, index) => (
                        <div key={index} className="text-center py-1">
                          <span className="text-white/90 text-xs font-bold">{day}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(currentCalendarYear, currentCalendarMonth).map(day => {
                        const todayBS = getTodayBSDate();
                        const isToday = todayBS &&
                          todayBS.year === currentCalendarYear &&
                          todayBS.month === currentCalendarMonth &&
                          todayBS.day === day;
                        const isSelected =
                          selectedBSYear === currentCalendarYear &&
                          selectedBSMonth === currentCalendarMonth &&
                          selectedBSDay === day;

                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedBSYear(currentCalendarYear);
                              setSelectedBSMonth(currentCalendarMonth);
                              setSelectedBSDay(day);
                            }}
                            className={`w-8 h-8 rounded-lg transition-all duration-200 font-bold text-xs flex items-center justify-center ${isToday
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105 border-2 border-white/40 ring-2 ring-green-300'
                              : isSelected
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105 border-2 border-white/40'
                                : 'text-white hover:bg-white/20 hover:text-white hover:scale-105 border border-white/20 hover:border-white/40'
                              }`}
                            title={isToday ? "आज (Today)" : ""}
                          >
                            {convertToNepaliNumerals(day)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Cards - Right Side (7/9 width) */}
              <div className="lg:col-span-7">
                <div className="space-y-4">
                  <h2 className={`text-2xl lg:text-3xl font-bold ${currentTheme.colors.text} mb-4 lg:mb-6`}>{t('planetaryPositions')}</h2>

                  {/* Major Planets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {[
                      {
                        name: 'Sun',
                        sign: panchangData.planetary?.sun?.sign || '',
                        degree: panchangData.planetary?.sun?.longitude || '',
                        icon: '☀️',
                        color: 'from-yellow-500 to-orange-500',
                        textColor: 'text-yellow-400'
                      },
                      {
                        name: 'Moon',
                        sign: panchangData.planetary?.moon?.sign || '',
                        degree: panchangData.planetary?.moon?.longitude || '',
                        icon: '🌙',
                        color: 'from-blue-500 to-indigo-500',
                        textColor: 'text-blue-400'
                      },
                      {
                        name: 'Mars',
                        sign: panchangData.planetary?.mars?.sign || '',
                        degree: panchangData.planetary?.mars?.longitude || '',
                        icon: '♂️',
                        color: 'from-red-500 to-pink-500',
                        textColor: 'text-red-400'
                      },
                      {
                        name: 'Mercury',
                        sign: panchangData.planetary?.mercury?.sign || '',
                        degree: panchangData.planetary?.mercury?.longitude || '',
                        icon: '☿️',
                        color: 'from-green-500 to-emerald-500',
                        textColor: 'text-green-400'
                      },
                      {
                        name: 'Jupiter',
                        sign: panchangData.planetary?.jupiter?.sign || '',
                        degree: panchangData.planetary?.jupiter?.longitude || '',
                        icon: '♃',
                        color: 'from-purple-500 to-pink-500',
                        textColor: 'text-purple-400'
                      },
                      {
                        name: 'Venus',
                        sign: panchangData.planetary?.venus?.sign || '',
                        degree: panchangData.planetary?.venus?.longitude || '',
                        icon: '♀️',
                        color: 'from-pink-500 to-rose-500',
                        textColor: 'text-pink-400'
                      }
                    ].map((planet, index) => (
                      <div key={index} className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                        <div className={`bg-gradient-to-r ${planet.color} text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2`}>
                          <span className="text-xl">{planet.icon}</span>
                          <h3 className="font-bold text-sm">{planet.name}</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>Sign:</span>
                            <span className={`${planet.textColor} font-bold text-sm`}>{planet.sign}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>Degree:</span>
                            <span className={`${planet.textColor} font-bold text-sm`}>{planet.degree}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Planetary Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Lunar Nodes */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">🌑</span>
                        <h3 className="font-bold text-sm">{t('lunarNodes')}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>Rahu:</span>
                          <span className="text-indigo-400 font-bold text-sm">
                            {panchangData.planetary?.rahu?.sign || ''} {panchangData.planetary?.rahu?.longitude || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>Ketu:</span>
                          <span className="text-purple-400 font-bold text-sm">
                            {panchangData.planetary?.ketu?.sign || ''} {panchangData.planetary?.ketu?.longitude || ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Planetary Aspects */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">🔗</span>
                        <h3 className="font-bold text-sm">{t('planetaryAspects')}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>Sun-Moon:</span>
                          <span className="text-cyan-400 font-bold text-xs">
                            {panchangData.planetary?.aspects?.sunMoon || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>Mars-Jupiter:</span>
                          <span className="text-blue-400 font-bold text-xs">
                            {panchangData.planetary?.aspects?.marsJupiter || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>Venus-Mercury:</span>
                          <span className="text-green-400 font-bold text-xs">
                            {panchangData.planetary?.aspects?.venusMercury || ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'muhurat' && (
            <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
              {/* Mini Calendar - Left Side (2/9 width) */}
              <div className="lg:col-span-2">
                <div className={`relative ${currentTheme.colors.surface} backdrop-blur-xl rounded-xl p-4 border ${currentTheme.colors.border} z-40`}>
                  {/* Calendar Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm border-b border-white/30 rounded-t-xl -m-4 -mt-4 mb-4">
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">नेपाली मिति</h3>
                        <p className="text-white/90 text-sm">तारीख छान्नुहोस्</p>
                      </div>
                    </div>
                  </div>

                  {/* Month/Year Navigation */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev > 1 ? prev - 1 : 12)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="text-center px-2 relative">
                        <div className="text-white text-lg font-bold mb-1">{nepaliMonths[currentCalendarMonth - 1]}</div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigateYear('prev')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            className="year-picker text-white/90 text-sm font-medium hover:text-white hover:scale-105 transition-all cursor-pointer"
                          >
                            {convertToNepaliNumerals(currentCalendarYear)}
                          </button>
                          <button
                            onClick={() => navigateYear('next')}
                            className="text-white/70 hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* Year Picker Dropdown */}
                        {showYearPicker && (
                          <div className="year-picker absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-2 z-50 w-28 max-h-32 overflow-y-auto">
                            <div className="text-center mb-1">
                              <h3 className="text-gray-800 font-bold text-xs">वर्ष</h3>
                            </div>
                            <div className="space-y-0.5">
                              {generateYearOptions().map(year => (
                                <button
                                  key={year}
                                  onClick={() => selectYear(year)}
                                  className={`w-full px-1 py-0.5 rounded text-xs font-medium transition-all hover:scale-105 ${year === currentCalendarYear
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                  {convertToNepaliNumerals(year)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentCalendarMonth(prev => prev < 12 ? prev + 1 : 1)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:scale-110 border-2 border-white/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'].map((day, index) => (
                        <div key={index} className="text-center py-1">
                          <span className="text-white/90 text-xs font-bold">{day}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(currentCalendarYear, currentCalendarMonth).map(day => {
                        const todayBS = getTodayBSDate();
                        const isToday = todayBS &&
                          todayBS.year === currentCalendarYear &&
                          todayBS.month === currentCalendarMonth &&
                          todayBS.day === day;
                        const isSelected =
                          selectedBSYear === currentCalendarYear &&
                          selectedBSMonth === currentCalendarMonth &&
                          selectedBSDay === day;

                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedBSYear(currentCalendarYear);
                              setSelectedBSMonth(currentCalendarMonth);
                              setSelectedBSDay(day);
                            }}
                            className={`w-8 h-8 rounded-lg transition-all duration-200 font-bold text-xs flex items-center justify-center ${isToday
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105 border-2 border-white/40 ring-2 ring-green-300'
                              : isSelected
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105 border-2 border-white/40'
                                : 'text-white hover:bg-white/20 hover:text-white hover:scale-105 border border-white/20 hover:border-white/40'
                              }`}
                            title={isToday ? "आज (Today)" : ""}
                          >
                            {convertToNepaliNumerals(day)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Cards - Right Side (7/9 width) */}
              <div className="lg:col-span-7">
                <div className="space-y-4">
                  <h2 className={`text-2xl lg:text-3xl font-bold ${currentTheme.colors.text} mb-4 lg:mb-6`}>{t('muhurat')}</h2>

                  {/* Auspicious Times */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Auspicious Times */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        <h3 className="font-bold text-sm">{t('auspiciousTimes')}</h3>
                      </div>
                      <div className="space-y-2">
                        {panchangData.realMuhurats && panchangData.realMuhurats.length > 0 ? (
                          panchangData.realMuhurats.slice(0, 3).map((muhurat, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>
                                {muhurat.name || t('auspiciousTime')}:
                              </span>
                              <span className="text-green-400 font-bold text-sm">{muhurat.time || ""}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center">
                            <p className={`${currentTheme.colors.textSecondary} text-sm`}>No auspicious times available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inauspicious Times */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">❌</span>
                        <h3 className="font-bold text-sm">{t('inauspiciousTimes')}</h3>
                      </div>
                      <div className="space-y-2">
                        {panchangData.inauspiciousTimes && panchangData.inauspiciousTimes.length > 0 ? (
                          panchangData.inauspiciousTimes.slice(0, 3).map((time, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>
                                {time.name || t('inauspiciousTime')}:
                              </span>
                              <span className="text-red-400 font-bold text-sm">{time.time || ""}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center">
                            <p className={`${currentTheme.colors.textSecondary} text-sm`}>No inauspicious times available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Muhurat Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {/* Best Times for Activities */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">⏰</span>
                        <h3 className="font-bold text-sm">{t('bestTimes')}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('business')}:</span>
                          <span className="text-blue-400 font-bold text-xs">
                            {panchangData.bestTimes?.business || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('travel')}:</span>
                          <span className="text-cyan-400 font-bold text-xs">
                            {panchangData.bestTimes?.travel || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('study')}:</span>
                          <span className="text-teal-400 font-bold text-xs">
                            {panchangData.bestTimes?.study || ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nakshatra Timings */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">⭐</span>
                        <h3 className="font-bold text-sm">{t('nakshatraTimings')}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('currentNakshatra')}:</span>
                          <span className="text-purple-400 font-bold text-xs">
                            {panchangData.nakshatra?.name || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('nextNakshatra')}:</span>
                          <span className="text-pink-400 font-bold text-xs">
                            {panchangData.nextNakshatra?.name || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('changeTime')}:</span>
                          <span className="text-rose-400 font-bold text-xs">
                            {panchangData.nextNakshatra?.changeTime || ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tithi Timings */}
                    <div className={`border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-4 lg:p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative z-0`}>
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-2xl -m-4 -mt-4 mb-4 flex items-center gap-2">
                        <span className="text-xl">🌙</span>
                        <h3 className="font-bold text-sm">{t('tithiTimings')}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('currentTithi')}:</span>
                          <span className="text-yellow-400 font-bold text-xs">
                            {panchangData.tithi?.name || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('nextTithi')}:</span>
                          <span className="text-orange-400 font-bold text-xs">
                            {panchangData.nextTithi?.name || ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${currentTheme.colors.textSecondary} text-xs font-semibold`}>{t('changeTime')}:</span>
                          <span className="text-red-400 font-bold text-xs">
                            {panchangData.nextTithi?.changeTime || ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}