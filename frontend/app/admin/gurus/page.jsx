"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';

export default function AdminGurusPage() {
    const [gurus, setGurus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGuru, setEditingGuru] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        image_url: '',
        languages: '',
        rating: 5.0,
        is_free: false,
        email: '',
        password: '',
    });

    useEffect(() => {
        fetchGurus();
    }, []);

    const fetchGurus = async () => {
        try {
            const { data, error } = await supabase
                .from('gurus')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGurus(data || []);
        } catch (error) {
            console.error('Error fetching gurus:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const method = editingGuru ? 'PATCH' : 'POST';
            const payload = {
                ...formData,
                id: editingGuru?.id,
                rating: formData.rating === '' ? null : parseFloat(formData.rating),
            };

            const res = await fetch('/api/admin/gurus', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Server error');

            closeModal();
            fetchGurus();
        } catch (error) {
            console.error('Error saving guru:', error);
            alert(`Error saving guru: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this guru?')) return;
        try {
            const { error } = await supabase
                .from('gurus')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchGurus();
        } catch (error) {
            console.error('Error deleting guru:', error);
            alert('Error deleting guru');
        }
    };

    const openModal = (guru = null) => {
        if (guru) {
            setEditingGuru(guru);
            setFormData({
                name: guru.name || '',
                title: guru.title || '',
                image_url: guru.image_url || '',
                languages: guru.languages || '',
                rating: guru.rating || 5.0,
                is_free: !!guru.is_free,
                email: guru.email || '',
                password: '', // Password is never loaded for security
            });
        } else {
            setEditingGuru(null);
            setFormData({
                name: '',
                title: '',
                image_url: '',
                languages: '',
                rating: 5.0,
                is_free: false,
                email: '',
                password: '',
            });
        }
        setIsModalOpen(true);
        setShowPassword(false); // Reset visibility when opening
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGuru(null);
        setShowPassword(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Guru Management</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <FiPlus /> Add Guru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Guru</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role & Skills</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                            ) : gurus.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No gurus found. Add one to get started.</td></tr>
                            ) : (
                                gurus.map((guru) => (
                                    <tr key={guru.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                                    {guru.image_url && <Image src={guru.image_url} alt={guru.name} fill className="object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{guru.name}</p>
                                                    <p className="text-xs text-blue-600 font-medium">{guru.email || 'No email set'}</p>
                                                    <p className="text-[10px] text-gray-400">Rating: {guru.rating}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{guru.title}</p>
                                            <p className="text-xs text-gray-500">{guru.languages}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${guru.is_free ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {guru.is_free ? 'Free' : 'Paid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openModal(guru)} className="p-2 text-gray-400 hover:text-blue-600 transition">
                                                    <FiEdit2 />
                                                </button>
                                                <button onClick={() => handleDelete(guru.id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">{editingGuru ? 'Edit Guru' : 'Add New Guru'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="guru@example.com"
                                        required={!editingGuru}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                                            placeholder={editingGuru ? "Leave blank to keep" : "••••••••"}
                                            required={!editingGuru}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (e.g. Vedic Astrologer)</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                                    <input
                                        type="text"
                                        name="languages"
                                        value={formData.languages}
                                        onChange={handleInputChange}
                                        placeholder="English, Hindi"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="rating"
                                        value={formData.rating ?? ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Path)</label>
                                <input
                                    type="text"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleInputChange}
                                    placeholder="/guru.jpg"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_free"
                                    checked={formData.is_free}
                                    onChange={handleInputChange}
                                    id="is_free"
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_free" className="text-sm font-medium text-gray-700">Free Consultation?</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                                    {editingGuru ? 'Update Guru' : 'Create Guru'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
