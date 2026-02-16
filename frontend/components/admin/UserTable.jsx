"use client";

import React from 'react';
import {
    FiSearch,
    FiFilter,
    FiChevronDown,
    FiDownload,
    FiPlus,
    FiMoreHorizontal,
    FiMail
} from 'react-icons/fi';

const UserTable = () => {
    const [clients, setClients] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('Profile');
    const [activeKundliIndex, setActiveKundliIndex] = React.useState(0); // For multiple kundlis

    React.useEffect(() => {
        if (selectedUser) {
            setActiveKundliIndex(0);
        }
    }, [selectedUser]);

    const fetchUsers = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
            if (response.ok) {
                const data = await response.json();
                setClients(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const updateMembership = async (userId, newStatus) => {
        // Map status to membership value directly (dropdown values are now direct)
        // Adjust if passing 'Free'/'Monthly' instead of lowercase
        const membershipMap = {
            'Free': 'free',
            'Monthly': 'monthly',
            'Yearly': 'yearly',
            'free': 'free',
            'monthly': 'monthly',
            'yearly': 'yearly'
        };

        const membership = membershipMap[newStatus];
        if (!membership) return;

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    membership: membership,
                    membership_price: membership === 'free' ? 0 : (membership === 'monthly' ? 9.99 : 99.99) // Example prices
                }),
            });

            if (response.ok) {
                // Update local state
                const updatedClients = clients.map(client =>
                    client.id === userId
                        ? {
                            ...client,
                            status: membership === 'monthly' || membership === 'yearly' ? 'Premium' : 'Free',
                            membership_type: membership
                        }
                        : client
                );
                setClients(updatedClients);

                // If currently viewing this user in modal, update that too
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser({
                        ...selectedUser,
                        status: membership === 'monthly' || membership === 'yearly' ? 'Premium' : 'Free',
                        membership_type: membership
                    });
                }

                // Optional: Toast notification could go here
            } else {
                const errorData = await response.json();
                alert(`Failed to update membership: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating membership:', error);
            alert('An error occurred while updating membership');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Client Directory</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Manage and audit centralized client records across services.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <FiDownload size={16} /> Export
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm">
                        <FiPlus size={16} /> New Client
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or zodiac..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-gray-50 border border-transparent w-full pl-11 pr-4 py-2.5 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all text-sm"
                        suppressHydrationWarning={true}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all flex-1 md:flex-none">
                        <FiFilter size={16} /> Filters
                    </button>
                    <div className="relative flex-1 md:flex-none">
                        <select className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-10 rounded-lg text-sm font-semibold text-gray-600 outline-none w-full cursor-pointer hover:border-gray-300 transition-all">
                            <option>All Statuses</option>
                            <option>Premium</option>
                            <option>Free</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            <th className="px-6 py-4">Client Detail</th>
                            <th className="px-6 py-4 text-center">Zodiac</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Registration</th>
                            <th className="px-6 py-4 text-center">Kundlis</th>
                            <th className="px-6 py-4 text-right">Revenue</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 relative min-h-[200px]">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="text-sm text-gray-400 font-medium">Fetching client records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : clients.length > 0 ? (
                            clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{client.name}</span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <FiMail size={12} /> {client.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded uppercase">
                                            {client.zodiac}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative inline-flex items-center">
                                            <select
                                                value={client.membership_type || 'free'}
                                                onChange={(e) => updateMembership(client.id, e.target.value)}
                                                className={`appearance-none pl-3 pr-8 py-1 rounded-full text-[11px] font-bold border-0 ring-1 ring-inset outline-none cursor-pointer transition-shadow focus:ring-2 ${(client.membership_type === 'monthly' || client.membership_type === 'yearly')
                                                    ? 'bg-amber-50 text-amber-700 ring-amber-200 focus:ring-amber-300'
                                                    : 'bg-green-50 text-green-700 ring-green-200 focus:ring-green-300'
                                                    }`}
                                            >
                                                <option value="free">Free</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 ${(client.membership_type === 'monthly' || client.membership_type === 'yearly') ? 'text-amber-500' : 'text-green-500'
                                                }`}>
                                                <FiChevronDown size={14} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{client.joinDate}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                            {client.kundli_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-gray-700">{client.spent}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedUser(client)}
                                            className="text-xs font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center text-gray-500 italic">
                                    No clients found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer / Pagination Placeholder */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-500">
                    <p>Showing <span className="text-gray-900">{clients.length}</span> of <span className="text-gray-900">{clients.length}</span> entries</p>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="font-bold text-gray-900">Client Profile</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
                                {/* Left Column: User Profile */}
                                <div className="flex flex-col h-full md:border-r border-gray-100 md:pr-12">
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-4xl mb-4 border-4 border-white shadow-md">
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900 text-center">{selectedUser.name}</h4>
                                        <p className="text-gray-500 text-sm text-center">{selectedUser.email}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Zodiac Sign</p>
                                            <p className="mt-1 font-bold text-gray-800">{selectedUser.zodiac || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Joined Date</p>
                                            <p className="mt-1 font-bold text-gray-800">{selectedUser.joinDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Revenue</p>
                                            <p className="mt-1 font-bold text-gray-800">{selectedUser.spent}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Current Plan</p>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mt-1 ${selectedUser.membership_type === 'monthly' || selectedUser.membership_type === 'yearly'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {selectedUser.membership_type ? selectedUser.membership_type.charAt(0).toUpperCase() + selectedUser.membership_type.slice(1) : 'Free'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 pt-4 mt-2 border-t border-gray-50">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">User ID</p>
                                            <p className="mt-1 font-mono text-[10px] text-gray-500 break-all bg-gray-50 p-2 rounded selectable">{selectedUser.id}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Kundli Generated</p>
                                            <p className="mt-1 font-bold text-gray-800 flex items-center gap-2">
                                                {selectedUser.kundli_count || 0}
                                                <span className="text-[10px] font-normal text-gray-400 uppercase tracking-wide">Charts</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Kundli Data & Analysis */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                            <h5 className="text-sm font-bold text-gray-900">Kundli Analysis</h5>
                                        </div>
                                        {/* Chart Selector for Multiple Kundlis */}
                                        {selectedUser.kundlis && selectedUser.kundlis.length > 1 && (
                                            <div className="flex gap-2">
                                                <select
                                                    value={activeKundliIndex}
                                                    onChange={(e) => setActiveKundliIndex(Number(e.target.value))}
                                                    className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    {selectedUser.kundlis.map((k, idx) => (
                                                        <option key={idx} value={idx}>
                                                            Chart {selectedUser.kundlis.length - idx}: {k.name} ({new Date(k.created_at).toLocaleDateString()})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {(() => {
                                        // DETERMINE ACTIVE KUNDLI
                                        const activeKundli = (selectedUser.kundlis && selectedUser.kundlis[activeKundliIndex])
                                            ? selectedUser.kundlis[activeKundliIndex]
                                            : selectedUser.kundli;

                                        if (activeKundli) {
                                            // Helper for safe JSON parsing
                                            const safeJsonParse = (val) => {
                                                if (!val) return null;
                                                if (typeof val === 'object') return val;
                                                try { return JSON.parse(val); } catch (e) { return null; }
                                            };

                                            const safeAnalysis = safeJsonParse(activeKundli.analysis) || {};
                                            const safeKundliData = safeJsonParse(activeKundli.astrological_profile) || safeJsonParse(activeKundli.kundli_data) || {};
                                            const safePlanetaryAnalysis = safeJsonParse(activeKundli.planetary_analysis) || {};
                                            // Some systems might store planets in planetary_positions
                                            const safePlanets = safeJsonParse(activeKundli.planetary_positions) || safeAnalysis.planets || safeKundliData.facts?.planets || {};
                                            const predictions = safeAnalysis.predictions || activeKundli.aiPredictions || activeKundli.ai_predictions || null;

                                            return (
                                                <div className="flex flex-col h-full">
                                                    {/* Tabs */}
                                                    <div className="flex bg-gray-50 p-1 rounded-xl mb-6">

                                                        {['Profile', 'Details', 'Predictive', 'Planetary'].map((tab) => (
                                                            <button
                                                                key={tab}
                                                                onClick={() => setActiveTab(tab)}
                                                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                                    : 'text-gray-400 hover:text-gray-600'
                                                                    }`}
                                                            >
                                                                {tab}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Tab Content */}
                                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

                                                        {/* Astrological Profile */}
                                                        {activeTab === 'Profile' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                {(safeAnalysis.ascendant || safePlanets.Moon || safeKundliData.facts) ? (
                                                                    <>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/10 via-blue-900/5 to-transparent border border-blue-200">
                                                                                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">Ascendant</p>
                                                                                <p className="text-xl font-black text-blue-600 tracking-tight">
                                                                                    {safeAnalysis.ascendant?.sign || safeKundliData.facts?.ascendant?.sign || 'Unknown'}
                                                                                </p>
                                                                                <div className="mt-2 flex items-center gap-2">
                                                                                    <div className="h-1 flex-1 bg-blue-100 rounded-full overflow-hidden">
                                                                                        <div className="h-full bg-blue-500" style={{ width: `${((Number(safeAnalysis.ascendant?.degree || safeKundliData.facts?.ascendant?.degree || 0) % 30) / 30) * 100}%` }}></div>
                                                                                    </div>
                                                                                    <span className="text-[10px] font-bold text-blue-400">{Number(safeAnalysis.ascendant?.degree || safeKundliData.facts?.ascendant?.degree || 0).toFixed(0)}°</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/10 via-purple-900/5 to-transparent border border-purple-200">
                                                                                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">Moon Sign</p>
                                                                                <p className="text-xl font-black text-purple-600 tracking-tight">
                                                                                    {safePlanets.Moon?.sign || 'Unknown'}
                                                                                </p>
                                                                                <div className="mt-2 flex items-center gap-2">
                                                                                    <div className="h-1 flex-1 bg-purple-100 rounded-full overflow-hidden">
                                                                                        <div className="h-full bg-purple-500" style={{ width: `${((safePlanets.Moon?.degree % 30) / 30) * 100}%` }}></div>
                                                                                    </div>
                                                                                    <span className="text-[10px] font-bold text-purple-400">{Number(safePlanets.Moon?.degree || 0).toFixed(0)}°</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Vedic Indicators */}
                                                                        {safeKundliData.facts?.avakahada && (
                                                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                                                <h6 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                                                    <span className="text-lg">✨</span> Vedic Indicators
                                                                                </h6>
                                                                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                                                                    {[
                                                                                        { label: 'Nakshatra', value: safeKundliData.facts.avakahada.nakshatra },
                                                                                        { label: 'Rasi', value: safeKundliData.facts.avakahada.rasi },
                                                                                        { label: 'Pada', value: safeKundliData.facts.avakahada.pada },
                                                                                        { label: 'Word', value: safeKundliData.facts.avakahada.word },
                                                                                        { label: 'Varna', value: safeKundliData.facts.avakahada.varna },
                                                                                        { label: 'Vashya', value: safeKundliData.facts.avakahada.vashya },
                                                                                        { label: 'Yoni', value: safeKundliData.facts.avakahada.yoni },
                                                                                        { label: 'Gana', value: safeKundliData.facts.avakahada.gana },
                                                                                        { label: 'Nadi', value: safeKundliData.facts.avakahada.nadi }
                                                                                    ].map((item, i) => (
                                                                                        <div key={i}>
                                                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                                                                                            <p className="text-xs font-bold text-gray-800">{item.value}</p>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="p-6 text-center text-gray-400 text-xs italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                                        Analysis data not available. Run generation in client view.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Birth Details */}
                                                        {activeTab === 'Details' && (
                                                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Name</p>
                                                                        <p className="font-semibold text-gray-800 text-sm truncate">{activeKundli.name}</p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Gender</p>
                                                                        <p className="font-semibold text-gray-800 text-sm">{activeKundli.gender}</p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Date</p>
                                                                        <p className="font-semibold text-gray-800 text-sm">
                                                                            {activeKundli.birth_day}/{activeKundli.birth_month}/{activeKundli.birth_year}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Time</p>
                                                                        <p className="font-semibold text-gray-800 text-sm">
                                                                            {activeKundli.birth_hour}:{activeKundli.birth_minute?.toString().padStart(2, '0')}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Family Details */}
                                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="text-lg">👨‍👩‍👧‍👦</span>
                                                                        <h6 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Family Coverage</h6>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Father's Name</p>
                                                                            <p className="font-semibold text-gray-800 text-sm">
                                                                                {activeKundli.father_name || safeKundliData.basicInfo?.fatherName || '-'}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Mother's Name</p>
                                                                            <p className="font-semibold text-gray-800 text-sm">
                                                                                {activeKundli.mother_name || safeKundliData.basicInfo?.motherName || '-'}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Gotra</p>
                                                                            <p className="font-semibold text-gray-800 text-sm">
                                                                                {activeKundli.gotra || safeKundliData.basicInfo?.gotra || '-'}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Nawran Name</p>
                                                                            <p className="font-semibold text-gray-800 text-sm">
                                                                                {activeKundli.nawran_name || safeKundliData.basicInfo?.nawranName || '-'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>


                                                                <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                                                                    <div>
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Place of Birth</p>
                                                                        <p className="font-semibold text-gray-800 text-sm">{activeKundli.birth_place}</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/50">
                                                                        <div>
                                                                            <span className="text-[10px] text-gray-500 block">Latitude</span>
                                                                            <span className="text-sm font-mono font-medium text-gray-700">{activeKundli.birth_latitude}°</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[10px] text-gray-500 block">Longitude</span>
                                                                            <span className="text-sm font-mono font-medium text-gray-700">{activeKundli.birth_longitude}°</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="pt-2 border-t border-gray-200/50">
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Timezone</p>
                                                                        <p className="text-xs text-gray-600">{activeKundli.timezone_name} (GMT {activeKundli.timezone > 0 ? '+' : ''}{activeKundli.timezone})</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-end pt-2">
                                                                    <button
                                                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(activeKundli, null, 2))}
                                                                        className="text-[10px] font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                                        Json
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Predictive Intelligence */}
                                                        {activeTab === 'Predictive' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                {predictions ? (
                                                                    <div className="grid grid-cols-1 gap-3">
                                                                        {Object.entries(predictions)
                                                                            .filter(([key]) => !['yogas_analysis', 'doshas_analysis'].includes(key))
                                                                            .map(([key, val]) => (
                                                                                <div key={key} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 blur-2xl -mr-8 -mt-8"></div>
                                                                                    <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                                        <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                                                                                        {key.replace(/_/g, ' ')}
                                                                                    </h4>
                                                                                    <p className="text-xs text-gray-600 leading-relaxed font-medium italic">
                                                                                        "{typeof val === 'object' ? JSON.stringify(val) : val}"
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                                        <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">🧠</div>
                                                                        <p className="text-sm font-bold text-gray-800">AI Analysis Not Found</p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            The user has not run the AI predictive analysis yet.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Planetary Analysis */}
                                                        {activeTab === 'Planetary' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                {(safePlanetaryAnalysis && Object.keys(safePlanetaryAnalysis).length > 0) ? (
                                                                    <div className="grid grid-cols-1 gap-4">
                                                                        {Object.entries(safePlanetaryAnalysis).map(([planet, data]) => (
                                                                            <div key={planet} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                                                <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black uppercase">
                                                                                            {planet.substring(0, 2)}
                                                                                        </span>
                                                                                        <div>
                                                                                            <h5 className="text-sm font-bold text-gray-900 leading-none">{planet}</h5>
                                                                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 inline-block font-medium">
                                                                                                in House {data.house} ({data.sign})
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    {data.strength && (
                                                                                        <div className="text-right">
                                                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Strength</div>
                                                                                            <div className="text-xs font-black text-green-600">{data.strength.positive}%</div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="space-y-3">
                                                                                    {data.ui_text?.house_meaning && (
                                                                                        <div>
                                                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">House Significance</p>
                                                                                            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-2 rounded-lg">
                                                                                                {data.ui_text.house_meaning}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                        {data.ui_text?.positive_effects && (
                                                                                            <div className="bg-green-50/50 p-2.5 rounded-lg border border-green-100/50">
                                                                                                <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                                                    <span>✅</span> Positive
                                                                                                </p>
                                                                                                <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                                                                                                    {Array.isArray(data.ui_text.positive_effects)
                                                                                                        ? data.ui_text.positive_effects.join('. ')
                                                                                                        : data.ui_text.positive_effects}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                        {data.ui_text?.negative_effects && (
                                                                                            <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100/50">
                                                                                                <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                                                    <span>⚠️</span> Challenges
                                                                                                </p>
                                                                                                <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                                                                                                    {Array.isArray(data.ui_text.negative_effects)
                                                                                                        ? data.ui_text.negative_effects.join('. ')
                                                                                                        : data.ui_text.negative_effects}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>

                                                                                    {data.ui_text?.placement_rule && (
                                                                                        <div className="pt-2 border-t border-gray-50 mt-1">
                                                                                            <p className="text-[10px] text-gray-400 italic">
                                                                                                <span className="font-bold not-italic text-gray-500">Key Insight:</span> {data.ui_text.placement_rule}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    /* FALLBACK to Simple Table if detailed analysis is missing */
                                                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                                                        <table className="w-full text-left">
                                                                            <thead>
                                                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                                                    <th className="px-3 py-2 text-[9px] font-bold text-gray-500 uppercase">Planet</th>
                                                                                    <th className="px-3 py-2 text-[9px] font-bold text-gray-500 uppercase">Sign</th>
                                                                                    <th className="px-3 py-2 text-[9px] font-bold text-gray-500 uppercase">Degree</th>
                                                                                    <th className="px-3 py-2 text-[9px] font-bold text-gray-500 uppercase">Nakshatra</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-gray-50">
                                                                                {safePlanets && Object.keys(safePlanets).length > 0 ? (
                                                                                    Object.entries(safePlanets).map(([planet, details]) => (
                                                                                        <tr key={planet} className="hover:bg-gray-50/50">
                                                                                            <td className="px-3 py-2 text-xs font-bold text-gray-800">{planet}</td>
                                                                                            <td className="px-3 py-2 text-[10px] font-medium text-gray-600">{details.sign || '-'}</td>
                                                                                            <td className="px-3 py-2 text-[10px] font-medium text-gray-600 font-mono">{Number(details.degree || 0).toFixed(2)}°</td>
                                                                                            <td className="px-3 py-2 text-[10px] font-medium text-gray-600">{details.nakshatra || '-'}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan="4" className="px-3 py-4 text-center text-xs text-gray-400">No planetary data available</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-500">No Kundli data found</p>
                                                    <p className="text-xs mt-1 text-gray-400">User hasn't generated a chart yet</p>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex gap-3 shrink-0">
                            <button
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm"
                                onClick={() => setSelectedUser(null)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default UserTable;
