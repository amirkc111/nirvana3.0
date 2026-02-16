"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import Link from "next/link";

export default function NewsWidget() {
    const { currentTheme } = useTheme();
    const { t } = useLanguage();
    const [news, setNews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/news');
                const data = await res.json();
                if (data.success && data.news.length > 0) {
                    setNews(data.news);
                }
            } catch (error) {
                console.error("Failed to fetch news for widget", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    useEffect(() => {
        if (news.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 4) % news.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [news]);

    if (loading) {
        return (
            <div className={`w-full rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-2xl p-6 flex items-center justify-center`} style={{ minHeight: '260px' }}>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-150"></div>
                </div>
            </div>
        );
    }

    if (news.length === 0) return null;

    const currentItems = [];
    for (let i = 0; i < 4; i++) {
        currentItems.push(news[(currentIndex + i) % news.length]);
    }

    return (
        <div
            className={`w-full h-full rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-2xl px-4 py-3 relative overflow-hidden flex flex-col`}
            style={{ minHeight: '260px' }}
        >
            <div className="flex justify-between items-center mb-3 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                    {t('latestNews')}
                </span>
                <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse delay-75"></span>
                </div>
            </div>

            {/* Forced Height Grid */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full flex-grow h-full" style={{ minHeight: '200px' }}>
                {currentItems.map((item, idx) => (
                    <Link
                        key={`${currentIndex}-${idx}`}
                        href={item.link || '/news'}
                        className="relative rounded-lg overflow-hidden group block w-full h-full bg-white/5 border border-white/5"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] via-[#0a0118]/40 to-transparent z-10 opacity-90" />
                            <img
                                src={item.image || '/placeholder-news.jpg'}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=300&auto=format&fit=crop'; }}
                            />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 z-20 flex flex-col justify-end p-2.5">
                            <h3 className="text-[10px] sm:text-[11px] font-bold text-white leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors drop-shadow-md">
                                {item.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="flex justify-end pt-2 mt-auto">
                <Link href="/news" className="text-[9px] uppercase font-bold text-white/30 hover:text-white transition-colors">
                    {t('viewFullNews')} →
                </Link>
            </div>
        </div>
    );
}
