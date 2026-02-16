"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HiSwitchHorizontal, HiCalendar, HiArrowRight, HiRefresh } from 'react-icons/hi';
import Footer from '../../components/Footer';

// Nepali numerals for display
const toNepaliNumerals = (num) => {
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num).split('').map(d => /[0-9]/.test(d) ? nepaliDigits[Number(d)] : d).join('');
};

const nepaliMonths = [
    'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const COSMIC_DROPDOWN_STYLES = "bg-white/10 border border-white/10 rounded-2xl py-4 px-4 text-center font-bold text-xl outline-none focus:border-purple-500/50 appearance-none transition-all hover:bg-white/20 cursor-pointer flex items-center justify-center gap-2";

const CosmicDropdown = ({ value, options, onChange, label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`flex flex-col gap-2 relative ${className} ${isOpen ? 'z-[100]' : 'z-10'}`} ref={dropdownRef}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={COSMIC_DROPDOWN_STYLES}
            >
                {options.find(opt => opt.value === value)?.label || value}
                <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#050510] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,1)] z-[100] max-h-60 overflow-y-auto custom-scrollbar animate-fade-in ring-1 ring-white/5">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-3 text-center font-bold transition-all cursor-pointer hover:bg-white/10 ${opt.value === value ? 'text-purple-400 bg-white/5' : 'text-gray-300'}`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function DateConverter() {
    const { t } = useLanguage();
    const { currentTheme } = useTheme();
    const [mode, setMode] = useState('ADtoBS'); // 'ADtoBS' or 'BStoAD'
    const [isClient, setIsClient] = useState(false);

    // Date states
    const [adDate, setAdDate] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() });
    const [bsDate, setBsDate] = useState({ year: 2082, month: 9, day: 8 });
    const [convertedDate, setConvertedDate] = useState(null);
    const [error, setError] = useState(null);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        setIsClient(true);
        handleInitialDate();
    }, []);

    const handleInitialDate = async () => {
        try {
            const { ADToBS } = await import('ad-bs-date-conversion');
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const result = ADToBS(todayStr); // YYYY-MM-DD
            const [y, m, d] = result.split('-').map(Number);
            setBsDate({ year: y, month: m, day: d });

            // Initial conversion
            performConversion('ADtoBS', { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() });
        } catch (e) {
            console.error("Initial conversion failed", e);
        }
    };

    const performConversion = async (currMode = mode, date = (mode === 'ADtoBS' ? adDate : bsDate)) => {
        setIsConverting(true);
        setError(null);
        try {
            if (currMode === 'ADtoBS') {
                const { ADToBS } = await import('ad-bs-date-conversion');
                const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                const result = ADToBS(dateStr);
                const [y, m, d] = result.split('-').map(Number);
                setConvertedDate({
                    type: 'BS',
                    year: y,
                    month: m,
                    day: d,
                    formatted: `${toNepaliNumerals(y)} ${nepaliMonths[m - 1]} ${toNepaliNumerals(d)}`
                });
            } else {
                const { BSToAD } = await import('ad-bs-date-conversion');
                const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                const result = BSToAD(dateStr);
                const [y, m, d] = result.split('-').map(Number);
                const adDateObj = new Date(y, m - 1, d);
                setConvertedDate({
                    type: 'AD',
                    year: y,
                    month: m,
                    day: d,
                    formatted: adDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                });
            }
        } catch (e) {
            console.error(e);
            setError("The selected date is outside our calendar range. Please try another date.");
            setConvertedDate(null);
        } finally {
            setTimeout(() => setIsConverting(false), 500);
        }
    };

    const handleToggleMode = () => {
        const newMode = mode === 'ADtoBS' ? 'BStoAD' : 'ADtoBS';
        setMode(newMode);
        setConvertedDate(null);
        setError(null);
    };

    const handleDateChange = (type, field, value) => {
        if (type === 'AD') {
            setAdDate(prev => ({ ...prev, [field]: Number(value) }));
        } else {
            setBsDate(prev => ({ ...prev, [field]: Number(value) }));
        }
    };

    if (!isClient) return null;

    const isBSMode = mode === 'BStoAD';
    const dayOptions = Array.from({ length: 32 }, (_, i) => ({
        label: isBSMode ? toNepaliNumerals(i + 1) : i + 1,
        value: i + 1
    }));
    const adMonthOptions = englishMonths.map((m, i) => ({ label: m.substring(0, 3), value: i + 1 }));
    const bsMonthOptions = nepaliMonths.map((m, i) => ({ label: m, value: i + 1 }));

    const yearRange = mode === 'ADtoBS' ? { start: 1944, end: 2033 } : { start: 2000, end: 2090 };
    const yearOptions = Array.from(
        { length: yearRange.end - yearRange.start + 1 },
        (_, i) => {
            const y = yearRange.start + i;
            return {
                label: isBSMode ? toNepaliNumerals(y) : y,
                value: y
            };
        }
    ).reverse(); // Most recent years first

    return (
        <div className="min-h-screen bg-[#020111] text-white pt-24 pb-12 flex flex-col items-center px-4 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}

                {/* Conversion Toggle Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl mb-20 group transition-all duration-500 hover:border-purple-500/30">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
                        <div className={`flex flex-col items-center transition-all duration-500 ${mode === 'ADtoBS' ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}>
                            <span className="text-blue-400 font-black text-2xl tracking-tighter mb-1">AD</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-300/60">English</span>
                        </div>

                        <button
                            onClick={handleToggleMode}
                            className="relative group/toggle overflow-hidden w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:scale-110 active:scale-95 transition-all duration-300"
                        >
                            <HiSwitchHorizontal className={`w-8 h-8 text-white transition-transform duration-500 ${mode === 'BStoAD' ? 'rotate-180' : 'rotate-0'}`} />
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/toggle:opacity-100 transition-opacity"></div>
                        </button>

                        <div className={`flex flex-col items-center transition-all duration-500 ${mode === 'BStoAD' ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}>
                            <span className="text-purple-400 font-black text-2xl tracking-tighter mb-1">BS</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-purple-300/60">Nepali</span>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up relative z-30">
                        <CosmicDropdown
                            label="Day"
                            value={mode === 'ADtoBS' ? adDate.day : bsDate.day}
                            options={dayOptions}
                            onChange={(val) => handleDateChange(mode === 'ADtoBS' ? 'AD' : 'BS', 'day', val)}
                        />

                        <CosmicDropdown
                            label="Month"
                            value={mode === 'ADtoBS' ? adDate.month : bsDate.month}
                            options={mode === 'ADtoBS' ? adMonthOptions : bsMonthOptions}
                            onChange={(val) => handleDateChange(mode === 'ADtoBS' ? 'AD' : 'BS', 'month', val)}
                        />

                        <CosmicDropdown
                            label="Year"
                            value={mode === 'ADtoBS' ? adDate.year : bsDate.year}
                            options={yearOptions}
                            onChange={(val) => handleDateChange(mode === 'ADtoBS' ? 'AD' : 'BS', 'year', val)}
                        />
                    </div>

                    {/* Convert Button */}
                    <div className="flex justify-center mb-8 relative z-10">
                        <button
                            onClick={() => performConversion()}
                            disabled={isConverting}
                            className={`w-full max-w-xs group/btn relative overflow-hidden py-4 rounded-2xl font-black text-lg tracking-widest uppercase transition-all duration-300 ${isConverting ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x"></div>
                            <span className="relative z-10 flex items-center justify-center gap-3 text-white">
                                {isConverting ? (
                                    <>
                                        <HiRefresh className="w-5 h-5 animate-spin" />
                                        Converting...
                                    </>
                                ) : (
                                    <>
                                        <HiRefresh className="w-5 h-5" />
                                        Convert Date
                                    </>
                                )}
                            </span>
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-8 animate-shake">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <p className="text-red-300 text-sm font-bold leading-tight">{error}</p>
                                <button onClick={() => setError(null)} className="ml-auto text-red-500/60 hover:text-red-400">✕</button>
                            </div>
                        </div>
                    )}

                    {/* Result Interface */}
                    <div className="relative group/result">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl opacity-0 group-hover/result:opacity-100 transition-opacity"></div>
                        <div className="relative bg-black/40 border border-white/5 rounded-[32px] p-6 text-center transform transition-all group-hover/result:scale-[1.02]">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3">Converted Result</div>
                            {convertedDate ? (
                                <div className="animate-fade-in">
                                    <div className="text-3xl md:text-4xl font-black text-white mb-2 font-mono">
                                        {convertedDate.formatted}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-400">
                                        <HiCalendar className="w-4 h-4" />
                                        <span>{convertedDate.type === 'BS' ? 'Bikram Sambat' : 'Anno Domini'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-600 font-bold italic py-2">Select a date to convert...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out 0s 2;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.4);
                }
            `}</style>
        </div>
    );
}
