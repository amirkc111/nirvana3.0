"use client";

import { useState, useRef, useEffect } from 'react';
import { HiX, HiPaperAirplane, HiDotsVertical, HiArrowLeft } from 'react-icons/hi';
import Image from 'next/image';

export default function GuruChatInterface({ guru, onClose }) {
    const [messages, setMessages] = useState([
        { id: 1, text: `Namaste. I am ${guru.name}. How may I guide you on your journey today?`, isGuru: true, timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: input,
            isGuru: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate Guru response for demo (Actual implementation would connect to a backend)
        setTimeout(() => {
            const guruMsg = {
                id: Date.now() + 1,
                text: "I have received your message. I am currently reviewing your cosmic alignments and will respond shortly with divine guidance.",
                isGuru: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, guruMsg]);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[120] bg-[#030014] flex flex-col sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[400px] sm:h-[600px] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">

            {/* Header */}
            <div className="bg-white/[0.03] backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="sm:hidden p-2 text-white/60">
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-500/30">
                        <Image src={guru.image} alt={guru.name} fill className="object-cover" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide uppercase">{guru.name}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Divine Presence</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="hidden sm:block p-2 text-white/40 hover:text-white transition-colors">
                    <HiX className="w-5 h-5" />
                </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/stars.png')] bg-fixed">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isGuru ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.isGuru
                                ? 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                                : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20 px-5'
                            }`}>
                            {msg.text}
                            <div className={`mt-2 text-[9px] font-medium tracking-widest ${msg.isGuru ? 'text-white/30' : 'text-white/60'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-white/[0.03] border-t border-white/10">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Share your concerns..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-3 bg-white text-black rounded-2xl hover:bg-purple-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <HiPaperAirplane className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
