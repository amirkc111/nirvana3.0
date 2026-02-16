"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiFilter, FiPhoneIncoming, FiActivity, FiMapPin } from 'react-icons/fi';

export default function GuruSchedules() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchAppointments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const res = await fetch(`/api/guru/appointments?userId=${user.id}`);
            const result = await res.json();
            setAppointments(result.appointments || []);
        } catch (error) {
            console.error('Failed to fetch guru appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch('/api/guru/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(a => {
        if (filter === 'all') return true;
        return a.status === filter;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-[500px]">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-24">
            {/* Header Area */}
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Service Calendar</h1>
                    <p className="text-[11px] text-blue-600 font-extrabold uppercase tracking-[0.2em] mt-2 pl-0.5">Scheduled consultations & service sessions</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/50 w-fit">
                    {['all', 'pending', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-2.5 text-[11px] font-extrabold rounded-xl transition-all uppercase tracking-widest min-w-[120px] ${filter === f
                                ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {filteredAppointments.length > 0 ? filteredAppointments.map((appt) => (
                    <div key={appt.id} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_15px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.06)] transition-all duration-500 group">

                        {/* Card Header: Client & Type */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-extrabold text-2xl border border-gray-100 shadow-sm uppercase group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500">
                                    {appt.client_name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xl font-extrabold text-gray-900 truncate tracking-tight">{appt.client_name}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/50 uppercase tracking-widest antialiased">
                                            {appt.type?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[10px] font-extrabold px-4 py-2 rounded-xl uppercase tracking-widest h-fit border antialiased ${appt.status === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                appt.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                    'bg-gray-50 text-gray-400 border-gray-100'
                                }`}>
                                {appt.status}
                            </span>
                        </div>

                        {/* Timing Section */}
                        <div className="grid grid-cols-2 gap-6 bg-gray-50/30 rounded-2xl p-6 mb-8 border border-gray-100/50">
                            <div className="space-y-2">
                                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Date</p>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                    <FiCalendar size={16} className="text-blue-600" />
                                    {new Date(appt.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Session Time</p>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                    <FiClock size={16} className="text-blue-600" />
                                    {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        {appt.status === 'pending' && (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => updateStatus(appt.id, 'completed')}
                                    className="flex-1 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 rounded-2xl font-extrabold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all group/btn"
                                >
                                    <FiCheckCircle size={18} className="group-hover/btn:rotate-12 transition-transform duration-300" /> Confirm Completion
                                </button>
                                <button
                                    onClick={() => updateStatus(appt.id, 'cancelled')}
                                    className="w-14 h-14 bg-white border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95 transition-all shadow-sm"
                                    title="Cancel"
                                >
                                    <FiXCircle size={22} />
                                </button>
                            </div>
                        )}
                    </div>
                ))
                    : (
                        <div className="py-32 px-10 text-center bg-gray-50/50 border-2 border-dashed border-gray-200/60 rounded-[3rem] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/40 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="w-20 h-10 bg-white rounded-2xl flex items-center justify-center mx-auto text-gray-200 mb-8 border border-gray-100 shadow-sm">
                                    <FiCalendar size={32} className="opacity-40" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Empty Calendar</h3>
                                <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mt-4 max-w-sm mx-auto leading-relaxed opacity-60">
                                    Your operational schedule is currently clear of items.
                                </p>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}
