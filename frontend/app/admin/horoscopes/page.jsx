"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    FiCalendar, FiEdit2, FiTrash2, FiPlus, FiSearch,
    FiCheck, FiX, FiRefreshCw
} from 'react-icons/fi';

const ZODIACS = [
    { en: 'Aries', np: 'मेष' }, { en: 'Taurus', np: 'वृष' },
    { en: 'Gemini', np: 'मिथुन' }, { en: 'Cancer', np: 'कर्कट' },
    { en: 'Leo', np: 'सिंह' }, { en: 'Virgo', np: 'कन्या' },
    { en: 'Libra', np: 'तुला' }, { en: 'Scorpio', np: 'वृश्चिक' },
    { en: 'Sagittarius', np: 'धनु' }, { en: 'Capricorn', np: 'मकर' },
    { en: 'Aquarius', np: 'कुम्भ' }, { en: 'Pisces', np: 'मीन' }
];

export default function HoroscopesPage() {
    const [loading, setLoading] = useState(true);
    const [horoscopes, setHoroscopes] = useState([]);
    const [activeTab, setActiveTab] = useState('daily'); // daily, weekly, monthly
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        period: 'daily',
        signs: {} // map of sign_name -> text
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchHoroscopes();
    }, [activeTab]);

    const fetchHoroscopes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/horoscopes?period=${activeTab}`);
            if (res.ok) {
                const data = await res.json();
                setHoroscopes(data.horoscopes || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        const signMap = {};
        if (Array.isArray(item.data)) {
            item.data.forEach(s => signMap[s.name] = s.text);
        }

        // Extract date from cache_key if possible, else default to today
        let date = new Date().toISOString().split('T')[0];
        const parts = item.cache_key.split('-');
        if (parts.length >= 2) {
            // Try to reconstruct date from key like daily-2025-01-01 or weekly-2025-01-01
            const datePart = parts.slice(1).join('-');
            if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
                date = datePart;
            }
        }

        setEditingItem(item);
        setFormData({
            date: date,
            period: item.period,
            signs: signMap
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this horoscope?')) return;
        try {
            await fetch(`/api/admin/horoscopes?id=${id}`, { method: 'DELETE' });
            setHoroscopes(prev => prev.filter(h => h.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        // Construct payload
        const formattedData = ZODIACS.map(z => ({
            name: z.np, // We use Nepali name as key in the stored JSON usually
            text: formData.signs[z.np] || ''
        }));

        const cacheKey = `${formData.period}-${formData.date}`;

        const payload = {
            id: editingItem?.id,
            period: formData.period,
            cache_key: cacheKey,
            data: formattedData
        };

        try {
            const res = await fetch('/api/admin/horoscopes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchHoroscopes();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openNewModal = () => {
        setEditingItem(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            period: activeTab,
            signs: {}
        });
        setIsModalOpen(true);
    };

    const filteredList = horoscopes.filter(h => h.cache_key.includes(searchQuery));

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Horoscope Management</h1>
                    <p className="text-sm text-gray-500">Manage cached astrology predictions</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
                    {['daily', 'weekly', 'monthly', 'yearly'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <FiPlus /> New Entry
                </button>
            </div>

            {/* List */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 capitalize">{activeTab} Archives</h3>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter by key..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" /></div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Cache Key</th>
                                <th className="px-6 py-3">Created At</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredList.length > 0 ? filteredList.map(h => (
                                <tr key={h.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-3 font-mono text-blue-600 font-medium">{h.cache_key}</td>
                                    <td className="px-6 py-3 text-gray-500">{new Date(h.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right space-x-2">
                                        <button onClick={() => handleEdit(h)} className="text-gray-400 hover:text-blue-600"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(h.id)} className="text-gray-400 hover:text-red-600"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Modal */}
            {mounted && isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col pt-6">
                        <div className="px-8 pb-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingItem ? 'Edit Horoscope' : 'Create Horoscope'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Period</label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700 font-mono">
                                Generating Key: <strong>{formData.period}-{formData.date}</strong>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900">Sign Predictions (Nepali)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ZODIACS.map((z) => (
                                        <div key={z.en} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-gray-700">{z.en}</span>
                                                <span className="text-gray-400 text-sm">{z.np}</span>
                                            </div>
                                            <textarea
                                                rows="3"
                                                className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                                placeholder={`Prediction for ${z.en}...`}
                                                value={formData.signs[z.np] || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    signs: { ...formData.signs, [z.np]: e.target.value }
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                            >
                                <FiCheck /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
