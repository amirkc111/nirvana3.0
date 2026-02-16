"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';
import { toNepaliNumerals } from '../lib/vedicjyotish/services/NepaliLocalization';

const nepaliMonths = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'आश्विन', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुण', 'चैत्र'
];

const englishMonths = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export default function NepaliMiniCalendar() {
    const { t, language } = useLanguage();
    const { currentTheme } = useTheme();
    const [currentBS, setCurrentBS] = useState({ year: 2082, month: 8, day: 1 });
    const [monthData, setMonthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    const sliderImages = [
        "/thumb1.jpg",
        "/thumb2.jpg",
        "/thumb3.jpg",
        "/thumb4.jpg",
        "/weather.jpg"
    ];

    const adImages = [
        "/ad_banner.jpg",
        "/horoscope.jpg",
        "/kundali.jpg",
        "/bulb.png"
    ];

    // Header Slider (Legacy)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Ad Banner Slider
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % adImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Clock Timer (Removed in favor of Event Rotator)
    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setCurrentTime(new Date());
    //     }, 1000);
    //     return () => clearInterval(timer);
    // }, []);

    // Event Rotator
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentEventIndex((prev) => prev + 1);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setIsClient(true);
        const fetchCurrentDate = async () => {
            try {
                const { ADToBS } = await import('ad-bs-date-conversion');
                const todayAD = new Date().toISOString().split('T')[0];
                const bsDateStr = ADToBS(todayAD);
                const [bsY, bsM, bsD] = bsDateStr.split('-').map(Number);
                setCurrentBS({ year: bsY, month: bsM - 1, day: bsD });
            } catch (error) {
                console.error('Failed to get current BS date:', error);
            }
        };
        fetchCurrentDate();
    }, []);

    useEffect(() => {
        if (!isClient) return;
        setLoading(true);
        const fileMonth = String(currentBS.month + 1).padStart(2, '0');
        const url = `/miti-data/${currentBS.year}/${fileMonth}.json`;
        console.log('📅 NepaliMiniCalendar: Fetching', url);

        fetch(url)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('✅ NepaliMiniCalendar: Loaded data', data?.length);
                if (Array.isArray(data)) {
                    setMonthData(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('❌ NepaliMiniCalendar: Fetch failed', err);
                setLoading(false);
            });
    }, [currentBS.year, currentBS.month, isClient]);

    if (!isClient || loading) {
        return (
            <div className="h-48 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // Calculate grid padding
    let firstDayOfWeek = 0;
    if (monthData.length > 0) {
        firstDayOfWeek = parseInt(monthData[0].calendarInfo?.days?.codes?.en || '1', 10) - 1;
    }

    const today = new Date();
    // Use data from the fetched JSON for today if available, otherwise fallback
    const todayData = monthData.find(d =>
        d.calendarInfo?.dates?.ad?.day?.en === today.getDate().toString() &&
        d.calendarInfo?.dates?.ad?.month?.en === today.toLocaleString('en-US', { month: 'long' }) &&
        d.calendarInfo?.dates?.ad?.year?.en === today.getFullYear().toString()
    );

    const tithi = todayData?.tithiDetails?.title?.[language === 'ne' ? 'np' : 'np'] || t('tithiLoading'); // Determine language preference
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();


    // Date strings
    const bsDay = language === 'ne' ? toNepaliNumerals(currentBS.day) : currentBS.day;
    const bsMonth = language === 'ne' ? nepaliMonths[currentBS.month] : englishMonths[currentBS.month];
    const bsYear = language === 'ne' ? toNepaliNumerals(currentBS.year) : currentBS.year;
    const adDateStr = today.toLocaleDateString(language === 'ne' ? 'en-US' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const weekDay = todayData?.calendarInfo?.days?.dayOfWeek?.[language === 'ne' ? 'np' : 'en'] || (language === 'ne' ? 'बार' : 'Day');

    return (
        <div className="w-full max-w-[420px] mx-auto flex flex-col gap-3 group font-sans">
            {/* MINI CALENDAR CARD */}
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-[32px] opacity-30 group-hover:opacity-60 blur transition duration-500"></div>

                <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-[#0f0c29]/80 backdrop-blur-2xl border border-white/10 flex flex-col">
                    {/* NESTED AD BANNER */}
                    <div className="relative w-full h-24 overflow-hidden border-b border-white/10 bg-purple-900/10">
                        {adImages.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Ad ${index}`}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentAdIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-bold uppercase tracking-wider text-white/80 border border-white/20 z-10">
                            {t('sponsored')}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                    </div>



                    {/* BOTTOM SECTION: Calendar Body */}
                    <div className="flex-1 min-h-0 p-3 bg-[#0f0c29]/90 backdrop-blur-3xl border-t border-white/10">
                        <div className="flex flex-row items-stretch h-full w-full">
                            {/* LEFT: Date Info (Fixed Width) */}
                            <div className="w-20 sm:w-24 shrink-0 flex flex-col justify-center pr-2 border-r border-white/10">
                                <h3 className="text-lg font-bold text-white leading-tight">
                                    {bsDay} <span className="text-base text-purple-300 block">{bsMonth}</span>
                                </h3>
                                <p className="text-[10px] text-gray-300 font-medium mt-0.5 leading-tight">
                                    {language === 'ne' ? weekDay : weekDay}, {bsYear}
                                </p>
                                <div className="text-[10px] text-gray-400 font-medium mt-0 leading-tight">
                                    {adDateStr}
                                </div>

                                <div className="mt-1 space-y-0.5">
                                    <p className="text-[10px] text-purple-200 font-medium tracking-wide truncate w-full">
                                        {tithi}
                                    </p>
                                </div>

                                {(() => {
                                    // Extract events for today
                                    const events = todayData?.eventDetails || [];
                                    const eventList = events.length > 0 ? events : [{ title: { en: t('noEvents'), np: t('noEvents') } }];
                                    const activeEvent = eventList[currentEventIndex % eventList.length];
                                    const eventText = activeEvent?.title?.[language === 'ne' ? 'np' : 'en'] || activeEvent?.title?.en || '';

                                    return (
                                        <div className="mt-2 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 font-sans tracking-tight leading-tight min-h-[1.5em] animate-fade-in">
                                            {eventText}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* RIGHT: Grid (Fills Remaining) */}
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                {/* Days Header */}
                                <div className="grid grid-cols-7 mb-1 text-center w-full gap-x-5 sm:gap-x-5">
                                    {(language === 'ne' ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day, i) => (
                                        <div key={i} className={`text-[10px] font-bold ${i === 6 ? 'text-red-400' : 'text-gray-400'} uppercase`}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Dates */}
                                <div className="grid grid-cols-7 gap-y-0.5 gap-x-5 place-items-center w-full">
                                    {Array(firstDayOfWeek).fill(null).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square w-full"></div>
                                    ))}
                                    {monthData.map((day, i) => {
                                        const isToday =
                                            day.calendarInfo?.dates?.ad?.day?.en === today.getDate().toString() &&
                                            day.calendarInfo?.dates?.ad?.month?.en === today.toLocaleString('en-US', { month: 'long' }) &&
                                            day.calendarInfo?.dates?.ad?.year?.en === today.getFullYear().toString();

                                        const isSaturday = (i + firstDayOfWeek) % 7 === 6;

                                        return (
                                            <div
                                                key={i}
                                                className={`
                                                aspect-square w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-default
                                                ${isToday
                                                        ? 'bg-green-600 text-white shadow-sm ring-1 ring-white/20'
                                                        : isSaturday
                                                            ? 'text-red-400'
                                                            : 'text-gray-300'
                                                    }
                                            `}
                                            >
                                                {language === 'ne' ? toNepaliNumerals(day.calendarInfo?.dates?.bs?.day?.en) : day.calendarInfo?.dates?.bs?.day?.en}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
