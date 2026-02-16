"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FiX, FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const AnnouncementBanner = () => {
    const pathname = usePathname();
    const [ad, setAd] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchAd = async () => {
            try {
                // Fetch from new dedicated Ads API
                const res = await fetch('/api/public/ads');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.id) {
                        // Check if previously dismissed (using updated_at to reset if ad changes)
                        const dismissalKey = `minimized_ad_${data.id}_${data.updated_at}`;
                        if (typeof window !== 'undefined' && localStorage.getItem(dismissalKey)) {
                            return;
                        }
                        setAd(data);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error("Failed to load ad banner", error);
            }
        };

        fetchAd();
    }, []);

    // Don't show ads on admin pages
    if (pathname?.startsWith('/admin')) return null;

    // Dismiss ad and persist preference
    const handleDismiss = (e) => {
        e?.stopPropagation();
        setIsVisible(false);
        if (ad?.id) {
            // Include updated_at so if the ad is edited, it reappears
            localStorage.setItem(`minimized_ad_${ad.id}_${ad.updated_at}`, 'true');
        }
    };

    // Helper to extract YouTube ID
    const getYouTubeId = (url) => {
        if (!url) return null;
        // Updated regex to handle m.youtube.com, www.youtube.com, etc.
        const match = url.match(/(?:(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
        return match ? match[1] : null;
    };

    // Track clicks without blocking navigation
    const handleAdClick = () => {
        if (!ad?.id) return;
        // Used 'metrics' endpoint and keepalive to avoid ad-blockers/browser cancellation
        fetch(`/api/public/metrics/click?id=${ad.id}`, {
            method: 'POST',
            keepalive: true
        }).catch(err => console.error("Click track error", err));
    };

    if (!isVisible || !ad) return null;

    // Unified Modal Layout - Centered, No Backdrop, Overlay Content
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
            {/* 
                No Backdrop as requested. 
                pointer-events-none on wrapper allows clicking through the empty space around the ad.
            */}

            {/* Content Container - pointer-events-auto enables interaction within the ad */}
            {/* Reduced max-width to max-w-md for a compact popup card */}
            <div className="relative z-10 w-full max-w-md pointer-events-auto animate-in zoom-in-95 duration-300">

                {/* --- VIDEO AD (Rendered as Clickable Thumbnail) --- */}
                {ad.type === 'video' && (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black group p-0">
                        {/* Close Button - Inside Top Right */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 z-30 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 p-1.5 rounded-full backdrop-blur-md transition-all"
                        >
                            <FiX size={18} />
                        </button>

                        <a
                            href={ad.link || ad.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleAdClick}
                            className="block w-full h-full relative group cursor-pointer"
                        >
                            {/* Thumbnail Image - No Play Button, clean look */}
                            <img
                                src={`https://img.youtube.com/vi/${getYouTubeId(ad.media_url)}/hqdefault.jpg`}
                                alt={ad.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                                onError={(e) => {
                                    // Fallback
                                    e.target.src = `https://img.youtube.com/vi/${getYouTubeId(ad.media_url)}/mqdefault.jpg`;
                                }}
                            />

                            {/* Text Overlay - Inside Bottom */}
                            {(ad.title || ad.message || ad.link) && (
                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-start gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="text-white text-left max-w-xl">
                                        {ad.title && <h3 className="font-bold text-lg leading-tight mb-1">{ad.title}</h3>}
                                        {ad.message && <p className="text-xs text-gray-200 line-clamp-2">{ad.message}</p>}
                                    </div>
                                    {ad.link && (
                                        <div className="mt-2 shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-2">
                                            {ad.link_label || t('watchNow')} <FiExternalLink size={12} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </a>
                    </div>
                )}

                {/* --- IMAGE AD --- */}
                {ad.type === 'image' && (
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl group max-h-[85vh]">
                        {/* Close Button - Inside Top Right */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 z-20 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all"
                        >
                            <FiX size={20} />
                        </button>

                        <a
                            href={ad.link || '#'}
                            onClick={handleAdClick}
                            className={`block relative w-full h-full ${!ad.link && 'cursor-default'}`}
                        >
                            <img
                                src={ad.media_url}
                                alt={ad.title}
                                className="w-full h-auto max-h-[85vh] object-contain bg-black/50"
                            />

                            {/* Text Overlay - Inside Bottom */}
                            {(ad.message || ad.link) && (
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none">
                                    <div className="text-white text-left pointer-events-auto">
                                        {ad.message && <p className="text-lg font-medium text-white mb-1 drop-shadow-md">{ad.message}</p>}
                                    </div>
                                    {ad.link && (
                                        <div className="shrink-0 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm pointer-events-auto">
                                            {ad.link_label || t('learnMore')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </a>
                    </div>
                )}

                {/* --- TEXT AD --- */}
                {ad.type === 'text' && (
                    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center max-w-lg mx-auto border border-white/10 ring-1 ring-white/20 overflow-hidden">
                        {/* Decorative Background Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-70"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 text-white/50 hover:text-white p-2 rounded-full transition-colors hover:bg-white/10"
                        >
                            <FiX size={18} />
                        </button>

                        <div className="relative z-10">
                            {/* Title with Gold Gradient */}
                            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-3 drop-shadow-sm font-serif">
                                {ad.title}
                            </h3>

                            {/* Message content */}
                            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-4"></div>
                            <p className="text-gray-200 mb-8 text-base md:text-lg leading-relaxed font-light">
                                {ad.message}
                            </p>

                            {ad.link && (
                                <a
                                    href={ad.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleAdClick}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-full font-bold hover:from-amber-400 hover:to-orange-500 transition-all transform hover:scale-105 shadow-lg shadow-orange-500/20 text-sm tracking-wide uppercase"
                                >
                                    {ad.link_label || t('learnMore')} <FiExternalLink />
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return null;
};

export default AnnouncementBanner;
