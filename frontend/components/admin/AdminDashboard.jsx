"use client";

import React from 'react';
import {
    FiArrowUp,
    FiUsers,
    FiDollarSign,
    FiActivity,
    FiTrendingUp
} from 'react-icons/fi';

const AdminDashboard = () => {
    const [period, setPeriod] = React.useState('monthly');
    const [viewType, setViewType] = React.useState('revenue'); // revenue, services
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [data, setData] = React.useState({
        stats: [
            { name: 'Total Revenue', value: '€0.00', trend: '...', icon: FiDollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
            { name: 'Active Clients', value: '0', trend: '...', icon: FiUsers, color: 'text-gray-600', bg: 'bg-gray-100' },
            { name: 'Total Charts', value: '0', trend: '...', icon: FiActivity, color: 'text-green-600', bg: 'bg-green-50' },
            { name: 'Conversion', value: '0%', trend: '...', icon: FiTrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ],
        charts: { growth: [], services: [] },
        loading: true
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/admin/stats?period=${period}`);
                if (response.ok) {
                    const result = await response.json();

                    // Map icons back (they are strings in JSON)
                    const iconMap = {
                        FiDollarSign: FiDollarSign,
                        FiUsers: FiUsers,
                        FiActivity: FiActivity,
                        FiTrendingUp: FiTrendingUp
                    };

                    const enrichedStats = result.stats.map(s => ({
                        ...s,
                        icon: iconMap[s.icon] || FiActivity
                    }));

                    setData({
                        stats: enrichedStats,
                        charts: result.charts,
                        recentUsers: result.recentUsers,
                        recentAppointments: result.recentAppointments,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, [period]);

    if (data.loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { stats } = data;

    return (
        <div className="space-y-8 min-h-full">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-500 text-sm mt-1">Real-time business insights and service performance metrics.</p>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                                <FiArrowUp size={12} /> {stat.trend}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 leading-none">{stat.name}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {viewType === 'revenue' ? 'Revenue Growth' : 'Total Services'}
                                </h3>
                                <select
                                    value={viewType}
                                    onChange={(e) => setViewType(e.target.value)}
                                    className="text-[10px] font-bold bg-blue-50 text-blue-600 border-none rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-blue-100 transition-colors"
                                >
                                    <option value="revenue">Revenue Mode</option>
                                    <option value="services">Services Mode</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-500">
                                {viewType === 'revenue' ? 'Gross revenue and user growth trends.' : 'Total volume of consultation and reading requests.'}
                            </p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setPeriod('monthly')}
                                className={`px-3 py-1 text-xs font-semibold rounded shadow-sm transition-all ${period === 'monthly' ? 'bg-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setPeriod('weekly')}
                                className={`px-3 py-1 text-xs font-semibold rounded shadow-sm transition-all ${period === 'weekly' ? 'bg-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Weekly
                            </button>
                        </div>
                    </div>

                    {/* Dynamic SVG Chart */}
                    <div className="h-64 relative w-full pt-4">
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="border-t border-gray-100 w-full h-0"></div>
                            ))}
                        </div>
                        <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                            {(() => {
                                const chartData = viewType === 'revenue' ? (data.charts.growth || []) : (data.charts.services || []);
                                if (chartData.length === 0) return null;

                                const maxVal = Math.max(...chartData.map(d => d.value), 1);
                                const points = chartData.map((d, i) => ({
                                    x: (i / (chartData.length - 1)) * 1000,
                                    y: 280 - (d.value / maxVal) * 240
                                }));

                                const d = points.reduce((acc, p, i) =>
                                    i === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`,
                                    '');

                                return (
                                    <>
                                        <path
                                            d={d}
                                            fill="none"
                                            stroke="#2563eb"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d={`${d} L1000,300 L0,300 Z`}
                                            fill="rgba(37, 99, 235, 0.05)"
                                        />
                                        {points.map((p, i) => (
                                            <circle
                                                key={i}
                                                cx={p.x}
                                                cy={p.y}
                                                r="4"
                                                fill="#2563eb"
                                                className="hover:scale-150 transition-transform cursor-pointer"
                                            />
                                        ))}
                                    </>
                                );
                            })()}
                        </svg>
                    </div>
                </div>

                {/* Latest Requests */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Latest Requests</h3>
                        <button
                            onClick={() => window.location.href = '/admin/notifications'}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                        {(data.recentAppointments || []).length > 0 ? (
                            data.recentAppointments.map((req, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className={`p-2 rounded-lg shrink-0 ${req.type === 'consultation' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                        }`}>
                                        <FiActivity size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-900 truncate">{req.client_name}</p>
                                        <p className="text-[10px] text-gray-500 capitalize">{req.type}</p>
                                    </div>
                                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase">
                                        {req.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <p className="text-xs text-gray-400 italic">No new requests</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                            You have <span className="text-blue-600 font-bold">{(data.recentAppointments || []).length}</span> pending leads to review.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Clients Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Recent Users</h3>
                    <button
                        onClick={() => window.location.href = '/admin/users'}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                        View Report
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">User Profile</th>
                                <th className="px-6 py-3.5">Sign</th>
                                <th className="px-6 py-3.5">Account Status</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(data.recentUsers || []).map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{user.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-gray-600 px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                                            {user.zodiac || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${user.status === 'Premium'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Premium' ? 'bg-amber-500' : 'bg-green-500'
                                                }`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="text-xs font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">User Details</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-3xl mb-4 border-4 border-white shadow-md">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Plan Status</p>
                                    <p className={`mt-1 font-bold ${selectedUser.status === 'Premium' ? 'text-amber-600' : 'text-green-600'}`}>
                                        {selectedUser.status}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Zodiac Sign</p>
                                    <p className="mt-1 font-bold text-gray-800">{selectedUser.zodiac || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">User ID</p>
                                    <p className="mt-1 font-mono text-[10px] text-gray-500 overflow-hidden text-ellipsis">{selectedUser.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Last Activity</p>
                                    <p className="mt-1 font-bold text-gray-800">Just now</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex gap-3">
                            <button
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
