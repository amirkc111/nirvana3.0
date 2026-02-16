"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FiMessageSquare, FiSend, FiUser, FiClock, FiStar, FiCalendar, FiPhoneIncoming, FiLayers, FiChevronLeft } from 'react-icons/fi';
import { GiScrollUnfurled, GiLotus, GiCandleLight, GiStarShuriken } from 'react-icons/gi';

export default function GuruChatHub() {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const scrollRef = useRef(null);

    const fetchSessions = async (userId) => {
        try {
            const res = await fetch(`/api/guru/chats?userId=${userId}`);
            const result = await res.json();
            setSessions(result.sessions || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (sessId) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessId)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setCurrentUser(user);
                fetchSessions(user.id);
            }
        });
    }, []);

    useEffect(() => {
        if (activeSession) {
            fetchMessages(activeSession.id);
            const channel = supabase
                .channel(`guru_session:${activeSession.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `session_id=eq.${activeSession.id}`
                }, (payload) => {
                    setMessages(prev => {
                        if (prev.some(msg => msg.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [activeSession]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeSession) return;

        const tempMsg = {
            id: Date.now(),
            content: newMessage,
            sender_type: 'guru',
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    session_id: activeSession.id,
                    content: tempMsg.content,
                    sender_type: 'guru'
                }]);

            if (error) throw error;

            await supabase
                .from('chat_sessions')
                .update({ last_message: tempMsg.content, updated_at: new Date().toISOString() })
                .eq('id', activeSession.id);

        } catch (err) {
            console.error("Send failed:", err);
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        }
    };

    const selectSession = (session) => {
        setActiveSession(session);
        setMessages([]);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[600px]">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-14rem)] md:h-[750px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative">

            {/* Sidebar: Session List */}
            <div className={`
                ${activeSession ? 'hidden md:flex' : 'flex'} 
                w-full md:w-80 border-r border-gray-100 flex-col shrink-0 bg-gray-50/30
            `}>
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Conversations</h3>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Client Messaging</p>
                </div>
                <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
                    {sessions.length > 0 ? sessions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => selectSession(s)}
                            className={`w-full p-4 flex items-center gap-4 transition-all rounded-2xl group ${activeSession?.id === s.id
                                ? 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] ring-1 ring-blue-100/50'
                                : 'hover:bg-white/60'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 border transition-all duration-300 ${activeSession?.id === s.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20'
                                : 'bg-gray-100 text-gray-400 border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100'
                                }`}>
                                {s.user_name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <p className={`text-sm font-bold truncate tracking-tight ${activeSession?.id === s.id ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {s.user_name || 'Anonymous Seeker'}
                                    </p>
                                    <span className="text-[8px] font-bold text-gray-400 whitespace-nowrap uppercase tracking-widest pl-2">
                                        {new Date(s.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 truncate font-medium opacity-80 leading-none">
                                    {s.last_message || 'Waiting for guidance...'}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border transition-colors ${activeSession?.id === s.id
                                        ? 'text-blue-600 bg-blue-50 border-blue-100'
                                        : 'text-gray-400 bg-gray-50 border-gray-100 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100'
                                        }`}>
                                        {s.zodiac || 'SEEKER'}
                                    </span>
                                </div>
                            </div>
                        </button>
                    )) : (
                        <div className="p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                <FiMessageSquare className="text-gray-200" size={32} />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">No active communications</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main: Chat Window */}
            <div className={`
                ${activeSession ? 'flex' : 'hidden md:flex'} 
                flex-1 flex-col bg-white
            `}>
                {activeSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 px-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveSession(null)}
                                    className="md:hidden p-2.5 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition-all"
                                >
                                    <FiChevronLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-900/10 text-lg">
                                    {activeSession.user_name?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">{activeSession.user_name}</h4>
                                    <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                        Active Now
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                                    <FiUser size={18} />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100">
                                    <FiStar size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Message Feed */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/10 scrollbar-hide pb-24">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_type === 'guru';
                                const isCall = msg.type === 'call_request';
                                const isService = msg.type === 'service_request';

                                if (isCall) {
                                    const meta = msg.metadata || {};
                                    return (
                                        <div key={idx} className="flex justify-start">
                                            <div className="w-full max-w-[400px] bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                                                <div className="bg-blue-600 px-4 py-2 flex items-center gap-2 text-white">
                                                    <FiPhoneIncoming size={12} className="animate-bounce" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">Consultation Request</span>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                            <FiLayers size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Topic</p>
                                                            <p className="text-[11px] font-bold text-gray-900">{meta.topic || 'General'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                            <FiCalendar size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Schedule</p>
                                                            <p className="text-[11px] font-bold text-gray-900">{meta.date} at {meta.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (isService) {
                                    const meta = msg.metadata || {};
                                    const service = meta.service_name || 'Service';
                                    const getIcon = (name) => {
                                        switch (name) {
                                            case 'Naamkaran': return GiScrollUnfurled;
                                            case 'Shraddha': return GiLotus;
                                            case 'Puja': return GiCandleLight;
                                            default: return GiStarShuriken;
                                        }
                                    };
                                    const ServiceIcon = getIcon(service);
                                    return (
                                        <div key={idx} className="flex justify-start">
                                            <div className="w-full max-w-[400px] bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                                                <div className="bg-blue-600 px-4 py-2 flex items-center gap-2 text-white">
                                                    <ServiceIcon size={14} />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">Service Interest</span>
                                                </div>
                                                <div className="p-4 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm relative shrink-0">
                                                        <ServiceIcon size={24} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Service Item</p>
                                                        <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{service}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                                            ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-900/10'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}
                                        `}>
                                            <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                                            <span className={`text-[9px] block mt-1.5 ${isMe ? 'text-blue-100' : 'text-gray-400'} font-bold text-right uppercase`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Message Input Area */}
                        <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
                            <form
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-3xl border border-gray-100 shadow-inner focus-within:bg-white focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-300"
                            >
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write your professional response..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="group relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 shrink-0"
                                >
                                    <FiSend size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/10">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-blue-100 mb-6 border border-gray-100 shadow-sm">
                            <FiMessageSquare size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Message Hub</h3>
                        <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed font-semibold uppercase tracking-widest">
                            Select a client to view conversation history and begin messaging.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
