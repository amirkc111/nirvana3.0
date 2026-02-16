"use client";

import React, { useState, useEffect } from 'react';
import {
    FiPlus, FiTrash2, FiEdit2, FiImage, FiVideo,
    FiType, FiCheck, FiX, FiLink, FiEye, FiMousePointer
} from 'react-icons/fi';

const AdsPage = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAd, setCurrentAd] = useState(null);

    // Initial Empty State for new Ad
    const initialAdState = {
        title: '',
        type: 'text', // text, image, video
        message: '',
        media_url: '',
        link: '',
        link_label: 'Learn More',
        is_active: false
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/admin/ads');
            if (res.ok) {
                const data = await res.json();
                setAds(data);
            }
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentAd)
            });

            if (res.ok) {
                setIsEditing(false);
                fetchAds(); // Refresh list to see updates (esp. active status toggles)
            } else {
                const err = await res.json();
                alert(`Failed to save: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Failed to save ad", error);
            alert("An error occurred while saving. Please check the console.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this ad?")) return;
        try {
            const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchAds();
        } catch (error) {
            console.error("Failed to delete ad", error);
        }
    };

    const openEdit = (ad) => {
        setCurrentAd(ad);
        setIsEditing(true);
    };

    const openNew = () => {
        setCurrentAd(initialAdState);
        setIsEditing(true);
    };

    if (loading) return <div className="p-8 text-center">Loading ads...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ads & Banners</h1>
                    <p className="text-sm text-gray-500">Manage promotional content for the homepage.</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <FiPlus /> Create New Ad
                </button>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {ads.map(ad => (
                    <div key={ad.id} className={`bg-white border rounded-2xl p-5 shadow-sm relative overflow-hidden group ${ad.is_active ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
                        {ad.is_active && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                                Active Live
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${ad.type === 'video' ? 'bg-red-50 text-red-600' :
                                    ad.type === 'image' ? 'bg-purple-50 text-purple-600' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                    {ad.type === 'video' ? <FiVideo /> : ad.type === 'image' ? <FiImage /> : <FiType />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{ad.title}</h3>
                                    <p className="text-xs text-gray-500 capitalize">{ad.type} Ad</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mb-4 min-h-[60px]">
                            {ad.type === 'text' ? (
                                <p className="line-clamp-3">{ad.message}</p>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FiLink /> <span className="truncate">{ad.media_url || 'No media URL'}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2 border-t border-gray-100 items-center">
                            <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 flex items-center gap-2 border border-gray-100" title="Total Clicks">
                                <FiMousePointer size={12} /> {ad.clicks || 0}
                            </div>
                            <button
                                onClick={() => openEdit(ad)}
                                className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <FiEdit2 /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(ad.id)}
                                className="w-10 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <form onSubmit={handleSave}>
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-900">{currentAd.id ? 'Edit Ad' : 'New Campaign'}</h3>
                                <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><FiX /></button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Internal Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                        placeholder="e.g. New Year 2025"
                                        value={currentAd.title}
                                        onChange={e => setCurrentAd({ ...currentAd, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ad Type</label>
                                        <select
                                            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                            value={currentAd.type}
                                            onChange={e => setCurrentAd({ ...currentAd, type: e.target.value })}
                                        >
                                            <option value="text">Text Only</option>
                                            <option value="image">Image Banner</option>
                                            <option value="video">Video Embed</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 w-full border rounded-lg p-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                checked={currentAd.is_active}
                                                onChange={e => setCurrentAd({ ...currentAd, is_active: e.target.checked })}
                                            />
                                            <span className="text-sm font-bold text-gray-700">Set Active Now</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message / Content</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                        placeholder="Enter the main text to display..."
                                        value={currentAd.message}
                                        onChange={e => setCurrentAd({ ...currentAd, message: e.target.value })}
                                    />
                                </div>

                                {(currentAd.type === 'image' || currentAd.type === 'video') && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Media URL</label>
                                        <input
                                            type="url"
                                            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            placeholder={currentAd.type === 'video' ? "https://youtube.com/..." : "https://example.com/image.jpg"}
                                            value={currentAd.media_url}
                                            onChange={e => setCurrentAd({ ...currentAd, media_url: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Action Link (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            placeholder="/pricing or https://..."
                                            value={currentAd.link}
                                            onChange={e => setCurrentAd({ ...currentAd, link: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Label</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            placeholder="Learn More"
                                            value={currentAd.link_label}
                                            onChange={e => setCurrentAd({ ...currentAd, link_label: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Save Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdsPage;
