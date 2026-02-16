"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { localizeDigits } from '../utils/localization';
import Link from 'next/link';

export default function PanchangWidget() {
    const { t, language } = useLanguage();
    const { currentTheme } = useTheme();
    const [panchang, setPanchang] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPanchang = async () => {
            try {
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0];
                const res = await fetch(`/api/panchang?date=${dateStr}`);
                const data = await res.json();
                if (data.panchang) {
                    setPanchang(data.panchang);
                }
            } catch (error) {
                console.error("Failed to fetch panchang", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPanchang();
    }, []);

    if (loading) return null;
    if (!panchang) return null;

    const formatTimeOnly = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        const timeStr = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        return localizeDigits(timeStr, language);
    };

    const CompactRow = ({ label, value, subValue }) => (
        <div className="flex flex-col justify-center px-3 py-2 bg-white/5 rounded-lg border border-white/5 h-full">
            <div className="text-[9px] uppercase tracking-wider text-orange-400/80 font-bold mb-1 opacity-70">{label}</div>
            <div className={`text-[11px] font-semibold leading-tight ${currentTheme.colors.text} truncate`}>
                {value}
            </div>
            {subValue && (
                <div className="text-[10px] text-white/40 leading-tight truncate mt-0.5 font-medium">
                    {subValue}
                </div>
            )}
        </div>
    );

    const todayDate = new Date(panchang.calendar?.date || new Date());
    const formattedDate = todayDate.toLocaleDateString(language === 'ne' ? 'en-US' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    const localizedDate = language === 'ne' ? localizeDigits(formattedDate, 'ne') : formattedDate;

    return (
        <div className={`h-full min-h-[250px] rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-2xl px-4 py-3 relative group overflow-hidden flex flex-col`}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            {/* Header Block: Condensed Dates */}
            <div className="mb-3 border-b border-white/10 pb-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                        {t('todaysPanchang')}
                    </span>
                    <span className="text-lg">🕉️</span>
                </div>
                <div className={`text-[10px] ${currentTheme.colors.textSecondary} flex flex-wrap gap-x-3 gap-y-1 font-medium`}>
                    <span>📅 {localizedDate}</span>
                    <span className="text-white/30">|</span>
                    <span>V.S. {localizeDigits(panchang.era?.vikrama, language)} {t(panchang.calendar?.hinduMonth)}</span>
                    <span className="text-white/30">|</span>
                    <span>N.S. {localizeDigits(panchang.era?.nepal, language)} {t(panchang.era?.nepal_month)}</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto pr-1 scrollbar-hide space-y-2">

                {/* Sun & Moon Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">☀️</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-orange-200">{localizeDigits(panchang.timings?.sunrise, language)}</span>
                                <span className="text-[9px] text-orange-200/60 font-medium">{t('sunrise')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-orange-200">{localizeDigits(panchang.timings?.sunset, language)}</span>
                            <span className="text-[9px] text-orange-200/60 font-medium">{t('sunset')}</span>
                        </div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🌙</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-blue-200">{localizeDigits(panchang.timings?.moonrise, language)}</span>
                                <span className="text-[9px] text-blue-200/60 font-medium">{t('moonrise')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Data Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <CompactRow
                        label={t('tithi')}
                        value={t(panchang.tithi?.name)}
                        subValue={`${t('upto')} ${formatTimeOnly(panchang.tithi?.end)}`}
                    />
                    <CompactRow
                        label={t('nakshatra')}
                        value={t(panchang.nakshatra?.name)}
                        subValue={`${t('upto')} ${formatTimeOnly(panchang.nakshatra?.end)}`}
                    />
                    <CompactRow
                        label={t('yoga')}
                        value={t(panchang.yoga?.name)}
                        subValue={`${t('upto')} ${formatTimeOnly(panchang.yoga?.end)}`}
                    />
                    <CompactRow
                        label={t('karana')}
                        value={t(panchang.karana?.name)}
                        subValue={`${t('upto')} ${formatTimeOnly(panchang.karana?.end)}`}
                    />
                </div>

                {/* Moon Sign */}
                <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[9px] font-bold text-orange-400/80 uppercase opacity-70">{t('moonSign')}</span>
                    <span className={`text-[10px] sm:text-[11px] font-semibold ${currentTheme.colors.text}`}>
                        {t(panchang.planetary?.moonSign?.name)} <span className="text-white/40 text-[9px] font-normal ml-1">{t('upto')} {formatTimeOnly(panchang.planetary?.moonSign?.end)}</span>
                    </span>
                </div>

                {/* Footer Info: Ritu, Ayana, Dinaman */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                    <div className="text-center p-1.5 bg-white/5 rounded">
                        <div className="text-[8px] uppercase text-white/40 font-bold mb-0.5">{t('paksha')}</div>
                        <div className="text-[9px] text-white truncate font-medium">{t(panchang.calendar?.paksha?.split(' ')[1])}</div>
                    </div>
                    <div className="text-center p-1.5 bg-white/5 rounded">
                        <div className="text-[8px] uppercase text-white/40 font-bold mb-0.5">{t('ritu')}</div>
                        <div className="text-[9px] text-white truncate font-medium">{t(panchang.calendar?.season?.split(' ')[0])}</div>
                    </div>
                    <div className="text-center p-1.5 bg-white/5 rounded">
                        <div className="text-[8px] uppercase text-white/40 font-bold mb-0.5">{t('ayana')}</div>
                        <div className="text-[9px] text-white truncate font-medium">{t(panchang.calendar?.ayana)}</div>
                    </div>
                </div>

                <div className="text-center pt-1">
                    <div className="text-[9px] text-white/30 font-medium">{t('dayLength')}: {localizeDigits(panchang.calendar?.dayDuration?.split('-')[1], language)}</div>
                </div>

            </div>
            <div className="flex justify-end pt-2 mt-auto">
                <Link href="/panchang" className="text-[9px] uppercase font-bold text-white/30 hover:text-white transition-colors">
                    {t('viewFullPanchang')} →
                </Link>
            </div>
        </div>
    );
}
