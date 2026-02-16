"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";

const zodiacSigns = [
    { name: 'मेष', en: 'Aries', file: 'aries.png', icon: '♈' },
    { name: 'वृष', en: 'Taurus', file: 'taurus.png', icon: '♉' },
    { name: 'मिथुन', en: 'Gemini', file: 'gemini.png', icon: '♊' },
    { name: 'कर्क', en: 'Cancer', file: 'cancer.png', icon: '♋' },
    { name: 'सिंह', en: 'Leo', file: 'leo.png', icon: '♌' },
    { name: 'कन्या', en: 'Virgo', file: 'virgo.png', icon: '♍' },
    { name: 'तुला', en: 'Libra', file: 'libra.png', icon: '♎' },
    { name: 'वृश्चिक', en: 'Scorpio', file: 'scorpio.png', icon: '♏' },
    { name: 'धनु', en: 'Sagittarius', file: 'sagittarius.png', icon: '♐' },
    { name: 'मकर', en: 'Capricorn', file: 'capricorn.png', icon: '♑' },
    { name: 'कुम्भ', en: 'Aquarius', file: 'aquarius.png', icon: '♒' },
    { name: 'मीन', en: 'Pisces', file: 'pisces.png', icon: '♓' }
];

export default function Profile() {
    const { t } = useLanguage();
    const { currentTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPreferences, setUserPreferences] = useState(null);
    const [selectedZodiac, setSelectedZodiac] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUser(user);
                    // Fetch preferences
                    const { data, error } = await supabase
                        .from('user_preferences')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                    if (data) {
                        setUserPreferences(data);
                        setSelectedZodiac(data.zodiac_sign || 0);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className={`min-h-screen ${currentTheme.colors.background} flex items-center justify-center`}>
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`min-h-screen ${currentTheme.colors.background} flex flex-col items-center justify-center p-4`}>
                <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h1>
                <Link href="/" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Go to Home
                </Link>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${currentTheme.colors.background} pt-24 pb-12 px-4`}>
            <div className="max-w-4xl mx-auto">
                {/* Profile Card */}
                <div className={`${currentTheme.colors.surface} backdrop-blur-xl rounded-3xl border ${currentTheme.colors.border} p-8 shadow-2xl`}>
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-2xl group-hover:border-purple-500/60 transition-all duration-300">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold text-white">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {user.user_metadata?.full_name || user.user_metadata?.name || "Nirvana User"}
                            </h1>
                            <p className="text-white/60 text-lg mb-4">{user.email}</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/10 uppercase tracking-widest">
                                    Member since {new Date(user.created_at).getFullYear()}
                                </span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30 uppercase tracking-widest">
                                    Verified
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/kundli-dashboard"
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            My Saved Kundalis
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Preferences Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                My Preferences
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <p className="text-xs text-white/40 uppercase mb-2">My Zodiac Sign</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                            <Image
                                                src={`/zodiac/${zodiacSigns[selectedZodiac].file}`}
                                                alt={zodiacSigns[selectedZodiac].en}
                                                width={24} height={24}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{zodiacSigns[selectedZodiac].name}</p>
                                            <p className="text-white/40 text-xs">{zodiacSigns[selectedZodiac].en}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-xs text-white/40 uppercase mb-2">Preferred Theme</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{currentTheme.flag}</span>
                                        <p className="text-white font-medium">{currentTheme.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links / Status Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Account Health
                            </h2>

                            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-white/80 text-sm">Security Status</span>
                                    <span className="text-green-400 text-sm font-bold flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        Secure
                                    </span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 mb-6">
                                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full w-[100%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                </div>
                                <p className="text-white/40 text-xs">Your account is fully synchronized with Google and protected by Supabase Auth.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
