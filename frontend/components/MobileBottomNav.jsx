"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { HiHome, HiDocumentText, HiMoon, HiCalendar, HiChatAlt2, HiSparkles, HiCollection, HiStar, HiNewspaper, HiCloud, HiClock, HiRefresh, HiCurrencyDollar } from 'react-icons/hi';
import { useLanguage } from '../contexts/LanguageContext';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const navItems = [
        { label: t('home'), icon: HiHome, href: '/' },
        { label: t('kundli'), icon: HiDocumentText, href: '/kundli' },
        { label: t('horoscope'), icon: HiMoon, href: '/horoscope' },
        { label: t('calendar'), icon: HiCalendar, href: '/calendar' },
        { label: t('guru'), icon: HiChatAlt2, href: '/chat' },
    ];

    const moreFeatures = [
        { label: t('news'), icon: HiNewspaper, href: '/news' },
        { label: t('panchang'), icon: HiCollection, href: '/panchang' },
        { label: t('weather'), icon: HiCloud, href: '/weather' },
        { label: t('astroClock'), icon: HiClock, href: '/astro-clock' },
        { label: t('converter'), icon: HiRefresh, href: '/converter' },
        { label: t('exchange'), icon: HiCurrencyDollar, href: '/exchange' },
    ];

    // Hide on admin/guru pages and active chat sessions
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/guru') || pathname?.startsWith('/chat/')) return null;

    return (
        <div
            className={`md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-black/95 backdrop-blur-3xl border-t border-white/10 transition-all duration-500 ease-in-out pb-safe overflow-hidden ${isExpanded ? 'h-[190px]' : 'h-[72px]'
                }`}
        >
            {/* Minimal Pull Handle */}
            <div
                className="w-full h-5 flex items-center justify-center cursor-pointer group/handle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`w-12 h-1 bg-white/10 rounded-full transition-all duration-500 ${isExpanded ? 'bg-purple-500/40' : 'group-hover/handle:bg-white/30'}`} />
            </div>

            <div className="w-full flex flex-col px-1">
                {/* PRIMARY ROW */}
                <ul className="flex items-center justify-around h-[52px]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href} className="flex-1">
                                <Link
                                    href={item.href}
                                    onClick={() => setIsExpanded(false)}
                                    className={`flex flex-col items-center justify-center transition-all duration-300 relative ${isActive ? 'text-purple-400' : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <span className="absolute -top-1 w-1 h-1 bg-purple-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                    )}
                                    <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                                    <span className="text-[9px] font-bold tracking-widest uppercase">
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* SECONDARY ROW (Horizontal Row like Primary) */}
                <div className={`w-full transition-all duration-500 overflow-hidden pt-2 pb-4 ${isExpanded ? 'opacity-100 h-[100px] border-t border-white/5' : 'opacity-0 h-0 pointer-events-none'}`}>
                    <ul className="flex items-center justify-around h-full">
                        {moreFeatures.map((item) => (
                            <li key={item.href} className="flex-1">
                                <Link
                                    href={item.href}
                                    onClick={() => setIsExpanded(false)}
                                    className="flex flex-col items-center justify-center transition-all duration-300 text-white/50 hover:text-white"
                                >
                                    <item.icon className="w-5 h-5 mb-1 text-purple-400/70" />
                                    <span className="text-[8px] font-black uppercase tracking-tight text-center px-1">
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
