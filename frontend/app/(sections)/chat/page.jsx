"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HiChatAlt2, HiPhone } from 'react-icons/hi';
import { GiScrollUnfurled, GiLotus, GiCandleLight } from 'react-icons/gi';
import CallRequestModal from '@/components/CallRequestModal';
import GuruChatInterface from '@/components/GuruChatInterface';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabaseClient';

export default function GuruPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guru, setGuru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [successService, setSuccessService] = useState(null);
  const [systemError, setSystemError] = useState('');
  // const supabase = createClientComponentClient(); // Removed

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const { data, error } = await supabase
          .from('gurus')
          .select('*')
          .limit(1)
          .single();

        if (data) setGuru(data);
      } catch (error) {
        console.error('Error fetching guru:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuru();

    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleServiceRequest = async (serviceName) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setSystemError('');

    try {
      // 1. Ensure/Find Chat Session
      let sessionId;
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('guru_id', guru.id)
        .maybeSingle();

      if (existingSession) {
        sessionId = existingSession.id;
      } else {
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert([{ user_id: user.id, guru_id: guru.id, last_message: `Interested in ${serviceName}` }])
          .select()
          .single();
        if (sessionError) throw sessionError;
        sessionId = newSession.id;
      }

      // 2. Save Service Request as a Special Message
      const { error: msgError } = await supabase
        .from('messages')
        .insert([{
          session_id: sessionId,
          sender_type: 'user',
          content: `Service Request: ${serviceName}`,
          type: 'service_request',
          metadata: {
            service_name: serviceName
          }
        }]);

      if (msgError) throw msgError;

      // Update last_message in session
      await supabase
        .from('chat_sessions')
        .update({
          last_message: `✨ Requested ${serviceName}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // 3. Sync to Appointments Table for Admin visibility (via secure proxy)
      await fetch('/api/public/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          client_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown Client',
          email: user.email,
          appointment_date: new Date().toISOString(),
          duration_minutes: 0,
          status: 'pending',
          type: 'service_request',
          notes: `Requested: ${serviceName}`
        })
      });

      setSuccessService(serviceName);
      // Auto-hide after 3 seconds
      setTimeout(() => setSuccessService(null), 4000);
    } catch (error) {
      console.error('Error submitting service request:', error);
      setSystemError(error.message || 'Failed to submit request. Please try again.');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white font-mono animate-pulse">Connecting to Cosmos...</div>;

  if (!guru) {
    return (
      <main className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
        <div className="text-white/50 text-center">
          <HiChatAlt2 className="text-4xl mx-auto mb-4 opacity-20" />
          <p>No Gurus are currently available.</p>
          <p className="text-xs mt-2">Please check back later or contact support.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
      <div className="flex flex-col gap-6 w-full max-w-[22rem] sm:max-w-md">
        {/* Card Container - Dark System Style */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-3 sm:gap-4 relative overflow-hidden">

          {/* Left: Avatar */}
          <div className="shrink-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Image
                src={guru.image_url || "/guru.jpg"}
                alt={guru.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* Row 1: Name */}
            <div className="flex justify-between items-start gap-2">
              <h1 className="font-bold text-white text-lg leading-tight truncate">
                {guru.name}
              </h1>
            </div>

            {/* Row 2: Title */}
            <p className="text-sm text-purple-200/80 font-medium truncate">
              {guru.title}
            </p>

            {/* Row 3: Languages */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-white/50 truncate">
                {guru.languages || "English, Hindi, Nepali"}
              </p>
            </div>

            {/* Row 4: Action Buttons (System Colors) */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-purple-900/20 flex items-center justify-center border border-white/10"
              >
                RequestCall
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    router.push(`/chat/${guru.id}`);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-pink-900/20 flex items-center justify-center border border-white/10"
              >
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-white/90 font-medium text-sm mb-4 text-center tracking-wide uppercase">Remember us for these services</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Naamkaran', icon: GiScrollUnfurled },
              { name: 'Shraddha', icon: GiLotus },
              { name: 'Puja', icon: GiCandleLight }
            ].map((service) => (
              <button
                key={service.name}
                onClick={() => handleServiceRequest(service.name)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all active:scale-95 group"
              >
                <service.icon className="text-2xl text-purple-300 group-hover:text-purple-200 transition-colors" />
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-tighter">{service.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <CallRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guru={guru}
        user={user}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Custom Success Notification */}
      {successService && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0f101a] border border-white/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Request Recorded!</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Namaste! Your interest in <span className="text-purple-400 font-bold uppercase">{successService}</span> has been shared with {guru.name}.
            </p>
            <button
              onClick={() => setSuccessService(null)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-sm font-bold transition-all active:scale-95"
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}

      {/* Custom Error Notification */}
      {systemError && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0f101a] border border-red-500/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Oops!</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              {systemError}
            </p>
            <button
              onClick={() => setSystemError('')}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold transition-all active:scale-95"
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
