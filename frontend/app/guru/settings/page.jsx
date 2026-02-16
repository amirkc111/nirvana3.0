"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FiUser, FiGlobe, FiBriefcase, FiZap, FiSave, FiAlertCircle, FiCheck, FiChevronRight } from 'react-icons/fi';

export default function GuruSettings() {
    const [guru, setGuru] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState(null);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        try {
            const res = await fetch(`/api/guru/profile?userId=${user.id}`);
            const result = await res.json();
            setGuru(result.guru);
        } catch (error) {
            console.error('Failed to fetch guru profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const updates = {
                userId,
                name: guru.name,
                title: guru.title,
                languages: guru.languages,
                is_free: guru.is_free,
                price_per_minute: guru.price_per_minute
            };

            const res = await fetch('/api/guru/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to update profile.');
            }
        } catch (error) {
            console.error('Update failed:', error);
            setMessage('An error occurred.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[500px]">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!guru) return (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center max-w-lg mx-auto mt-12 shadow-sm">
            <FiAlertCircle className="mx-auto text-amber-500 mb-6" size={48} />
            <h3 className="text-xl font-bold text-amber-900 tracking-tight">Identity Not Found</h3>
            <p className="text-[11px] text-amber-700 mt-2 leading-relaxed font-semibold uppercase tracking-widest">
                Please contact the system administrator to link your account to a guru profile.
            </p>
        </div>
    );

    return (
        <div className="max-w-xl animate-fade-in space-y-8 pb-32">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
                <p className="text-xs font-semibold text-blue-600/80 uppercase tracking-widest pl-0.5">Maintain your professional profile and service rates</p>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-8">

                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <FiUser size={13} className="text-blue-500" /> Display Name
                            </label>
                            <input
                                type="text"
                                value={guru.name || ''}
                                onChange={(e) => setGuru({ ...guru, name: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all placeholder:text-gray-300"
                                placeholder="Consultant Name"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <FiBriefcase size={13} className="text-blue-500" /> Expertise / Title
                            </label>
                            <input
                                type="text"
                                value={guru.title || ''}
                                onChange={(e) => setGuru({ ...guru, title: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all placeholder:text-gray-300"
                                placeholder="e.g., Vedic Astrologist"
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <FiGlobe size={13} className="text-blue-500" /> Supported Languages
                        </label>
                        <input
                            type="text"
                            value={guru.languages || ''}
                            onChange={(e) => setGuru({ ...guru, languages: e.target.value })}
                            placeholder="English, Sanskrit, etc."
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all placeholder:text-gray-300"
                        />
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

                    {/* Ritual Availability (Mobile-First Toggle) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-blue-50/30 rounded-2xl border border-blue-50 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-blue-900/10">
                                    <FiZap size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-blue-900/60 uppercase tracking-widest leading-none">Service Tier</p>
                                    <p className="text-sm font-bold text-blue-600">{guru.is_free ? 'Standard (Free)' : 'Premium (Paid)'}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!guru.is_free}
                                    onChange={(e) => setGuru({ ...guru, is_free: !e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                            </label>
                        </div>

                        {!guru.is_free && (
                            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    Rate per Minute (€)
                                </label>
                                <input
                                    type="number"
                                    value={guru.price_per_minute || 0}
                                    step="0.01"
                                    onChange={(e) => setGuru({ ...guru, price_per_minute: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all shadow-inner"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Actions */}
                <div className="flex flex-col gap-5 px-1">
                    {message && (
                        <p className={`text-[11px] font-bold uppercase tracking-widest text-center p-4 rounded-2xl border transition-all animate-in zoom-in-95 ${message.includes('success')
                            ? 'bg-green-50 text-green-600 border-green-100 shadow-sm'
                            : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'
                            }`}>
                            {message}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="group relative w-full h-16 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all" />

                        <div className="relative flex items-center justify-center gap-3 text-white">
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiSave size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                                    <span className="text-sm font-bold uppercase tracking-[0.15em] antialiased">Save Profile Changes</span>
                                </>
                            )}
                        </div>
                    </button>

                </div>
            </form>
        </div>
    );
}
