"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { HiArrowLeft, HiPaperAirplane, HiDotsVertical, HiPhoneIncoming, HiCalendar, HiClock, HiCollection } from 'react-icons/hi';
import { GiScrollUnfurled, GiLotus, GiCandleLight, GiStarShuriken } from 'react-icons/gi';
import { supabase } from '@/lib/supabaseClient';
import AuthModal from '@/components/AuthModal';

export default function ChatScreen() {
    const { guruId } = useParams();
    const router = useRouter();
    const scrollRef = useRef(null);

    const [guru, setGuru] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [systemError, setSystemError] = useState('');

    useEffect(() => {
        if (!guruId) return;
        fetchGuruAndSession();
    }, [guruId]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Real-time Subscription
    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase
            .channel(`session:${sessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `session_id=eq.${sessionId}`
            }, (payload) => {
                setMessages(prev => {
                    // Prevent duplicates from optimistic updates
                    if (prev.some(msg => msg.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchGuruAndSession = async () => {
        try {
            // 1. Fetch Guru Details
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guruId);

            if (!isUUID) {
                setLoading(false);
                return;
            }

            const { data: guruData, error: guruError } = await supabase
                .from('gurus')
                .select('*')
                .eq('id', guruId)
                .single();

            if (guruError) {
                console.error("Guru not found in DB:", guruError);
                setGuru(null);
            } else {
                setGuru(guruData);
            }

            // 2. Fetch or Create Chat Session
            // Retrieve current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log("User not logged in, skipping session fetch");
                return;
            }

            const { data: sessionData, error: sessionError } = await supabase
                .from('chat_sessions')
                .select('id')
                .eq('guru_id', guruId)
                .eq('user_id', user.id) // Specific to user
                .maybeSingle();

            if (sessionData) {
                setSessionId(sessionData.id);
                fetchMessages(sessionData.id);
            }

        } catch (error) {
            console.error("Error loading chat:", error);
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Check for UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guruId);
        if (!isUUID) {
            setSystemError("This chat session is not linked to a valid Guru.");
            return;
        }

        // Optimistic Update
        const tempMsg = {
            id: Date.now(),
            content: newMessage,
            sender_type: 'user',
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        try {
            let currentSessionId = sessionId;

            // Create session if first message
            if (!currentSessionId) {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsAuthModalOpen(true);
                    setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
                    return;
                }

                const userId = user.id;

                const { data: newSession, error: createError } = await supabase
                    .from('chat_sessions')
                    .insert([{ guru_id: guruId, user_id: userId, last_message: tempMsg.content }])
                    .select()
                    .single();

                if (createError) {
                    console.error("Session create error full:", createError);
                    setSystemError(`Failed to start session: ${createError.message}`);
                    setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
                    return;
                }
                currentSessionId = newSession.id;
                setSessionId(currentSessionId);
            }

            // Send Message to DB
            const { error: sendError } = await supabase
                .from('messages')
                .insert([{
                    session_id: currentSessionId,
                    content: tempMsg.content,
                    sender_type: 'user'
                }]);

            if (sendError) throw sendError;

        } catch (err) {
            console.error("Send failed:", err);
            setSystemError("Failed to send: " + (err.message || "Unknown error"));
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        }
    };

    if (loading) return <div className="h-screen bg-[#030014] text-white flex items-center justify-center">Loading Cosmos...</div>;
    if (!guru) return <div className="h-screen bg-[#030014] text-white flex items-center justify-center">Guru not found</div>;

    return (
        <main className="h-screen bg-[#030014] flex flex-col font-sans">

            {/* Header */}
            <header className="shrink-0 h-16 bg-white/[0.05] backdrop-blur-xl border-b border-white/10 flex items-center px-4 gap-3 sticky top-0 z-50">
                <button onClick={() => router.back()} className="text-white/70 hover:text-white transition">
                    <HiArrowLeft className="text-xl" />
                </button>

                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                    <Image src={guru.image_url || "/guru.jpg"} alt={guru.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-white font-bold text-sm truncate">{guru.name}</h1>
                    <p className="text-purple-300 text-xs truncate">Online</p>
                </div>

                <button className="text-white/70 hover:text-white">
                    <HiDotsVertical className="text-xl" />
                </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="text-center text-white/30 text-xs mt-10">
                        Start your conversation with {guru.name}...
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_type === 'user';
                        const isCallRequest = msg.type === 'call_request';

                        if (isCallRequest) {
                            const meta = msg.metadata || {};
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] sm:max-w-[70%] bg-white/[0.03] backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden shadow-xl
                                        ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}
                                    `}>
                                        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 px-4 py-3 border-b border-white/10 flex items-center gap-3">
                                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                                <HiPhoneIncoming className="text-purple-400 w-4 h-4" />
                                            </div>
                                            <span className="text-white font-bold text-xs uppercase tracking-wider">Call Request</span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                    <HiCollection className="text-purple-400 w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Topic</p>
                                                    <p className="text-white text-xs font-medium truncate">{meta.topic || 'General Guidance'}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                        <HiCalendar className="text-purple-400 w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Date</p>
                                                        <p className="text-white text-xs font-medium">{meta.date ? new Date(meta.date).toLocaleDateString() : 'TBD'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                        <HiClock className="text-purple-400 w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Time</p>
                                                        <p className="text-white text-xs font-medium">{meta.time || '--:--'} ({meta.duration === '60min' ? '1h' : '30m'})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 flex justify-between items-center">
                                            <span className="text-[9px] text-white/30 uppercase font-bold">Scheduled</span>
                                            <span className="text-[10px] text-white/50">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (msg.type === 'service_request') {
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
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] sm:max-w-[70%] bg-white/[0.03] backdrop-blur-xl border border-pink-500/30 rounded-2xl overflow-hidden shadow-xl
                                        ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}
                                    `}>
                                        <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 px-4 py-3 border-b border-white/10 flex items-center gap-3">
                                            <div className="p-1.5 bg-pink-500/20 rounded-lg">
                                                <ServiceIcon className="text-pink-400 w-4 h-4" />
                                            </div>
                                            <span className="text-white font-bold text-xs uppercase tracking-wider">Service Request</span>
                                        </div>
                                        <div className="p-4 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <ServiceIcon className="text-pink-400 text-2xl" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-0.5">Special Service</p>
                                                <h3 className="text-white font-bold text-lg leading-none">{service}</h3>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 flex justify-between items-center text-[9px] text-white/30 uppercase font-bold">
                                            <span>Interest Recorded</span>
                                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                    max-w-[75%] px-4 py-2 rounded-2xl text-sm relative
                    ${isMe
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white/10 text-white/90 backdrop-blur-sm rounded-tl-none border border-white/5'}
                 `}>
                                    {msg.content}
                                    <span className="text-[10px] opacity-50 block text-right mt-1 w-full">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <footer className="shrink-0 p-4 bg-[#030014]/80 backdrop-blur-xl border-t border-white/10 sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-11 h-11 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                    >
                        <HiPaperAirplane className="rotate-90 ml-1" />
                    </button>
                </form>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Custom Error Notification */}
            {systemError && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0f101a] border border-red-500/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Notice</h3>
                        <p className="text-white/60 text-sm mb-6 leading-relaxed">
                            {systemError}
                        </p>
                        <button
                            onClick={() => setSystemError('')}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold transition-all active:scale-95"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
