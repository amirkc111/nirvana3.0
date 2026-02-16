"use client";

import { useState } from 'react';
import { HiX, HiPhoneIncoming, HiCalendar, HiClock, HiCollection, HiChevronDown, HiBriefcase, HiHeart, HiShieldCheck, HiHome, HiSparkles } from 'react-icons/hi';

import { supabase } from '@/lib/supabaseClient';

export default function CallRequestModal({ isOpen, onClose, guru, user }) {
    const [topic, setTopic] = useState('');
    const [isTopicOpen, setIsTopicOpen] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('30min');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submissionError, setSubmissionError] = useState('');

    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const topics = [
        { id: 'career', label: 'Career & Business', icon: HiBriefcase },
        { id: 'marriage', label: 'Marriage & Relationships', icon: HiHeart },
        { id: 'health', label: 'Health & Wellbeing', icon: HiShieldCheck },
        { id: 'vaastu', label: 'Vaastu Consultation', icon: HiHome },
        { id: 'other', label: 'General Guidance', icon: HiSparkles }
    ];

    const selectedTopic = topics.find(t => t.id === topic);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        setSubmissionError('');

        try {
            // 0. Check for Booking Conflicts
            const proposedStart = timeToMinutes(time);
            const proposedEnd = proposedStart + (duration === '60min' ? 60 : 30);

            // Get all sessions for this guru
            const { data: guruSessions } = await supabase
                .from('chat_sessions')
                .select('id')
                .eq('guru_id', guru.id);

            if (guruSessions?.length > 0) {
                const sessionIds = guruSessions.map(s => s.id);

                // Get all call requests for this guru on this date
                const { data: existingBookings } = await supabase
                    .from('messages')
                    .select('metadata')
                    .eq('type', 'call_request')
                    .in('session_id', sessionIds)
                    .filter('metadata->>date', 'eq', date);

                if (existingBookings) {
                    for (const booking of existingBookings) {
                        const meta = booking.metadata;
                        const existingStart = timeToMinutes(meta.time);
                        const existingEnd = existingStart + (meta.duration === '60min' ? 60 : 30);

                        // Overlap check formula: (StartA < EndB) && (EndA > StartB)
                        if (proposedStart < existingEnd && proposedEnd > existingStart) {
                            setSubmissionError(`This time slot overlaps with an existing booking (${meta.time} for ${meta.duration === '60min' ? '1h' : '30m'}). Please choose another time.`);
                            setIsSubmitting(false);
                            return;
                        }
                    }
                }
            }

            // 1. Ensure/Find Chat Session
            let sessionId;
            const { data: existingSession, error: fetchError } = await supabase
                .from('chat_sessions')
                .select('id')
                .eq('user_id', user.id)
                .eq('guru_id', guru.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existingSession) {
                sessionId = existingSession.id;
            } else {
                const { data: newSession, error: sessionError } = await supabase
                    .from('chat_sessions')
                    .insert([{ user_id: user.id, guru_id: guru.id, last_message: 'New Call Request' }])
                    .select()
                    .single();

                if (sessionError) {
                    console.error('Session creation failed:', sessionError);
                    throw sessionError;
                }
                sessionId = newSession.id;
            }

            // 2. Save Call Request as a Special Message
            const { error: msgError } = await supabase
                .from('messages')
                .insert([{
                    session_id: sessionId,
                    sender_type: 'user',
                    content: `Call Request: ${selectedTopic?.label} on ${date} at ${time}`,
                    type: 'call_request',
                    metadata: {
                        topic: selectedTopic?.label,
                        date,
                        time,
                        duration
                    }
                }]);

            if (msgError) {
                console.error('Message insertion failed:', msgError);
                throw msgError;
            }

            // Update last_message in session
            await supabase
                .from('chat_sessions')
                .update({ last_message: '📞 New Call Request', updated_at: new Date().toISOString() })
                .eq('id', sessionId);

            // 4. Sync to Appointments Table for Admin visibility (via secure proxy)
            const appointmentDate = new Date(`${date}T${time}`);
            await fetch('/api/public/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    guru_id: guru.id,
                    client_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown Client',
                    email: user.email,
                    appointment_date: appointmentDate.toISOString(),
                    duration_minutes: duration === '60min' ? 60 : 30,
                    status: 'pending',
                    type: 'call_request',
                    notes: `Topic: ${selectedTopic?.label}`
                })
            });

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting call request full details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                error
            });
            setSubmissionError(error.message || 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSubmitted(false);
        onClose();
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
                <div className="relative w-full max-w-md bg-[#0f101a] border border-white/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)] p-8 text-center animate-in zoom-in-95 fade-in duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600" />

                    <div className="mb-6 relative inline-block">
                        <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40">
                            <HiPhoneIncoming className="w-10 h-10 text-white animate-bounce" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0f101a] flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Request Confirmed!</h2>
                    <p className="text-white/60 text-sm mb-8">
                        Namaste! {guru.name} has received your request and will contact you soon.
                    </p>

                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-8 text-left space-y-3">
                        <div className="flex items-center gap-3 text-xs">
                            <HiCollection className="text-purple-400 w-4 h-4" />
                            <span className="text-white/40 uppercase tracking-wider font-bold">Topic:</span>
                            <span className="text-white font-medium">{selectedTopic?.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <HiCalendar className="text-purple-400 w-4 h-4" />
                            <span className="text-white/40 uppercase tracking-wider font-bold">Date:</span>
                            <span className="text-white font-medium">{new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <HiClock className="text-purple-400 w-4 h-4" />
                            <span className="text-white/40 uppercase tracking-wider font-bold">Schedule:</span>
                            <span className="text-white font-medium">{time} ({duration === '60min' ? '1 Hour' : '30 Min'})</span>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all active:scale-95"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />


            <div className="relative w-full max-w-lg bg-[#0f101a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <HiPhoneIncoming className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Request Call</h2>
                            <p className="text-xs text-white/50">Schedule a consultation with {guru.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                                <HiCollection className="w-4 h-4 text-purple-400" />
                                Select Topic
                            </label>

                            <button
                                type="button"
                                onClick={() => setIsTopicOpen(!isTopicOpen)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left text-white flex items-center justify-between hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    {selectedTopic ? (
                                        <selectedTopic.icon className="w-5 h-5 text-purple-400" />
                                    ) : (
                                        <HiCollection className="w-5 h-5 text-white/20" />
                                    )}
                                    <span className={selectedTopic ? 'text-white' : 'text-white/40'}>
                                        {selectedTopic ? selectedTopic.label : 'Choose a subject...'}
                                    </span>
                                </div>
                                <HiChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isTopicOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isTopicOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b2b]/95 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-2">
                                    {topics.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => {
                                                setTopic(t.id);
                                                setIsTopicOpen(false);
                                            }}
                                            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-white/[0.08] text-white/80 hover:text-white transition-all border-b border-white/5 last:border-0"
                                        >
                                            <t.icon className={`w-5 h-5 ${topic === t.id ? 'text-purple-400' : 'text-white/40'}`} />
                                            <span className="text-sm font-semibold tracking-wide">{t.label}</span>
                                            {topic === t.id && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                <HiCalendar className="w-4 h-4 text-purple-400" />
                                Select Date
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {[...Array(7)].map((_, i) => {
                                    const d = new Date();
                                    d.setDate(new Date().getDate() + i);
                                    const dateString = d.toISOString().split('T')[0];
                                    const isSelected = date === dateString;

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setDate(dateString)}
                                            className={`shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all duration-300 ${isSelected
                                                ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-900/40 text-white'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                                                }`}
                                        >
                                            <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
                                                {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                            <span className="text-lg font-bold">
                                                {d.getDate()}
                                            </span>
                                            <span className="text-[10px] font-medium opacity-60">
                                                {d.toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                                    <HiClock className="w-4 h-4 text-purple-400" />
                                    Time Slot
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                                    <HiClock className="w-4 h-4 text-purple-400" />
                                    Duration
                                </label>
                                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setDuration('30min')}
                                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${duration === '30min'
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'text-white/40 hover:text-white/60'
                                            }`}
                                    >
                                        30 MIN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDuration('60min')}
                                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${duration === '60min'
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'text-white/40 hover:text-white/60'
                                            }`}
                                    >
                                        1 HOUR
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {submissionError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium animate-pulse">
                            {submissionError}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-purple-900/20 transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <HiPhoneIncoming className="w-5 h-5" />
                                    Confirm Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
