"use client";

import React, { useState, useEffect } from 'react';
import {
    FiCalendar, FiClock, FiUser, FiMoreHorizontal,
    FiCheckCircle, FiXCircle, FiSearch, FiVideo, FiPlus
} from 'react-icons/fi';

export default function SchedulesPage() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ pending: 0, today: 0, completed: 0 });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('/api/admin/schedules');
            if (res.ok) {
                const data = await res.json();
                const apps = data.appointments || [];
                setAppointments(apps);

                // Calculate stats
                const today = new Date().toDateString();
                const newStats = {
                    pending: apps.filter(a => a.status === 'pending').length,
                    today: apps.filter(a => new Date(a.appointment_date).toDateString() === today).length,
                    completed: apps.filter(a => a.status === 'completed').length
                };
                setStats(newStats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        // Optimistic update
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        try {
            await fetch('/api/admin/schedules', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            fetchAppointments(); // Refresh to be safe
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const filteredApps = appointments.filter(app =>
        app.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.email && app.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Consultation Schedules</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage readings and appointments</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors shadow-sm">
                    <FiPlus /> New Appointment
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Pending Requests"
                    value={stats.pending}
                    icon={FiClock}
                    color="amber"
                />
                <StatsCard
                    label="Today's Sessions"
                    value={stats.today}
                    icon={FiVideo}
                    color="blue"
                />
                <StatsCard
                    label="Completed (Month)"
                    value={stats.completed}
                    icon={FiCheckCircle}
                    color="green"
                />
            </div>

            {/* Main Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-lg">Upcoming Sessions</h3>
                    <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search client..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApps.length > 0 ? (
                                    filteredApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{app.client_name}</span>
                                                    <span className="text-xs text-gray-400">{app.email || 'No email'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {new Date(app.appointment_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FiClock size={10} />
                                                        {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-600 capitalize">
                                                    {app.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {app.status !== 'completed' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'completed')}
                                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Mark Completed"
                                                        >
                                                            <FiCheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {app.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <FiXCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No appointments found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatsCard = ({ label, value, icon: Icon, color }) => {
    const colorClasses = {
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600'
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                <span className="text-3xl font-black text-gray-900">{value}</span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-2">{label}</p>
        </div>
    );
};
