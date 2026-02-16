"use client";

import React, { useState, useEffect } from 'react';
import {
    FiSave, FiCheckCircle, FiSearch, FiGlobe,
    FiDollarSign, FiCpu, FiAlertTriangle
} from 'react-icons/fi';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [settings, setSettings] = useState({
        general: { site_name: '', support_email: '', maintenance_mode: false },
        pricing: { monthly_price: 0, yearly_price: 0, currency: 'EUR' },
        features: { enable_ai_predictions: false, enable_blog: false, show_promotions: false }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all(Object.keys(settings).map(key =>
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value: settings[key] })
                })
            ));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    // Filter logic (simple client-side filter for demonstration)
    const matchesSearch = (text) => text.toLowerCase().includes(searchQuery.toLowerCase());

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header Section (Matches UserTable) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-sm text-gray-500 font-medium">Global configuration and preferences</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all w-64 shadow-sm"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${saveSuccess
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {saveSuccess ? <FiCheckCircle /> : <FiSave />}
                        {saveSuccess ? 'Saved' : (saving ? 'Saving...' : 'Save Changes')}
                    </button>
                </div>
            </div>

            {/* Main Content Card (Matches UserTable container) */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                {/* General Section */}
                {(matchesSearch('general') || matchesSearch('site') || matchesSearch('email')) && (
                    <div className="border-b border-gray-100 last:border-0">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                            <FiGlobe className="text-gray-400" />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">General Settings</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputGroup
                                label="Workspace Name"
                                value={settings.general.site_name}
                                onChange={(e) => handleChange('general', 'site_name', e.target.value)}
                            />
                            <InputGroup
                                label="Support Email"
                                value={settings.general.support_email}
                                onChange={(e) => handleChange('general', 'support_email', e.target.value)}
                            />
                            <div className="md:col-span-2">
                                <ToggleRow
                                    label="Maintenance Mode"
                                    desc="Prevent non-admin users from accessing the platform."
                                    checked={settings.general.maintenance_mode}
                                    onChange={(val) => handleChange('general', 'maintenance_mode', val)}
                                    warning
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Section */}
                {(matchesSearch('pricing') || matchesSearch('plan') || matchesSearch('billing')) && (
                    <div className="border-b border-gray-100 last:border-0">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                            <FiDollarSign className="text-gray-400" />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plans & Billing</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency</label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-500">
                                    {settings.pricing.currency} (Fixed)
                                </div>
                            </div>
                            <InputGroup
                                label="Monthly Plan Price"
                                value={settings.pricing.monthly_price}
                                onChange={(e) => handleChange('pricing', 'monthly_price', parseFloat(e.target.value))}
                                type="number"
                                prefix="€"
                            />
                            <InputGroup
                                label="Yearly Plan Price"
                                value={settings.pricing.yearly_price}
                                onChange={(e) => handleChange('pricing', 'yearly_price', parseFloat(e.target.value))}
                                type="number"
                                prefix="€"
                            />
                        </div>
                    </div>
                )}

                {/* Features Section */}
                {(matchesSearch('features') || matchesSearch('ai') || matchesSearch('blog')) && (
                    <div className="border-b border-gray-100 last:border-0">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                            <FiCpu className="text-gray-400" />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Feature Flags</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ToggleRow
                                label="AI Predictions"
                                desc="Enable automated chart analysis using Llama 3.2."
                                checked={settings.features.enable_ai_predictions}
                                onChange={(val) => handleChange('features', 'enable_ai_predictions', val)}
                            />
                            <ToggleRow
                                label="Public Blog"
                                desc="Show CMS-driven blog section on homepage."
                                checked={settings.features.enable_blog}
                                onChange={(val) => handleChange('features', 'enable_blog', val)}
                            />
                            <ToggleRow
                                label="Seasonal Promotions"
                                desc="Display marketing banners for campaigns."
                                checked={settings.features.show_promotions}
                                onChange={(val) => handleChange('features', 'show_promotions', val)}
                            />
                        </div>
                    </div>
                )}

                {/* Announcements Section */}
                {(matchesSearch('announcements') || matchesSearch('banner') || matchesSearch('wish')) && (
                    <div className="last:border-0">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                            <FiAlertTriangle className="text-gray-400" />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Announcements & Banners</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6">
                            <ToggleRow
                                label="Enable Banner"
                                desc="Show a global announcement banner on the top of the homepage."
                                checked={settings.announcements?.enabled || false}
                                onChange={(val) => handleChange('announcements', 'enabled', val)}
                            />

                            {settings.announcements?.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Banner Message</label>
                                        <textarea
                                            value={settings.announcements?.message || ''}
                                            onChange={(e) => handleChange('announcements', 'message', e.target.value)}
                                            rows={2}
                                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                            placeholder="e.g. Happy New Year 2025! 🎇"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Banner Style</label>
                                        <select
                                            value={settings.announcements?.type || 'info'}
                                            onChange={(e) => handleChange('announcements', 'type', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="info">Info (Blue)</option>
                                            <option value="success">Success (Green)</option>
                                            <option value="warning">Warning (Amber)</option>
                                            <option value="festive">Festive / New Year (Gradient)</option>
                                        </select>
                                    </div>
                                    <div>
                                        {/* Placeholder for future date picker if needed */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* --- SHARED COMPONENTS --- */

const InputGroup = ({ label, value, onChange, type = "text", prefix }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
        <div className="relative">
            {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{prefix}</span>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 ${prefix ? 'pl-8' : 'pl-3'} pr-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
            />
        </div>
    </div>
);

const ToggleRow = ({ label, desc, checked, onChange, warning }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${checked
            ? (warning ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200')
            : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
    >
        <div>
            <div className="flex items-center gap-2">
                {warning && checked && <FiAlertTriangle className="text-amber-600" size={14} />}
                <h4 className={`text-sm font-bold ${checked ? (warning ? 'text-amber-800' : 'text-blue-800') : 'text-gray-900'}`}>{label}</h4>
            </div>
            <p className={`text-xs mt-1 ${checked ? (warning ? 'text-amber-700' : 'text-blue-700') : 'text-gray-500'}`}>{desc}</p>
        </div>

        <div className={`w-10 h-6 flex items-center rounded-full p-1 duration-200 ${checked
            ? (warning ? 'bg-amber-500' : 'bg-blue-600')
            : 'bg-gray-300'
            }`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
    </div>
);

export default SettingsPage;
