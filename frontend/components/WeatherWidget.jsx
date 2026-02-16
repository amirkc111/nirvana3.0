"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeather } from '../contexts/WeatherContext';
import { localizeDigits } from '../utils/localization';
import Link from 'next/link';

const weatherIcons = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌦️",
    61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "❄️", 73: "❄️", 75: "❄️", 80: "🌦️", 81: "🌦️",
    82: "🌦️", 95: "⛈️", 96: "⛈️", 99: "⛈️"
};

function getWeatherIcon(code) {
    return weatherIcons[code] || "❓";
}


export default function WeatherWidget() {
    const { currentTheme } = useTheme();
    const { t, language } = useLanguage();
    const { weather, loading } = useWeather();


    if (loading) {
        return (
            <div className={`h-full min-h-[120px] rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-2xl p-4 flex items-center justify-center`}>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div className={`h-full min-h-[120px] rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-2xl px-5 py-4 relative overflow-hidden flex flex-col justify-between group`}>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-0.5">
                        {t('todaysWeather')}
                    </span>
                    <div className={`text-lg font-bold ${currentTheme.colors.text} leading-none`}>
                        {weather.city}
                    </div>
                </div>
                <div className="text-3xl animate-pulse">
                    {getWeatherIcon(weather.condition)}
                </div>
            </div>

            {/* Main Temp & Details */}
            <div className="flex items-end justify-between mt-2">
                <div className="flex flex-col">
                    <span className={`text-4xl font-extrabold ${currentTheme.colors.text} tracking-tighter`}>
                        {localizeDigits(weather.temp, language)}°
                    </span>
                    <span className="text-[10px] text-white/40 font-medium ml-0.5">
                        H: {localizeDigits(Math.round(weather.max), language)}° L: {localizeDigits(Math.round(weather.min), language)}°
                    </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] font-bold text-blue-200">
                            {t('wind')} {localizeDigits(weather.wind, language)} km/h
                        </span>
                    </div>
                    <Link href="/weather" className="text-[9px] uppercase font-bold text-white/30 hover:text-white transition-colors">
                        {t('viewFullForecast')} →
                    </Link>
                </div>
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>

        </div>
    );
}
