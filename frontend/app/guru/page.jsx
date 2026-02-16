"use client";

import React, { useState, useEffect } from 'react';
import {
    FiClock,
    FiMessageSquare,
    FiTarget,
    FiTrendingUp,
    FiCalendar,
    FiArrowRight,
    FiZap
} from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';

export default function GuruDashboard() {
    const [data, setData] = useState({
        stats: [],
        recentRequests: [],
        loading: true
    });

    const fetchStats = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const res = await fetch(`/api/guru/stats?userId=${user.id}`);
            const result = await res.json();

            const iconMap = {
                FiClock: FiClock,
                FiMessageSquare: FiMessageSquare,
                FiTarget: FiTarget,
                FiTrendingUp: FiTrendingUp
            };

            const enrichedStats = (result.stats || []).map(s => ({
                ...s,
                icon: iconMap[s.icon] || FiTarget
            }));

            setData({
                stats: enrichedStats,
                recentRequests: result.recentRequests || [],
                loading: false
            });
        } catch (error) {
            console.error('Failed to fetch guru stats:', error);
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (data.loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-10 pb-24">
            {/* Header Area */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Overview</h1>
                    <p className="text-[11px] font-bold text-blue-600/80 uppercase tracking-widest mt-1.5 pl-0.5">Guru Operations Dashboard</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 border border-gray-100 shadow-[0_8px_20px_rgba(0,0,0,0.04)] group cursor-pointer hover:border-blue-200 transition-all">
                    <FiZap size={22} className="group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {data.stats.length > 0 ? data.stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-7 rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                <Icon size={20} />
                            </div>
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.name}</h4>
                            <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                                <span className="text-[10px] text-green-500 font-bold">+12%</span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-16 text-center bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <FiTarget className="text-gray-200" size={32} />
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">Awaiting operational metrics...</p>
                    </div>
                )}
            </div>

            {/* Performance Card */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.04)] group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/40 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-blue-100/40 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50/30 rounded-full -ml-40 -mb-40 blur-3xl group-hover:bg-indigo-100/30 transition-colors duration-1000 delay-100"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="px-3 py-1.5 bg-green-50 text-green-600 text-[10px] font-extrabold rounded-lg border border-green-100 tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                                OPTIMIZED GROWTH
                            </span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] opacity-40">System Insight</span>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Channel Visibility Analytics</h3>
                        <p className="text-gray-500 text-[16px] mt-5 leading-relaxed font-medium max-w-lg">
                            Your global reach has expanded by <span className="text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded-lg">24.5%</span> this cycle. Faster response times in the Hub are correlating with higher retention rates.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-8 shrink-0 md:bg-gray-50/30 md:p-10 rounded-[2.5rem] md:border md:border-white shadow-inner">
                        <div className="text-center">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Efficiency Score</p>
                            <p className="text-5xl font-extrabold text-gray-900 tracking-tighter">98.2%</p>
                        </div>
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] ring-8 ring-blue-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                            <FiTrendingUp size={36} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Leads */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Interactions</h3>
                    <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2 group transition-all">
                        Complete History <FiArrowRight className="group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-gray-50">
                    {data.recentRequests.length > 0 ? (
                        data.recentRequests.map((req, idx) => (
                            <div key={idx} className="p-5 md:p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-extrabold text-lg border border-gray-100 shadow-sm uppercase group-hover:scale-110 transition-transform">
                                        {req.client_name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[15px] font-bold text-gray-900 truncate tracking-tight">{req.client_name}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-100">
                                                {req.type?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-900">{new Date(req.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                    <p className="text-[9px] font-semibold text-gray-400 mt-0.5">{new Date(req.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto text-gray-200 mb-4 border border-gray-100 shadow-sm">
                                <FiCalendar size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">No Pending Requests</h3>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1 max-w-[200px] mx-auto leading-relaxed">
                                Client requests will appear here once submitted.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
