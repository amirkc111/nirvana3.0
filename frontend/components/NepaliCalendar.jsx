"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Image from 'next/image';
import Footer from './Footer';

const nepaliMonths = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'आश्विन', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुण', 'चैत्र'
];

const englishMonths = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const nepaliDays = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
const englishDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toNepaliNumber(num) {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num)
    .split('')
    .map((d) => (/[0-9]/.test(d) ? nepaliDigits[Number(d)] : d))
    .join('');
}

const holidayNames = [
  'Republic Day',
  'गणतन्त्र दिवस',
  'Eid al-Adha',
  'Bhoto Jaatra',
];

function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

const getWeekdayNp = (dayIdx) => nepaliDays[dayIdx % 7];

// Helper to check if selectedDay is today (dynamic current date)
function isSelectedDayToday(selectedDay, isClient) {
  if (!selectedDay || !isClient) return false;
  const ad = selectedDay.calendarInfo?.dates?.ad;

  // Get current date dynamically
  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  const currentDay = today.getDate().toString();

  return (
    ad?.year?.en === currentYear &&
    ad?.month?.en === currentMonth &&
    ad?.day?.en === currentDay
  );
}

export default function NepaliCalendar() {
  const { t, language } = useLanguage();

  const [year, setYear] = useState(2082);
  const [month, setMonth] = useState(8);
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const availableYears = Array.from({ length: 21 }, (_, i) => 2070 + i); // 2070-2090

  // Handle client-side hydration and dynamic date setting
  useEffect(() => {
    setIsClient(true);

    // Dynamically set current BS year and month
    const setCurrentBSDate = async () => {
      try {
        const { ADToBS } = await import('ad-bs-date-conversion');
        const todayAD = new Date().toISOString().split('T')[0];
        const bsDateStr = ADToBS(todayAD); // Returns "YYYY-MM-DD"
        const [bsY, bsM] = bsDateStr.split('-').map(Number);

        console.log('📅 Setting dynamic current date:', { bsY, bsM: bsM - 1 });
        setYear(bsY);
        setMonth(bsM - 1); // 0-indexed
      } catch (error) {
        console.error('❌ Failed to calculate current BS date:', error);
      }
    };

    setCurrentBSDate();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [modalOpen]);

  useEffect(() => {
    setLoading(true);
    const fileMonth = String(month + 1).padStart(2, '0');
    console.log('Fetching data for:', {
      year,
      month,
      fileMonth,
      monthName: nepaliMonths[month],
      englishMonth: englishMonths[month]
    });
    fetch(`/miti-data/${year}/${fileMonth}.json`)
      .then(res => res.json())
      .then(data => {
        console.log('Loaded monthData:', data);
        if (Array.isArray(data) && data.length > 0) {
          setMonthData(data);
          // Set default selectedDay to today if not already set or if month/year changed
          const today = new Date();
          console.log('Looking for today:', {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate()
          });

          // Find today's date dynamically
          const currentYear = today.getFullYear().toString();
          const currentMonth = today.toLocaleString('en-US', { month: 'long' });
          const currentDay = today.getDate().toString();

          console.log('🔍 Looking for today in data:', {
            year: currentYear,
            month: currentMonth,
            day: currentDay
          });
          console.log('Total days in data:', data.length);

          const todayDay = data.find(day => {
            const ad = day.calendarInfo?.dates?.ad;
            const bs = day.calendarInfo?.dates?.bs;

            // Dynamic matching using current date
            const matches = (
              ad?.year?.en === currentYear &&
              ad?.month?.en === currentMonth &&
              ad?.day?.en === currentDay
            );

            if (matches) {
              console.log('🎯 Found today:', {
                ad: day.calendarInfo?.dates?.ad,
                bs: day.calendarInfo?.dates?.bs,
                dayOfWeek: day.calendarInfo?.days?.dayOfWeek
              });
            }
            return matches;
          }) || data[0]; // Fallback to first day if not found

          console.log('Selected day:', todayDay ? 'Found' : 'Not found');
          setSelectedDay(todayDay || data[0]);
        } else {
          setMonthData([]);
          setSelectedDay(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setMonthData([]);
        setSelectedDay(null);
        setLoading(false);
      });
  }, [year, month]);

  // Find the first day of the week for the month
  let firstDayOfWeek = 0;
  if (Array.isArray(monthData) && monthData[0]?.calendarInfo?.days?.codes?.en) {
    firstDayOfWeek = parseInt(monthData[0].calendarInfo.days.codes.en, 10);
    if (isNaN(firstDayOfWeek) || firstDayOfWeek < 1 || firstDayOfWeek > 7) {
      console.warn('Invalid firstDayOfWeek:', firstDayOfWeek, 'Defaulting to 0');
      firstDayOfWeek = 0;
    } else {
      // Nepali: 1=Sunday, 2=Monday, ..., 7=Saturday; JS grid: 0=Sunday, ..., 6=Saturday
      firstDayOfWeek = firstDayOfWeek - 1;
    }
    console.log('firstDayOfWeek:', firstDayOfWeek, 'first day object:', monthData[0]);
  }
  const days = [];
  if (Array.isArray(monthData) && monthData.length > 0) {
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 0; d < monthData.length; d++) days.push(monthData[d]);
  }

  // Extract all events and holidays for the month
  const allEvents = [];
  const allHolidays = [];
  if (Array.isArray(monthData) && monthData.length > 0) {
    monthData.forEach((day, idx) => {
      if (Array.isArray(day.eventDetails)) {
        day.eventDetails.forEach(event => {
          const isHoliday =
            event.isHoliday === true ||
            event.isHoliday === 1 ||
            event.isHoliday === '1' ||
            event.isHoliday === 'true' ||
            event.isHoliday === 'Yes' ||
            (event.eventType && String(event.eventType).toLowerCase() === 'holiday') ||
            (event.category && String(event.category).toLowerCase() === 'holiday') ||
            (event.type && String(event.type).toLowerCase() === 'holiday') ||
            holidayNames.includes(event.title?.en) ||
            holidayNames.includes(event.title?.np);
          let adDate = day.calendarInfo?.dates?.ad?.full?.en;
          if (adDate) {
            const parts = adDate.split('-');
            if (parts.length === 3) {
              adDate = `${parts[0]}-${pad2(Number(parts[1]))}-${pad2(Number(parts[2]))}`;
            }
          }
          const bsDay = day.calendarInfo?.dates?.bs?.day?.np || day.calendarInfo?.dates?.bs?.day?.en;
          const weekday = getWeekdayNp(idx % 7);
          const item = {
            bsDay,
            weekday,
            title: event.title?.np || event.title?.en,
            adDate,
            isHoliday,
          };
          if (isHoliday) allHolidays.push(item);
          else allEvents.push(item);
        });
      }
    });
  }

  if (loading || !isClient) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <span className="ml-4 text-white text-xl">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="w-full flex flex-col items-center">
            {/* Unified card */}
            <div className="w-full max-w-6xl border-l-4 sm:border-l-8 border-red-500 rounded-xl shadow bg-white p-1 sm:p-2 md:p-4 lg:p-6 gap-2 sm:gap-4 md:gap-6 flex flex-col md:flex-row items-start">
              {/* Main calendar section */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Mobile Top Widget */}
                <div className="block md:hidden w-full bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow p-3 mb-4 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="text-xl font-bold">{toNepaliNumber(selectedDay?.calendarInfo?.dates?.bs?.day?.np || selectedDay?.calendarInfo?.dates?.bs?.day?.en || '')}</div>
                      <div className="text-xs opacity-80">{nepaliMonths[month]} {toNepaliNumber(year)}</div>
                    </div>
                    {isSelectedDayToday(selectedDay, isClient) && (
                      <div className="bg-white/20 rounded px-2 py-0.5 text-xs font-semibold">आज</div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <div>🌅 सूर्योदय: {selectedDay?.panchangaDetails?.times?.sunrise || '-'}</div>
                    <div>🌇 सूर्यास्त: {selectedDay?.panchangaDetails?.times?.sunset || '-'}</div>
                    <div>🕑 तिथि: {selectedDay?.tithiDetails?.title?.np || selectedDay?.tithiDetails?.title?.en || '-'}</div>
                  </div>
                </div>
                {/* Controls (modern navigation with dropdowns) */}
                <div className="flex flex-col items-center justify-center w-full mb-1 sm:mb-2 gap-1 sm:gap-2">
                  <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <Image
                      src="/an.png"
                      alt="Nirvana Astro Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm"
                    />
                    <span className="text-sm sm:text-base font-bold text-gray-700 hidden sm:block">Nirvana Astro</span>
                    <button
                      onClick={async () => {
                        try {
                          const { ADToBS } = await import('ad-bs-date-conversion');
                          const todayAD = new Date().toISOString().split('T')[0];
                          const bsDateStr = ADToBS(todayAD);
                          const [bsY, bsM] = bsDateStr.split('-').map(Number);
                          setYear(bsY);
                          setMonth(bsM - 1);
                        } catch (e) {
                          // Fallback
                          setYear(2082);
                          setMonth(8); // Poush (Dec 2025)
                        }
                      }}
                      className="px-2 py-1 sm:px-3 sm:py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-xs sm:text-sm font-medium"
                    >
                      आज
                    </button>
                    <button
                      aria-label="Previous month"
                      className="px-1 py-1 sm:px-2 sm:py-1 rounded bg-gray-100 text-gray-700 text-sm sm:text-lg hover:bg-gray-200"
                      onClick={() => {
                        if (month === 0) {
                          setYear(y => y > availableYears[0] ? y - 1 : y);
                          setMonth(11);
                        } else {
                          setMonth(m => m - 1);
                        }
                      }}
                    >
                      ‹
                    </button>
                    <select
                      value={Number(year)}
                      onChange={e => setYear(Number(e.target.value))}
                      className="px-1 py-1 sm:px-2 sm:py-1 rounded border border-gray-200 text-xs sm:text-sm w-auto min-w-[60px] sm:min-w-[80px] text-center font-bold text-indigo-700"
                    >
                      {availableYears.map(y => (
                        <option key={y} value={y}>{toNepaliNumber(y)}</option>
                      ))}
                    </select>
                    <select
                      value={Number(month)}
                      onChange={e => setMonth(Number(e.target.value))}
                      className="px-1 py-1 sm:px-2 sm:py-1 rounded border border-gray-200 text-xs sm:text-sm w-auto min-w-[60px] sm:min-w-[80px] text-center font-bold text-indigo-700"
                    >
                      {nepaliMonths.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                      ))}
                    </select>
                    <button
                      aria-label="Next month"
                      className="px-1 py-1 sm:px-2 sm:py-1 rounded bg-gray-100 text-gray-700 text-sm sm:text-lg hover:bg-gray-200"
                      onClick={() => {
                        if (month === 11) {
                          setYear(y => y < availableYears[availableYears.length - 1] ? y + 1 : y);
                          setMonth(0);
                        } else {
                          setMonth(m => m + 1);
                        }
                      }}
                    >
                      ›
                    </button>
                  </div>
                </div>
                {/* Weekday Row (Nepali) */}
                <div className="grid grid-cols-7 bg-gray-50 rounded-t-lg">
                  {['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'].map((d, i) => (
                    <div key={d} className={`text-center py-1.5 sm:py-2 md:py-3 text-[10px] sm:text-xs md:text-sm font-medium border-b border-indigo-100 ${i === 6 ? 'text-red-600' : 'text-gray-700'}`}>{d}</div>
                  ))}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-px sm:p-2 bg-white flex-1 h-full overflow-x-auto scrollbar-hide">
                  {days.length === 0 && (
                    <div className="col-span-7 text-center text-red-500 py-8">No days to display. Check data structure and logs.</div>
                  )}
                  {Array(firstDayOfWeek).fill(null).map((_, idx) => (
                    <div key={"empty-" + idx} className="bg-transparent border-none"></div>
                  ))}
                  {days.map((day, idx) => {
                    if (!day) return null;
                    // Calculate the column index for this cell (0=Sunday, 6=Saturday)
                    const colIdx = (idx) % 7;
                    const isSaturdayCol = colIdx === 6;
                    // Check if this is today: October 21, 2025 = ४ कार्तिक २०८२
                    const cellAD = day.calendarInfo?.dates?.ad;
                    const cellBS = day.calendarInfo?.dates?.bs;

                    // Dynamic today detection - get current date
                    const isToday = isClient && (
                      cellAD?.year?.en === new Date().getFullYear().toString() &&
                      cellAD?.month?.en === new Date().toLocaleString('en-US', { month: 'long' }) &&
                      cellAD?.day?.en === new Date().getDate().toString()
                    );

                    // Debug logging for today's cell
                    if (isToday) {
                      console.log('🎯 TODAY FOUND:', {
                        ad: cellAD,
                        bs: cellBS,
                        dayOfWeek: day.calendarInfo?.days?.dayOfWeek
                      });
                    }
                    return (
                      <div
                        key={idx}
                        role="button"
                        tabIndex={0}
                        className={`h-auto min-h-[85px] min-w-[45px] sm:min-h-[85px] sm:min-w-[60px] p-1 sm:p-2 pb-2 transition-all duration-200 group rounded-lg flex flex-col justify-between
                          ${isToday ? 'bg-indigo-50 border-2 border-indigo-300' :
                            isSaturdayCol ? 'bg-red-50 border border-red-500' : 'bg-white border border-gray-200'}
                          ${!isToday ? 'hover:bg-red-50' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const dayClone = JSON.parse(JSON.stringify(day));
                          setSelectedDay(dayClone);
                          setTimeout(() => setModalOpen(true), 0);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            const dayClone = JSON.parse(JSON.stringify(day));
                            setSelectedDay(dayClone);
                            setTimeout(() => setModalOpen(true), 0);
                          }
                        }}
                      >
                        <div className="w-full h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <span className={`text-[9px] sm:text-xs px-0.5 py-0.5 ${isToday ? 'text-indigo-600' : isSaturdayCol ? 'text-red-700' : 'text-gray-600'}`}>{day.calendarInfo?.dates?.ad?.day?.en || ''}</span>
                            <span className={`text-[8px] sm:text-xs leading-tight ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>{day.tithiDetails?.title?.np || day.tithiDetails?.title?.en || ''}</span>
                          </div>
                          <div className="flex justify-center items-center my-0 sm:my-2">
                            <span className={`flex items-center justify-center rounded-full w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-sm sm:text-base md:text-lg lg:text-xl ${isToday ? 'text-indigo-800 font-bold' : isSaturdayCol ? 'text-red-600' : 'text-gray-700'}`}>{day.calendarInfo?.dates?.bs?.day?.np || day.calendarInfo?.dates?.bs?.day?.en || ''}</span>
                          </div>
                          <div className="mt-auto">
                            {day.eventDetails && day.eventDetails.some(e => e.isHoliday) ? (
                              <p
                                className={`text-[8px] sm:text-[9px] md:text-[10px] mt-0.5 sm:mt-1 text-center w-full leading-tight font-medium whitespace-normal break-words ${isToday ? 'text-red-700' : 'text-red-600'}`}
                                title={day.eventDetails.find(e => e.isHoliday)?.title?.np || day.eventDetails.find(e => e.isHoliday)?.title?.en || ''}
                              >
                                {day.eventDetails.find(e => e.isHoliday)?.title?.np || day.eventDetails.find(e => e.isHoliday)?.title?.en || ''}
                              </p>
                            ) : (
                              day.eventDetails && day.eventDetails.length > 0 && (
                                <p className={`text-[8px] sm:text-[9px] md:text-[10px] mt-0.5 sm:mt-1 text-center w-full leading-tight font-medium whitespace-normal break-words ${isToday ? 'text-indigo-700' : 'text-indigo-700'}`}>
                                  {day.eventDetails[0]?.title?.np || day.eventDetails[0]?.title?.en || ''}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Sidebar Section - responsive */}
              <div className="flex w-auto md:w-80 flex-shrink-0 h-auto md:h-[700px] flex-col md:overflow-y-auto scrollbar-hide">
                <div className="hidden md:block bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow p-4 mb-4 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="text-xl font-bold">{toNepaliNumber(selectedDay?.calendarInfo?.dates?.bs?.day?.np || selectedDay?.calendarInfo?.dates?.bs?.day?.en || '')}</div>
                      <div className="text-xs opacity-80">{nepaliMonths[month]} {toNepaliNumber(year)}</div>
                    </div>
                    {isSelectedDayToday(selectedDay, isClient) && (
                      <div className="bg-white/20 rounded px-2 py-0.5 text-xs font-semibold">आज</div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <div>🌅 सूर्योदय: {selectedDay?.panchangaDetails?.times?.sunrise || '-'}</div>
                    <div>🌇 सूर्यास्त: {selectedDay?.panchangaDetails?.times?.sunset || '-'}</div>
                    <div>🕑 तिथि: {selectedDay?.tithiDetails?.title?.np || selectedDay?.tithiDetails?.title?.en || '-'}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow p-4 mb-4 flex-none md:flex-1 h-80 md:h-auto overflow-y-auto scrollbar-hide">
                  <h3 className="text-base font-bold mb-1 text-gray-700">कार्यक्रमहरू</h3>
                  {allEvents.length === 0 ? (
                    <div className="bg-indigo-50 text-indigo-700 rounded p-2 text-center text-sm">कार्यक्रम छैन</div>
                  ) : (
                    <div className="space-y-3">
                      {allEvents.map((e, i) => (
                        <div key={i} className="flex items-center space-x-4 border rounded-lg p-2">
                          <div className="rounded-lg text-center w-12 h-12 flex flex-col items-center justify-center bg-white">
                            <p className="text-2xl font-extrabold text-black leading-none">{e.bsDay}</p>
                            <p className="text-xs font-bold text-black leading-none">{e.weekday}</p>
                          </div>
                          <div className="flex-1">
                            <span className="flex flex-row items-start">
                              <p className="font-bold text-left flex-1 text-black text-base">{e.title}</p>
                            </span>
                            <p className="text-xs text-gray-500">{e.adDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-2xl shadow p-4 mb-4 flex-none md:flex-1 h-80 md:h-auto overflow-y-auto scrollbar-hide">
                  <h3 className="text-base font-bold mb-1 text-gray-700">बिदाहरू</h3>
                  {allHolidays.length === 0 ? (
                    <div className="bg-red-50 text-red-700 rounded p-2 text-center text-sm">बिदा छैन</div>
                  ) : (
                    <div className="space-y-3">
                      {allHolidays.map((e, i) => (
                        <div key={i} className="flex items-center space-x-4 border rounded-lg p-2">
                          <div className={`rounded-lg text-center w-12 h-12 flex flex-col items-center justify-center
                            ${e.isHoliday ? 'bg-red-50' : 'bg-white'}
                          `}>
                            <p className="text-2xl font-extrabold text-black leading-none">{e.bsDay}</p>
                            <p className="text-xs font-bold text-black leading-none">{e.weekday}</p>
                          </div>
                          <div className="flex-1">
                            <span className="flex flex-row items-start">
                              <p className="font-bold text-left flex-1 text-ellipsis text-red-500">{e.title}</p>
                            </span>
                            <p className="text-xs text-gray-500">{e.adDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for day details */}
      {modalOpen && selectedDay && selectedDay.calendarInfo && (
        <>
          {/* Mobile Modal */}
          <div className="fixed inset-0 z-[90] md:hidden">
            {/* Backdrop - Removed */}

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out animate-slideInUp relative z-20">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold">Day Details</h2>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Date Display */}
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{selectedDay.calendarInfo?.dates?.bs?.day?.np}</div>
                    <div className="text-lg font-semibold mb-1">{selectedDay.calendarInfo?.days?.dayOfWeek?.np}</div>
                    <div className="text-sm opacity-90">{selectedDay.calendarInfo?.dates?.bs?.month?.np}, {selectedDay.calendarInfo?.dates?.bs?.year?.np}</div>
                    <div className="text-xs opacity-80 mt-2">{selectedDay.tithiDetails?.title?.np}, {selectedDay.panchangaDetails?.pakshya?.np}</div>
                  </div>

                  {/* Sun Times */}
                  <div className="flex justify-center space-x-6 mt-3 text-xs">
                    <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                      <span>🌅</span>
                      <span>{selectedDay.panchangaDetails?.times?.sunrise || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                      <span>🌇</span>
                      <span>{selectedDay.panchangaDetails?.times?.sunset || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[60vh]">
                  {/* Events */}
                  {selectedDay.eventDetails && selectedDay.eventDetails.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2 text-lg">📅</span>
                        Events
                      </h3>
                      <div className="space-y-2">
                        {selectedDay.eventDetails.map((e, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 border-l-3 border-indigo-500">
                            <div className="text-sm font-medium text-gray-800">{e.title?.np || e.title?.en}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Auspicious Times */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2 text-lg">⏰</span>
                      शुभ साइत
                    </h3>
                    {selectedDay.auspiciousMoments?.sahits?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDay.auspiciousMoments.sahits.map((sahit, i) => (
                          <div key={i} className="bg-yellow-50 rounded-lg p-3 border-l-3 border-yellow-500">
                            <div className="text-sm font-medium text-gray-800">{sahit.title?.np || sahit.title?.en}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-red-50 rounded-lg p-3 border-l-3 border-red-500">
                        <div className="text-sm font-medium text-red-700">आज शुभ साइत छैन</div>
                      </div>
                    )}
                  </div>

                  {/* Panchang Details */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2 text-lg">📜</span>
                      पञ्चाङ्ग
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Date</div>
                        <div className="text-sm font-semibold text-gray-800">{selectedDay.calendarInfo?.dates?.ad?.full?.en}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Moon Sign</div>
                        <div className="text-sm font-semibold text-gray-800">{selectedDay.panchangaDetails?.chandraRashi?.time?.np || '-'}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Sun Sign</div>
                        <div className="text-sm font-semibold text-gray-800">{selectedDay.panchangaDetails?.suryaRashi?.np || '-'}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Season</div>
                        <div className="text-sm font-semibold text-gray-800">{selectedDay.hrituDetails?.title?.np || '-'}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Yoga</div>
                        <div className="text-sm font-semibold text-gray-800">{selectedDay.panchangaDetails?.yog?.np || '-'}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Tithi</div>
                        <div className="text-sm font-semibold text-gray-800">{selectedDay.tithiDetails?.title?.np || '-'}{selectedDay.tithiDetails?.endTime?.np ? ` ${selectedDay.tithiDetails?.endTime?.np} बजेसम्म` : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* Muhurat Times */}
                  {selectedDay.auspiciousMoments?.muhurats?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2 text-lg">⏳</span>
                        काल / मुहूर्तम्
                      </h3>
                      <div className="space-y-2">
                        {selectedDay.auspiciousMoments.muhurats.slice(0, 4).map((muhurat, i) => (
                          <div key={i} className="bg-yellow-50 rounded-lg p-3 border-l-3 border-yellow-500">
                            <div className="text-sm font-medium text-gray-800">{muhurat.periodName}</div>
                            {muhurat.duration && (
                              <div className="text-xs text-gray-600 mt-1">{muhurat.duration}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Modal */}
          <div className="hidden md:block fixed inset-0 z-[90] flex items-start justify-center pt-28 px-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setModalOpen(false);
              }
            }}>
            {/* Backdrop - Removed */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] p-0 relative overflow-hidden transform transition-all duration-300 ease-in-out animate-slideInUp mx-auto z-20">
              <button className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl font-bold transition-colors" onClick={() => setModalOpen(false)} aria-label="Close">×</button>
              <div className="p-8 pb-4 flex flex-col items-center bg-gradient-to-b from-indigo-50 to-white">
                <div className="flex flex-col items-center mb-2">
                  <div className="text-5xl font-extrabold text-indigo-700 drop-shadow-sm">{selectedDay.calendarInfo?.dates?.bs?.day?.np}</div>
                  <div className="text-lg font-bold text-gray-700 tracking-wide">{selectedDay.calendarInfo?.days?.dayOfWeek?.np}</div>
                  <div className="text-base text-gray-500">{selectedDay.calendarInfo?.dates?.bs?.month?.np}, {selectedDay.calendarInfo?.dates?.bs?.year?.np}</div>
                </div>
                <div className="text-base text-indigo-800 font-semibold mt-2 mb-1">{selectedDay.tithiDetails?.title?.np}, {selectedDay.panchangaDetails?.pakshya?.np}</div>
                <div className="text-xs text-gray-500 mb-2">ने.सं. {selectedDay.calendarInfo?.nepaliEra?.nepalSambat?.year?.np}, {selectedDay.calendarInfo?.nepaliEra?.nepalSambat?.month?.np}</div>
                <div className="flex gap-6 justify-center items-center mb-2">
                  <div className="flex items-center gap-1 text-sm text-gray-700"><span role="img" aria-label="sunrise">🌅</span> {selectedDay.panchangaDetails?.times?.sunrise || '-'}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-700"><span role="img" aria-label="sunset">🌇</span> {selectedDay.panchangaDetails?.times?.sunset || '-'}</div>
                </div>
              </div>
              <div className="px-8 pt-2 pb-6">
                <div className="border-b border-indigo-100 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Calendar Events */}
                  <div>
                    <h3 className="font-bold text-indigo-700 text-lg mb-2 flex items-center gap-2"><span role="img" aria-label="calendar">🗓️</span> Calendar Events</h3>
                    {selectedDay.eventDetails && selectedDay.eventDetails.length > 0 ? (
                      <ul className="list-disc pl-6 text-gray-800 text-sm">
                        {selectedDay.eventDetails.map((e, i) => (
                          <li key={i}>{e.title?.np || e.title?.en}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 italic text-sm">No events available</div>
                    )}
                  </div>
                  {/* शुभ साइत / मुहूर्त */}
                  <div className="bg-yellow-50 rounded-xl p-4 shadow-sm h-fit">
                    <h3 className="font-bold text-yellow-700 mb-2 text-base flex items-center gap-2"><span role="img" aria-label="muhurta">⏰</span> शुभ साइत / मुहूर्त</h3>
                    {selectedDay.auspiciousMoments?.sahits?.length > 0 ? (
                      <ul>
                        {selectedDay.auspiciousMoments.sahits.map((sahit, i) => (
                          <li key={i} className="text-sm text-gray-700">{sahit.title?.np || sahit.title?.en}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm font-bold text-red-600">आज शुभ साइत / मुहूर्त छैन।</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-indigo-700 mb-2 text-base flex items-center gap-2"><span role="img" aria-label="panchang">📜</span> पञ्चाङ्ग</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><span className="font-semibold">तारिख:</span> {selectedDay.calendarInfo?.dates?.ad?.full?.en}</div>
                      <div><span className="font-semibold">चन्द्र राशि:</span> {selectedDay.panchangaDetails?.chandraRashi?.time?.np || '-'}</div>
                      <div><span className="font-semibold">सूर्य राशि:</span> {selectedDay.panchangaDetails?.suryaRashi?.np || '-'}</div>
                      <div><span className="font-semibold">ऋतु:</span> {selectedDay.hrituDetails?.title?.np || '-'}</div>
                      <div><span className="font-semibold">नक्षत्र समाप्ति समय:</span> १७:४३</div>
                      <div><span className="font-semibold">करण १:</span> {selectedDay.panchangaDetails?.karans?.first?.np || '-'}</div>
                      <div><span className="font-semibold">करण २:</span> {selectedDay.panchangaDetails?.karans?.second?.np || '-'}</div>
                      <div><span className="font-semibold">पक्ष:</span> {selectedDay.panchangaDetails?.pakshya?.np || '-'}</div>
                      <div><span className="font-semibold">योग:</span> {selectedDay.panchangaDetails?.yog?.np || '-'}</div>
                      <div><span className="font-semibold">तिथि:</span> {selectedDay.tithiDetails?.title?.np || '-'}{selectedDay.tithiDetails?.endTime?.np ? ` ${selectedDay.tithiDetails?.endTime?.np} बजेसम्म` : ''}</div>
                    </div>
                  </div>
                  {/* काल / मुहूर्तम् */}
                  <div className="bg-yellow-50 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-yellow-700 mb-2 text-base flex items-center gap-2"><span role="img" aria-label="kaal">⏳</span> काल / मुहूर्तम्</h3>
                    {selectedDay.auspiciousMoments?.muhurats?.length > 0 ? (
                      <ul>
                        {selectedDay.auspiciousMoments.muhurats.map((muhurat, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            {muhurat.periodName} {muhurat.duration ? `: ${muhurat.duration}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm font-bold text-red-600">आज काल / मुहूर्तम् छैन।</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
      {/* Custom Styles for Scrollbar Hiding and Mobile List Height */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @media (max-width: 768px) {
          .force-mobile-scroll {
            height: 300px !important;
            max-height: 300px !important;
            overflow-y: auto !important;
            flex: none !important;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}