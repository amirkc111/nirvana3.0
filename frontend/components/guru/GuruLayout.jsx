"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    FiHome,
    FiMessageSquare,
    FiCalendar,
    FiSettings,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiBell,
    FiSearch,
    FiUser,
    FiMenu,
    FiX
} from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';

const GuruLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [guruData, setGuruData] = useState(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const isLoginPage = pathname === '/guru/login';

    useEffect(() => {
        if (isLoginPage) return; // Skip auth check on login page

        const fetchGuruProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in, redirect to login
                window.location.href = '/guru/login';
                return;
            }

            const { data: guru } = await supabase
                .from('gurus')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (guru) {
                setGuruData(guru);
            }
            setLoading(false);
        };

        fetchGuruProfile();
    }, [isLoginPage]);

    const navItems = [
        { name: 'Home', icon: FiHome, path: '/guru' },
        { name: 'Chats', icon: FiMessageSquare, path: '/guru/chats' },
        { name: 'Schedule', icon: FiCalendar, path: '/guru/schedules' },
        { name: 'Profile', icon: FiUser, path: '/guru/settings' },
    ];

    if (isLoginPage) return <>{children}</>;

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-screen w-full bg-gray-50 text-gray-900 flex flex-col md:flex-row font-sans overflow-hidden">

            {/* Desktop Sidebar (Hidden on mobile) */}
            <aside
                className={`hidden md:flex flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-col ${isSidebarCollapsed ? 'w-20' : 'w-72'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-gray-100">
                    <div className="w-10 h-10 relative flex-shrink-0">
                        <Image src="/an.png" alt="Nirvana" fill className="object-contain" />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="ml-4">
                            <span className="block font-bold text-lg tracking-tight text-gray-900 leading-none">Nirvana CMS</span>
                            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Guru Portal</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={`flex items-center h-12 px-4 rounded-xl transition-all group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/10'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`text-xl flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    {!isSidebarCollapsed && (
                                        <span className="ml-4 text-sm font-semibold whitespace-nowrap">{item.name}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-gray-100 space-y-3">
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="flex items-center justify-center w-full h-12 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                    >
                        {isSidebarCollapsed ? <FiChevronRight size={20} /> : (
                            <div className="flex items-center gap-2">
                                <FiChevronLeft size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Collapse</span>
                            </div>
                        )}
                    </button>
                    <button
                        className="flex items-center h-12 px-4 w-full rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-sm"
                        onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                    >
                        <FiLogOut className="text-xl flex-shrink-0" />
                        {!isSidebarCollapsed && <span className="ml-4 whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (Hidden on desktop) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-[84px] bg-white/95 backdrop-blur-3xl border-t border-gray-100 z-[100] pb-safe">
                <nav className="flex items-center h-[64px] px-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 relative ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute -top-1 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                                )}
                                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                                <span className={`text-[10px] font-semibold tracking-widest uppercase text-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white relative">

                {/* Header (Persistent) */}
                <header className="h-20 shrink-0 border-b border-gray-100 bg-white/90 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
                    <div className="flex items-center gap-6">
                        <div className="md:hidden w-10 h-10 relative flex-shrink-0 drop-shadow-sm">
                            <Image src="/an.png" alt="Nirvana" fill className="object-contain" />
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                Status: <span className="text-green-500 flex items-center gap-1.5 pl-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span> LIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-extrabold text-gray-900 leading-none tracking-tight">{guruData?.name || 'Authorized Guru'}</p>
                                <div className="mt-2">
                                    <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-md uppercase tracking-widest border border-blue-100/50 antialiased">
                                        VERIFIED PORTAL
                                    </span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-1.5xl bg-white border border-gray-100 p-0.5 shadow-sm overflow-hidden flex-shrink-0 group cursor-pointer hover:border-blue-200 transition-all">
                                <div className="w-full h-full rounded-xl overflow-hidden relative">
                                    <img
                                        src={guruData?.image_url || `https://ui-avatars.com/api/?name=${guruData?.name || 'Guru'}&background=2563eb&color=ffffff&bold=true`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Viewport Content */}
                <div className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-gray-50/30 scroll-smooth">
                    <div className="max-w-[1200px] mx-auto p-4 md:p-8">
                        {!guruData && !loading && (
                            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8 flex items-start gap-4 shadow-sm">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                    <FiSettings className="text-amber-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-amber-900 mb-1 uppercase tracking-tight">Configuration Pending</p>
                                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                        Your account is not yet linked to a guru profile. Please contact system administration to complete your setup.
                                    </p>
                                </div>
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuruLayout;
