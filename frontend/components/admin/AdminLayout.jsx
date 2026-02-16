"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    FiHome,
    FiUsers,
    FiCalendar,
    FiSettings,
    FiPieChart,
    FiLogOut,
    FiMenu,
    FiChevronLeft,
    FiChevronRight,
    FiBell,
    FiSearch,
    FiStar,
    FiTarget
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const pathname = usePathname();

    // Hide layout for login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const [notifications, setNotifications] = useState([]);
    // pathname is already declared above

    // Fetch notifications on mount
    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/admin/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        if (pathname !== '/admin/login') {
            fetchNotifications();
            // Poll every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [pathname]);

    const markAsRead = async (id) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const navItems = [
        { name: 'Dashboard', icon: FiHome, path: '/admin' },
        { name: 'Clients', icon: FiUsers, path: '/admin/users' },
        { name: 'Subscribers', icon: FiPieChart, path: '/admin/subscriptions' },
        { name: 'Schedules', icon: FiCalendar, path: '/admin/schedules' },
        { name: 'Gurus', icon: FiUsers, path: '/admin/gurus' },
        { name: 'Horoscopes', icon: FiStar, path: '/admin/horoscopes' },
        { name: 'Ads & Banners', icon: FiTarget, path: '/admin/ads' },
        { name: 'Notifications', icon: FiBell, path: '/admin/notifications' },
        { name: 'Settings', icon: FiSettings, path: '/admin/settings' },
    ];

    return (
        <div className="fixed inset-0 h-screen w-screen bg-gray-50 text-gray-900 flex overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={`flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${isSidebarCollapsed ? 'w-16' : 'w-64'
                    }`}
            >
                {/* Brand Logo */}
                <div className="h-16 flex items-center px-4 border-b border-gray-100">
                    <div className="w-8 h-8 relative flex-shrink-0">
                        <Image
                            src="/an.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    {!isSidebarCollapsed && (
                        <span className="ml-3 font-semibold text-lg tracking-tight text-gray-800">Nirvana CMS</span>
                    )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="px-2 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    title={isSidebarCollapsed ? item.name : ''}
                                    className={`flex items-center h-10 px-3 rounded-md transition-colors group ${isActive
                                        ? 'bg-gray-100 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`text-lg flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    {!isSidebarCollapsed && (
                                        <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.name}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="flex items-center justify-center w-full h-10 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                    >
                        {isSidebarCollapsed ? <FiChevronRight size={18} /> : (
                            <div className="flex items-center gap-2">
                                <FiChevronLeft size={18} />
                                <span className="text-sm font-medium">Collapse</span>
                            </div>
                        )}
                    </button>
                    <button
                        className="mt-2 flex items-center h-10 px-3 w-full rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <FiLogOut className="text-lg flex-shrink-0" />
                        {!isSidebarCollapsed && (
                            <span className="ml-3 text-sm font-medium">Sign Out</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Top Header */}
                <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-72 group focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                            <FiSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-2 rounded-lg transition-colors ${isNotificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <FiBell size={20} />
                                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsNotificationsOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
                                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                            <h4 className="font-bold text-sm text-gray-900">Notifications</h4>
                                            {unreadCount > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ring-1 ring-blue-100">{unreadCount} New</span>}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => markAsRead(n.id)}
                                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <p className={`text-xs ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{n.title}</p>
                                                            {!n.is_read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></span>}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(n.created_at).toLocaleString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100">
                                            <Link
                                                href="/admin/notifications"
                                                onClick={() => setIsNotificationsOpen(false)}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 w-full text-center block"
                                            >
                                                View All Notifications
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-200"></div>

                        <div className="flex items-center gap-3">
                            {!isSidebarCollapsed && (
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold text-gray-800 leading-none">Admin User</p>
                                    <p className="text-xs text-gray-500 mt-1">Administrator</p>
                                </div>
                            )}
                            <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                                <img
                                    src="https://ui-avatars.com/api/?name=Admin+User&background=f3f4f6&color=4b5563"
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Viewport Content */}
                <div className="flex-1 overflow-auto bg-gray-50/30">
                    <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
