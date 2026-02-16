"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function GuruLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Redirect if already logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.push('/guru');
        });
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            router.push('/guru');
            router.refresh();
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-700">
            {/* Background Blobs for Atmosphere */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-50/40 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-50/30 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-[440px] w-full bg-white p-10 md:p-14 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center relative overflow-hidden group">
                {/* Subtle top accent bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>

                {/* Logo Section */}
                <div className="mb-8 relative w-24 h-24 p-4 bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-gray-50 group-hover:scale-105 transition-transform duration-500">
                    <Image
                        src="/an.png"
                        alt="Nirvana Logo"
                        fill
                        className="object-contain p-4"
                        priority
                    />
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                        Guru Portal
                    </h2>
                    <p className="text-[11px] text-blue-600/80 font-extrabold uppercase tracking-[0.25em] pl-1">
                        Professional Workspace Access
                    </p>
                </div>

                <form className="w-full space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiMail className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-600 transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                suppressHydrationWarning
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-semibold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>

                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiLock className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-600 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                suppressHydrationWarning
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-semibold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <button type="button" className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">
                            Forgot Password?
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-500 text-[11px] text-center bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-100 font-bold uppercase tracking-wider animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center items-center py-4.5 px-6 border border-transparent text-sm font-black rounded-2xl text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-[0_15px_40px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-95 ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-[0_20px_50px_rgba(37,99,235,0.35)] hover:-translate-y-1'}`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="flex items-center gap-3 uppercase tracking-[0.15em] py-0.5">
                                    Sign In <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="absolute bottom-8 text-center">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.3em] opacity-60">
                    &copy; {new Date().getFullYear()} Nirvana 3.0 Operations Hub
                </p>
                <div className="flex gap-4 justify-center mt-3 opacity-40">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
