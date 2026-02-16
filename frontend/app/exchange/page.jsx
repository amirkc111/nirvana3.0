"use client";

import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, RefreshCw, DollarSign, ArrowRightLeft,
    Calendar, Globe, Activity, Search, Info, Zap
} from 'lucide-react';
import Footer from '../../components/Footer';

// Mock historical data for initial render (will replace with fetched data if available)
const mockChartData = [
    { date: 'Jan 05', value: 133.50 },
    { date: 'Jan 06', value: 133.72 },
    { date: 'Jan 07', value: 133.65 },
    { date: 'Jan 08', value: 134.10 },
    { date: 'Jan 09', value: 133.95 },
    { date: 'Jan 10', value: 134.25 },
    { date: 'Jan 11', value: 134.15 },
];

const CURRENCY_FLAGS = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", INR: "🇮🇳", AUD: "🇦🇺",
    CAD: "🇨🇦", JPY: "🇯🇵", CNY: "🇨🇳", SAR: "🇸🇦", QAR: "🇶🇦",
    THB: "🇹🇭", AED: "🇦🇪", MYR: "🇲🇾", KRW: "🇰🇷", SGD: "🇸🇬"
};

export default function ExchangePage() {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [convertAmount, setConvertAmount] = useState(1);
    const [convertFrom, setConvertFrom] = useState('USD');
    const [convertTo, setConvertTo] = useState('NPR');
    const [chartType, setChartType] = useState('pulse'); // 'pulse', 'bar', 'line'
    const [chartCurrency, setChartCurrency] = useState('USD');

    useEffect(() => {
        fetchRates();
    }, []);

    useEffect(() => {
        fetchHistoricalData(chartCurrency);
    }, [chartCurrency]);

    const fetchRates = async () => {
        setLoading(true);
        try {
            // Fetch today and yesterday to calculate trends
            const toDate = new Date().toISOString().split('T')[0];
            const fromDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const response = await fetch(`https://www.nrb.org.np/api/forex/v1/rates?from=${fromDate}&to=${toDate}&per_page=100&page=1`);
            const data = await response.json();

            if (data && data.data && data.data.payload) {
                const payload = data.data.payload;
                const today = payload[0];
                const yesterday = payload[1];

                const formattedRates = today.rates.map(r => {
                    const prevRate = yesterday?.rates.find(pr => pr.currency.iso3 === r.currency.iso3);
                    let trend = 'same';
                    if (prevRate) {
                        const diff = parseFloat(r.sell) - parseFloat(prevRate.sell);
                        if (diff > 0) trend = 'up';
                        else if (diff < 0) trend = 'down';
                    }

                    return {
                        currency: r.currency.iso3,
                        name: r.currency.name,
                        unit: r.currency.unit,
                        buy: parseFloat(r.buy),
                        sell: parseFloat(r.sell),
                        trend: trend,
                        flag: CURRENCY_FLAGS[r.currency.iso3] || "🏳️"
                    };
                });

                setRates(formattedRates);
                if (!selectedCurrency) {
                    setSelectedCurrency(formattedRates.find(r => r.currency === 'USD') || formattedRates[0]);
                }
            } else {
                throw new Error("Invalid API response format");
            }
        } catch (err) {
            console.error("Forex fetch error:", err);
            setError("Failed to fetch live rates. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoricalData = async (currencyIso) => {
        setChartLoading(true);
        try {
            const toDate = new Date().toISOString().split('T')[0];
            const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const response = await fetch(`https://www.nrb.org.np/api/forex/v1/rates?from=${fromDate}&to=${toDate}&per_page=100&page=1`);
            const data = await response.json();

            if (data && data.data && data.data.payload) {
                const payload = data.data.payload;
                const trendData = payload.map(day => {
                    const rateObj = day.rates.find(r => r.currency.iso3 === currencyIso);
                    return {
                        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                        value: rateObj ? parseFloat(rateObj.sell) : null
                    };
                }).filter(d => d.value !== null).reverse();

                setChartData(trendData);
            }
        } catch (err) {
            console.error("Historical fetch error:", err);
            // Fallback to mock data if API fails
            setChartData(mockChartData);
        } finally {
            setChartLoading(false);
        }
    };

    const filteredRates = rates.filter(r =>
        r.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConvert = () => {
        if (!rates.length) return 0;
        const fromRate = rates.find(r => r.currency === convertFrom);
        const toRate = rates.find(r => r.currency === convertTo);

        let nprValue = 0;
        if (convertFrom === 'NPR') {
            nprValue = convertAmount;
        } else if (fromRate) {
            nprValue = (convertAmount * fromRate.sell) / fromRate.unit;
        }

        if (convertTo === 'NPR') {
            return nprValue.toFixed(2);
        } else if (toRate) {
            return ((nprValue * toRate.unit) / toRate.buy).toFixed(4);
        }
        return 0;
    };

    return (
        <div className="min-h-screen bg-[#020111] text-white pt-24 pb-12 flex flex-col items-center px-4 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full"></div>

            <div className="w-full max-w-6xl relative z-10">


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Top Row: Market Overview and Converter */}
                    <div className="lg:col-span-8 order-1">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[30px] p-4 md:p-8 shadow-2xl overflow-hidden h-full">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                                <h3 className="text-lg font-black tracking-tight uppercase">Market Overview</h3>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <input
                                            type="text"
                                            placeholder="Search currency..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-5 text-xs font-medium outline-none focus:border-blue-500/50 transition-all shadow-inner"
                                        />
                                    </div>
                                    <button
                                        onClick={fetchRates}
                                        className="p-2.5 bg-white/10 border border-white/5 hover:bg-white/20 rounded-xl transition-all text-blue-400 active:scale-95"
                                        title="Refresh Rates"
                                    >
                                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                            <div className="relative overflow-hidden">
                                <div className="overflow-y-auto custom-scrollbar pr-1" style={{ height: '430px' }}>
                                    <table className="w-full text-left border-separate border-spacing-y-1 table-auto md:table-fixed">
                                        <thead>
                                            <tr className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-gray-500">
                                                <th className="sticky top-0 z-30 bg-[#0c0c1d] pl-2 pr-1 md:px-6 py-3 text-left w-[40%] md:w-1/3 border-b border-white/5">Currency</th>
                                                <th className="sticky top-0 z-30 bg-[#0c0c1d] px-1 md:px-6 py-3 text-right hidden sm:table-cell md:w-[10%] border-b border-white/5">Unit</th>
                                                <th className="sticky top-0 z-30 bg-[#0c0c1d] px-1 md:px-6 py-3 text-right w-[20%] md:w-[15%] border-b border-white/5">Buy</th>
                                                <th className="sticky top-0 z-30 bg-[#0c0c1d] px-1 md:px-6 py-3 text-right w-[20%] md:w-[15%] border-b border-white/5">Sell</th>
                                                <th className="sticky top-0 z-30 bg-[#0c0c1d] px-1 md:px-6 py-3 text-center w-[20%] md:w-[15%] border-b border-white/5">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px] md:text-sm font-bold">
                                            {loading ? (
                                                Array.from({ length: 10 }).map((_, i) => (
                                                    <tr key={i} className="animate-pulse">
                                                        <td colSpan={5} className="p-1">
                                                            <div className="h-10 bg-white/5 rounded-2xl" />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : filteredRates.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-20 text-gray-500 italic">No currencies found matching your search...</td>
                                                </tr>
                                            ) : (
                                                filteredRates.map((rate) => (
                                                    <tr
                                                        key={rate.currency}
                                                        onClick={() => setSelectedCurrency(rate)}
                                                        className={`group transition-all cursor-pointer border-b border-white/[0.02] last:border-0 ${selectedCurrency?.currency === rate.currency ? 'bg-blue-600/20' : 'hover:bg-white/5'}`}
                                                    >
                                                        <td className="pl-2 pr-1 md:px-6 py-1.5 md:py-2.5 rounded-l-xl md:rounded-l-2xl">
                                                            <div className="flex items-center gap-1.5 md:gap-4 min-w-0">
                                                                <span className="text-base md:text-2xl shrink-0">{rate.flag}</span>
                                                                <div className="min-w-0">
                                                                    <div className="text-white group-hover:text-blue-400 transition-colors uppercase truncate text-[10px] md:text-sm">
                                                                        {rate.name}
                                                                        <span className="sm:hidden text-gray-500 font-normal ml-1">({rate.unit})</span>
                                                                    </div>
                                                                    <div className="text-[8px] md:text-[9px] text-gray-500 font-black tracking-widest">{rate.currency}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-1 md:px-6 py-1.5 md:py-2.5 text-right text-gray-400 hidden sm:table-cell font-mono">{rate.unit}</td>
                                                        <td className="px-1 md:px-6 py-1.5 md:py-2.5 text-right text-white font-mono">{rate.buy.toFixed(2)}</td>
                                                        <td className="px-1 md:px-6 py-1.5 md:py-2.5 text-right text-blue-400 font-mono">{rate.sell.toFixed(2)}</td>
                                                        <td className="px-1 md:px-6 py-1.5 md:py-2.5 rounded-r-xl md:rounded-r-2xl text-center">
                                                            <div className="flex justify-center">
                                                                {rate.trend === 'up' && (
                                                                    <TrendingUp size={14} className="text-green-500" />
                                                                )}
                                                                {rate.trend === 'down' && (
                                                                    <TrendingDown size={14} className="text-red-500" />
                                                                )}
                                                                {rate.trend === 'same' && (
                                                                    <div className="w-3 h-0.5 bg-gray-500 rounded-full" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 order-2">
                        {/* Quick Converter Card */}
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[30px] p-6 shadow-2xl h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                    <ArrowRightLeft className="text-purple-400" size={16} />
                                    Converter
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Amount</label>
                                        <input
                                            type="number"
                                            value={convertAmount}
                                            onChange={(e) => setConvertAmount(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-4 font-bold text-lg outline-none focus:border-purple-500/50 transition-all font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">From</label>
                                        <select
                                            value={convertFrom}
                                            onChange={(e) => setConvertFrom(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-3 font-bold text-sm outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="NPR" className="bg-[#1a1a2e]">🇳🇵 NPR - Rupee</option>
                                            {rates.map(r => (
                                                <option key={r.currency} value={r.currency} className="bg-[#1a1a2e]">
                                                    {r.flag} {r.currency} - {r.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-center -my-1">
                                        <button
                                            onClick={() => {
                                                const tempFrom = convertFrom;
                                                setConvertFrom(convertTo);
                                                setConvertTo(tempFrom);
                                            }}
                                            className="bg-purple-600/20 p-1.5 rounded-full hover:bg-purple-600/40 transition-all text-purple-400 border border-purple-500/30"
                                        >
                                            <ArrowRightLeft className="rotate-90" size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">To</label>
                                        <select
                                            value={convertTo}
                                            onChange={(e) => setConvertTo(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-3 font-bold text-sm outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="NPR" className="bg-[#1a1a2e]">🇳🇵 NPR - Rupee</option>
                                            {rates.map(r => (
                                                <option key={r.currency} value={r.currency} className="bg-[#1a1a2e]">
                                                    {r.flag} {r.currency} - {r.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Estimated Result</div>
                                <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
                                    {handleConvert()} <span className="text-xs text-gray-400 font-bold uppercase">{convertTo}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Cosmic Console v3.1 (Adaptive Intelligence) */}
                    <div className="lg:col-span-12 order-3">
                        <div className="relative group">
                            {/* Trend-Aware Atmospheric Background Glow */}
                            <div className={`absolute -inset-2 rounded-[50px] blur-3xl opacity-20 transition-all duration-1000 ${(chartData.length > 0 && chartData[chartData.length - 1]?.value > chartData[0]?.value)
                                ? 'bg-green-500' : 'bg-red-600'
                                }`} />

                            <div className="bg-[#0c0c1d]/60 backdrop-blur-3xl border border-white/10 rounded-[45px] p-1 md:p-1 overflow-hidden relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                                {/* Smart Floating Toolbar */}
                                <div className="bg-white/[0.03] backdrop-blur-xl border-b border-white/5 px-8 py-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className={`absolute -inset-4 rounded-full blur-2xl opacity-40 ${(chartData.length > 0 && chartData[chartData.length - 1]?.value > chartData[0]?.value) ? 'bg-green-500' : 'bg-red-500'
                                                }`} />
                                            <span className="text-6xl relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                                {rates.find(r => r.currency === chartCurrency)?.flag || "🏳️"}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-baseline gap-2">
                                                    {chartCurrency} <span className="text-white/20 text-xl font-medium tracking-normal lowercase">vs</span> NPR
                                                </h2>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border ${(chartData.length > 0 && chartData[chartData.length - 1]?.value > chartData[0]?.value)
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                                    }`}>
                                                    {(chartData.length > 0 && chartData[chartData.length - 1]?.value > chartData[0]?.value) ? '↑ BULLISH' : '↓ BEARISH'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 transition-colors group-hover:text-blue-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                Adaptive Console v3.1
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        {/* Minimalist Asset Switcher */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3 group/select hover:border-blue-500/30 transition-all">
                                            <Globe size={14} className="text-gray-500 group-hover/select:text-blue-400" />
                                            <select
                                                value={chartCurrency}
                                                onChange={(e) => setChartCurrency(e.target.value)}
                                                className="bg-transparent text-sm font-bold text-gray-300 outline-none cursor-pointer appearance-none pr-4"
                                            >
                                                {rates.map(r => (
                                                    <option key={r.currency} value={r.currency} className="bg-[#0c0c1d]">{r.currency} - {r.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* High-Tech View Switcher */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 flex items-center gap-2 shadow-inner">
                                            {[
                                                { id: 'pulse', label: 'Pulse', icon: Zap },
                                                { id: 'line', label: 'Line', icon: Activity },
                                                { id: 'bar', label: 'Volume', icon: Info }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setChartType(type.id);
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative z-20 ${chartType === type.id
                                                            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <type.icon size={12} />
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 md:p-12" key={`console-inner-${chartType}`}>
                                    {/* Intelligence Metric Grid - ADAPTIVE BY MODE */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                        {[
                                            chartType === 'pulse' ? {
                                                label: 'Session Peak',
                                                value: Math.max(...(chartData.length > 0 ? chartData : mockChartData).map(d => d.value)).toFixed(2),
                                                color: 'text-green-400',
                                                desc: 'High Altitude'
                                            } : chartType === 'line' ? {
                                                label: 'Line Momentum',
                                                value: (chartData.length > 0 ? (chartData[chartData.length - 1]?.value - chartData[0]?.value) : 0).toFixed(2),
                                                color: 'text-blue-400',
                                                desc: 'Trend Velocity'
                                            } : {
                                                label: 'Volume Weighted',
                                                value: (chartData.reduce((acc, curr) => acc + curr.value, 0) / (chartData.length || 1)).toFixed(2),
                                                color: 'text-yellow-400',
                                                desc: 'Mass Balance'
                                            },
                                            chartType === 'pulse' ? {
                                                label: 'Market Equilibrium',
                                                value: (chartData.length > 0 ? (chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length) : 0).toFixed(2),
                                                color: 'text-cyan-400',
                                                desc: 'Smooth Pivot'
                                            } : chartType === 'line' ? {
                                                label: 'Trend Stability',
                                                value: '94.2%',
                                                color: 'text-purple-400',
                                                desc: 'Market Persistence'
                                            } : {
                                                label: 'Peak Density',
                                                value: Math.max(...(chartData.length > 0 ? chartData : mockChartData).map(d => d.value)).toFixed(2),
                                                color: 'text-orange-400',
                                                desc: 'Max Saturation'
                                            },
                                            {
                                                label: 'Market Avg',
                                                value: (chartData.length > 0 ? (chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length) : (mockChartData.reduce((acc, curr) => acc + curr.value, 0) / mockChartData.length)).toFixed(2),
                                                color: 'text-blue-400',
                                                desc: 'Mean Pivot'
                                            },
                                            {
                                                label: 'Volatility',
                                                value: (chartData.length > 0 ? (((chartData[chartData.length - 1]?.value - chartData[0]?.value) / (chartData[0]?.value || 1)) * 100).toFixed(2) : '0.00') + '%',
                                                color: (chartData.length > 0 && chartData[chartData.length - 1]?.value > chartData[0]?.value) ? 'text-green-400' : 'text-red-400',
                                                desc: 'Market Delta'
                                            }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all group/stat relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">{stat.label}</div>
                                                <div className={`text-3xl font-black ${stat.color} tracking-tight mb-1`}>
                                                    <span className="text-xs mr-1 opacity-50">रू</span>{stat.value}
                                                </div>
                                                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest group-hover/stat:text-gray-400 transition-colors">{stat.desc}</div>
                                                <div className={`absolute bottom-0 right-0 w-16 h-16 blur-2xl opacity-10 transition-opacity group-hover/stat:opacity-20 ${stat.color.replace('text', 'bg')}`} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Immersive Immersion Area */}
                                    <div className="h-[500px] w-full relative overflow-visible" key={`chart-outer-${chartType}`}>
                                        {chartLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#020111]/40 backdrop-blur-3xl z-30 rounded-[40px]">
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="relative">
                                                        <RefreshCw className="text-blue-500 animate-spin" size={64} />
                                                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse" />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[12px] font-black uppercase tracking-[0.6em] text-blue-400 mb-1">Synthesizing Market</span>
                                                        <span className="text-[9px] font-bold text-blue-500/40 uppercase tracking-widest">Global Node Stream Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={500} key={`responsive-chart-${chartType}`}>
                                            {chartType === 'pulse' ? (
                                                <LineChart data={chartData.length > 0 ? chartData : mockChartData}>
                                                    <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.015)" vertical={false} />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} dy={20} />
                                                    <YAxis hide domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                                                    <Tooltip
                                                        content={({ active, payload, label }) => active && payload && payload.length && (
                                                            <div className="bg-[#0c0c1d]/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] shadow-2xl">
                                                                <div className="text-3xl font-black text-white leading-none">
                                                                    <span className="text-sm mr-1 opacity-40">रू</span>{payload[0].value.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke={(chartData.length > 0 && chartData[chartData.length - 1]?.value > chartData[0]?.value) ? '#10b981' : '#ef4444'}
                                                        strokeWidth={4}
                                                        dot={false}
                                                        activeDot={{ r: 8, fill: '#fff', stroke: (chartData.length > 0 && chartData[chartData.length - 1]?.value > chartData[0]?.value) ? '#10b981' : '#ef4444', strokeWidth: 4 }}
                                                        animationDuration={1000}
                                                    />
                                                </LineChart>
                                            ) : chartType === 'line' ? (
                                                <LineChart data={chartData.length > 0 ? chartData : mockChartData}>
                                                    <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.015)" vertical={false} />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} dy={20} />
                                                    <YAxis hide domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                                                    <Tooltip
                                                        content={({ active, payload, label }) => active && payload && payload.length && (
                                                            <div className="bg-[#0c0c1d]/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] shadow-2xl">
                                                                <div className="text-3xl font-black text-white leading-none">
                                                                    <span className="text-sm mr-1 opacity-40">रू</span>{payload[0].value.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#3b82f6"
                                                        strokeWidth={4}
                                                        dot={false}
                                                        activeDot={{ r: 8, fill: '#fff', stroke: '#3b82f6', strokeWidth: 4 }}
                                                        animationDuration={1000}
                                                    />
                                                </LineChart>
                                            ) : (
                                                <BarChart data={chartData.length > 0 ? chartData : mockChartData}>
                                                    <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.015)" vertical={false} />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} dy={20} />
                                                    <YAxis hide domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                                                    <Tooltip
                                                        content={({ active, payload, label }) => active && payload && payload.length && (
                                                            <div className="bg-[#0c0c1d]/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] shadow-2xl">
                                                                <div className="text-3xl font-black text-white leading-none">
                                                                    <span className="text-sm mr-1 opacity-40">रू</span>{payload[0].value.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        )}
                                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                    />
                                                    <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={40} animationDuration={1000}>
                                                        {(chartData.length > 0 ? chartData : mockChartData).map((entry, index, arr) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.value > (arr[index - 1]?.value || entry.value) ? '#10b981' : '#ef4444'}
                                                                fillOpacity={0.4}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            <Footer />

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.2);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.4);
        }
      `}</style>
        </div>
    );
}
