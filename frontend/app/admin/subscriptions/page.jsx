"use client";

import React, { useState, useEffect } from 'react';
import {
    FiTrendingUp, FiUsers, FiDollarSign, FiSearch,
    FiDownload, FiActivity, FiUserCheck, FiFilter
} from 'react-icons/fi';

export default function SubscriptionsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ mrr: 0, arr: 0, total_subscribers: 0, active_rate: 0 });
    const [subscribers, setSubscribers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/subscriptions');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setSubscribers(data.subscribers);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubscribers = subscribers.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscriptions</h1>
                    <p className="text-sm text-gray-500 font-medium">Revenue analytics and subscriber management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                        <FiDownload /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        <FiActivity /> Live Analytics
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Monthly Recurring Revenue"
                    value={`€${stats.mrr.toFixed(2)}`}
                    subvalue={`ARR: €${stats.arr.toFixed(2)}`}
                    icon={FiDollarSign}
                    trend="+12% vs last month"
                    color="green"
                />
                <StatsCard
                    label="Active Subscribers"
                    value={stats.total_subscribers}
                    subvalue="Premium Users"
                    icon={FiUserCheck}
                    trend="+5 new today"
                    color="blue"
                />
                <StatsCard
                    label="Conversion Rate"
                    value={`${stats.active_rate.toFixed(1)}%`}
                    subvalue="Free to Paid"
                    icon={FiTrendingUp}
                    trend="+2.1% increase"
                    color="purple"
                />
            </div>

            {/* Subscribers Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-lg">Subscriber List</h3>
                    <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find subscriber..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Plan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Start Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSubscribers.length > 0 ? (
                                    filteredSubscribers.map((sub, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{sub.name}</span>
                                                    <span className="text-xs text-gray-400">{sub.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold capitalize ${sub.plan === 'yearly' ? 'bg-purple-100 text-purple-700' :
                                                    sub.plan === 'monthly' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {sub.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-bold text-gray-900">€{sub.amount.toFixed(2)}</span>
                                                    <span className="text-xs text-gray-400">{sub.cycle}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sub.status === 'Active' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-50 text-gray-500 ring-1 ring-gray-600/10'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-500 tabular-nums">
                                                {sub.startDate}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No subscribers found</td>
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

const StatsCard = ({ label, value, subvalue, icon: Icon, trend, color }) => {
    const colorClasses = {
        green: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
                <p className="text-xs font-medium text-gray-400 mt-1">{subvalue}</p>
            </div>
        </div>
    );
};
