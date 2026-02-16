"use client";

import React, { useState, useEffect } from 'react';
import {
    FiBell, FiCheckCircle, FiInfo, FiAlertCircle,
    FiTrash2, FiMail, FiCalendar, FiClock
} from 'react-icons/fi';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all'); // all, unread, read
    const [categoryFilter, setCategoryFilter] = useState('all'); // all, calls, services, other

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getCategory = (n) => {
        const title = (n.title || '').toLowerCase();
        if (title.includes('call')) return 'calls';
        if (title.includes('service') || title.includes('interest')) return 'services';
        return 'other';
    };

    const filteredNotifications = notifications.filter(n => {
        // Status Filter
        if (statusFilter === 'unread' && n.is_read) return false;
        if (statusFilter === 'read' && !n.is_read) return false;

        // Category Filter
        if (categoryFilter !== 'all' && getCategory(n) !== categoryFilter) return false;

        return true;
    });

    const counts = {
        all: notifications.length,
        calls: notifications.filter(n => getCategory(n) === 'calls').length,
        services: notifications.filter(n => getCategory(n) === 'services').length,
        other: notifications.filter(n => getCategory(n) === 'other').length,
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const categories = [
        { id: 'all', label: 'All Activity', icon: FiBell, color: 'text-gray-600', bg: 'bg-gray-100' },
        { id: 'calls', label: 'Call Requests', icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'services', label: 'Service Interests', icon: FiCheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'other', label: 'General Alerts', icon: FiInfo, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Notifications</h1>
                    <p className="text-sm text-gray-500 font-medium">Categorized view of system activity</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar: Categories */}
                <div className="lg:w-64 flex-shrink-0 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-3">Categories</p>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${categoryFilter === cat.id
                                ? 'bg-white shadow-sm ring-1 ring-gray-200 text-gray-900'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <div className={`p-1.5 rounded-lg ${categoryFilter === cat.id ? cat.bg + ' ' + cat.color : 'bg-transparent'}`}>
                                    <cat.icon size={16} />
                                </div>
                                {cat.label}
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${categoryFilter === cat.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {counts[cat.id]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Right Content */}
                <div className="flex-1 space-y-4">
                    {/* Horizontal Filter Bar */}
                    <div className="flex items-center justify-between pb-2">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {['all', 'unread', 'read'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${statusFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        {filteredNotifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredNotifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors ${!n.is_read ? 'bg-blue-50/20' : ''}`}
                                    >
                                        <div className={`p-3 rounded-xl shrink-0 ${getCategory(n) === 'calls' ? 'bg-blue-50 text-blue-600' :
                                            getCategory(n) === 'services' ? 'bg-purple-50 text-purple-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                            <FiBell size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`text-sm tracking-tight ${!n.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                    {n.title}
                                                </h3>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                                                {n.body}
                                            </p>
                                            <div className="flex items-center gap-4 mt-4">
                                                {!n.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <FiCheckCircle size={14} />
                                                        Mark as Read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="text-[11px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
                                                >
                                                    <FiTrash2 size={14} />
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <FiBell size={32} />
                                </div>
                                <div>
                                    <p className="text-gray-900 font-bold">No results found</p>
                                    <p className="text-sm text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} {categoryFilter !== 'all' ? categoryFilter : ''} notifications.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
