'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabaseClient';
import DynamicKundliChart from './DynamicKundliChart';

// Helper to parse content for Chart Data
const parseContentForChart = (text) => {
  const chartStartTag = ":::CHART_DATA_START:::";
  const chartEndTag = ":::CHART_DATA_END:::";

  if (text && text.includes(chartStartTag) && text.includes(chartEndTag)) {
    try {
      const startIndex = text.indexOf(chartStartTag);
      const endIndex = text.indexOf(chartEndTag);
      const jsonStr = text.substring(startIndex + chartStartTag.length, endIndex).trim();
      const chartData = JSON.parse(jsonStr);

      // Clean text
      const cleanText = (text.substring(0, startIndex) + text.substring(endIndex + chartEndTag.length)).trim();
      return { text: cleanText, chartData };
    } catch (e) {
      console.error("Error parsing stored chart data", e);
    }
  }
  return { text, chartData: null };
};

export default function EnhancedChatWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [kundliData, setKundliData] = useState(null);
  const [hasKundli, setHasKundli] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // New state for UI display
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Chat History on Mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Update UI State
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
          setCurrentUser({ name, id: user.id });
        } else {
          setCurrentUser(null);
        }

        if (user) {
          const { data: history, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (history && history.length > 0) {
            const formattedMessages = history.map(msg => {
              const { text, chartData } = parseContentForChart(msg.content);
              return {
                id: msg.id,
                text: text,
                isBot: msg.role === 'assistant',
                timestamp: new Date(msg.created_at),
                chartData: chartData,
                // Handle file metadata if present
                attachment: msg.metadata?.attachment
              };
            });
            setMessages(formattedMessages);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadHistory();
  }, []);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // remove data:image/...;base64,
      reader.onerror = error => reject(error);
    });
  };

  // --- Custom Upload Trigger for Quick Actions ---
  const triggerSpecificUpload = (type) => {
    if (type === 'kundli') {
      setInputMessage(t('analyzeKundliAction'));
    } else if (type === 'palm') {
      setInputMessage(t('palmistryAction'));
    }
    // Trigger file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageText = typeof customMessage === 'string' ? customMessage : inputMessage;
    // Allow empty text if file is present
    if (!messageText.trim() && !selectedFile) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      // If file is image, we can show preview (simplified for now, just text)
      imageObj: selectedFile && selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : null,
      fileName: selectedFile ? selectedFile.name : null,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Prepare payload
    let currentInput = messageText;
    let filePayload = null;
    let fileType = null;

    if (selectedFile) {
      try {
        const base64Data = await convertFileToBase64(selectedFile);
        filePayload = base64Data;
        fileType = selectedFile.type;
      } catch (err) {
        console.error("File conversion error", err);
      }
    }

    // Clear input
    if (!customMessage) {
      setInputMessage('');
      setSelectedFile(null);
    }
    setIsTyping(true);

    try {
      // Get fresh session directly (bypassing potentially broken /api/auth/me)
      const { data: { session } } = await supabase.auth.getSession();
      const userDataFromSession = session?.user ? {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata
      } : null;

      // Get saved kundli data if logged in
      let savedKundliData = [];
      if (session?.user) {
        try {
          const kRes = await fetch(`/api/user/kundli-data?userId=${session.user.id}`);
          if (kRes.ok) savedKundliData = await kRes.json();
        } catch (e) { console.error("Kundli fetch error", e); }
      }

      const userDataPayload = {
        user: userDataFromSession,
        savedKundliData: savedKundliData,
        isAuthenticated: !!session?.user
      };

      // Use the enhanced chat-kundli API with proper format
      const response = await fetch('/api/chat-kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass token in header for standard practice, but also in body for easy backend access without middleware parsing
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({
          userQuestion: currentInput,
          fileData: filePayload,
          mimeType: fileType,
          userData: userDataPayload,
          accessToken: session?.access_token, // <--- DIRECT TOKEN
          kundliData: kundliData,
          relevantContent: {},
          searchResults: {},
          pageContent: document.body?.innerText?.substring(0, 10000) || '',
          searchCapabilities: {
            canSearch: true,
            canFilter: true,
            canReference: true,
            totalMatches: 0,
            relevantSections: 0
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Create a placeholder message for the bot
      const botMessageId = Date.now() + 1;
      const initialBotResponse = {
        id: botMessageId,
        text: '',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, initialBotResponse]);
      setIsTyping(false); // Stop typing indicator as we start streaming

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedTime = 0;
      let fullResponseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        accumulatedTime += 50;

        // Accumulate full response for parsing
        fullResponseBuffer += textChunk;

        // Check for hidden Chart Data Block
        let displayContent = fullResponseBuffer;
        let extractedChartData = null;

        const chartStartTag = ":::CHART_DATA_START:::";
        const chartEndTag = ":::CHART_DATA_END:::";

        if (fullResponseBuffer.includes(chartStartTag) && fullResponseBuffer.includes(chartEndTag)) {
          const startIndex = fullResponseBuffer.indexOf(chartStartTag);
          const endIndex = fullResponseBuffer.indexOf(chartEndTag);

          // Extract JSON
          const jsonString = fullResponseBuffer.substring(startIndex + chartStartTag.length, endIndex).trim();
          try {
            extractedChartData = JSON.parse(jsonString);
          } catch (e) {
            console.error("Failed to parse chart data JSON", e);
          }

          // Remove block from display text
          const before = fullResponseBuffer.substring(0, startIndex);
          const after = fullResponseBuffer.substring(endIndex + chartEndTag.length);
          displayContent = before + after;
        }

        // Add character delays for "typing" effect on the display content
        for (let char of textChunk) {
          // Note: This logic is simplified; real typing effect needs diffing logic or just simple append for now.
          // Given the complexity of replacing large chunks, we'll just streamline the state update:
        }

        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          lastMsg.text = displayContent; // Update with cleaned content
          if (extractedChartData) {
            lastMsg.chartData = extractedChartData; // Attach data to message
          }
          return newMsgs;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const fallbackResponse = {
        id: Date.now() + 1,
        text: "I'm unable to connect to the AI server right now. Please ensure the backend is running.",
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKundliUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setKundliData(data);
          setHasKundli(true);

          // Add a message about Kundli upload
          const kundliMessage = {
            id: Date.now(),
            text: "📊 Kundli data uploaded! I can now provide personalized astrological insights based on your birth chart.",
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, kundliMessage]);
        } catch (error) {
          console.error('Error parsing Kundli file:', error);
          alert('Invalid Kundli file format. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Optional: You could auto-send or just show it as selected
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop logic
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false); // Track if a drag occurred to prevent click
  const windowSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    // Load saved position
    const savedPos = localStorage.getItem('chatWidgetPosition');
    if (savedPos) {
      try {
        const { x, y } = JSON.parse(savedPos);
        setPosition({ x, y });
      } catch (e) {
        console.error('Failed to parse chat position', e);
      }
    }

    windowSize.current = { width: window.innerWidth, height: window.innerHeight };
    const handleResize = () => {
      windowSize.current = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    // For the header, we rely on stopPropagation in the close button.
    // For the floating logo, we also want to drag it.

    // If clicking an input in the chat window, don't drag.
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    setIsDragging(true);
    hasDragged.current = false;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleTouchStart = (e) => {
    // Prevent dragging if touching interactive elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // CRITICAL: Prevent scrolling to enable reliable drag
    // This stops 'click' from firing, so we must handle taps manually in touchend
    // if (e.cancelable && !e.target.closest('button.close-btn')) {
    //   e.preventDefault();
    // }

    setIsDragging(true);
    hasDragged.current = false;
    const touch = e.touches[0];
    dragStartPos.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;

      // Calculate distance to determine if it was a drag or just a sloppy click
      const dist = Math.sqrt(Math.pow(e.clientX - (dragStartPos.current.x + position.x), 2) + Math.pow(e.clientY - (dragStartPos.current.y + position.y), 2));
      if (dist > 3) {
        hasDragged.current = true;
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position to localStorage
      if (isDragging) {
        localStorage.setItem('chatWidgetPosition', JSON.stringify(position));
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      // preventative default only if we are definitely dragging to stop scroll
      e.preventDefault();

      const touch = e.touches[0];
      const newX = touch.clientX - dragStartPos.current.x;
      const newY = touch.clientY - dragStartPos.current.y;

      const dist = Math.sqrt(Math.pow(touch.clientX - (dragStartPos.current.x + position.x), 2) + Math.pow(touch.clientY - (dragStartPos.current.y + position.y), 2));
      if (dist > 3) {
        hasDragged.current = true;
      }
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = (e) => {
      setIsDragging(false);
      if (isDragging) {
        localStorage.setItem('chatWidgetPosition', JSON.stringify(position));
      }
      // Clean up touch event listeners
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, position]);

  const toggleOpen = () => {
    if (!hasDragged.current) {
      setIsOpen(!isOpen);
    }
  };

  // Calculate safe position for the entire widget (Window + Button)
  const getSafePosition = () => {
    let xOffset = position.x;
    let yOffset = position.y;

    if (typeof window !== 'undefined' && isOpen) {
      // Only restrain when OPEN, otherwise button is free
      const rightEdge = 24;
      const bottomEdge = 96;
      const width = 320;
      const height = 450;

      // --- Horizontal Checks ---
      const currentLeft = window.innerWidth - rightEdge - width + position.x;

      if (currentLeft < 20) {
        xOffset += (20 - currentLeft);
      } else {
        const currentRight = window.innerWidth - rightEdge + position.x;
        if (currentRight > window.innerWidth - 10) {
          xOffset -= (currentRight - (window.innerWidth - 10));
        }
      }

      // --- Vertical Checks ---
      const currentTop = window.innerHeight - bottomEdge - height + position.y;

      if (currentTop < 20) {
        yOffset += (20 - currentTop);
      } else {
        const currentBottom = window.innerHeight - bottomEdge + position.y;
        if (currentBottom > window.innerHeight - 10) {
          yOffset -= (currentBottom - (window.innerHeight - 10));
        }
      }
    }
    return { x: xOffset, y: yOffset };
  };

  const safePosition = getSafePosition();

  return (
    <>


      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-[90] flex flex-col bg-[#1a1b2e]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          style={{
            width: '320px',
            height: '450px',
            bottom: '96px',
            right: '24px',
            transform: `translate(${safePosition.x}px, ${safePosition.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Header - Draggable Area */}
          <div
            className="bg-white/5 border-b border-white/10 text-white p-4 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="flex items-center space-x-3 pointer-events-none">

              <div>
                <h3 className="font-bold">Nirvana <span className="text-xs font-normal opacity-75">({currentUser ? currentUser.name : t('guest')})</span></h3>
                <p className="text-xs opacity-90">{t('online')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 close-chat-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => { e.stopPropagation(); setIsOpen(false); }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Actions - Only show if no messages or just welcome message */}
            {messages.length === 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => handleSendMessage(t('createKundliAction'))} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white font-medium transition-colors text-left flex items-center gap-2">
                  <span>📊</span> {t('createKundli')}
                </button>
                <button onClick={() => handleSendMessage(t('vedicAstrologyAction'))} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white font-medium transition-colors text-left flex items-center gap-2">
                  <span>🔮</span> {t('vedicAstrology')}
                </button>
                <button onClick={() => triggerSpecificUpload("kundli")} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white font-medium transition-colors text-left flex items-center gap-2">
                  <span>👁️</span> {t('readKundli')}
                </button>
                <button onClick={() => triggerSpecificUpload("palm")} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white font-medium transition-colors text-left flex items-center gap-2">
                  <span>✋</span> {t('palmistry')}
                </button>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`relative max-w-[85%] px-5 py-3 rounded-2xl shadow-md backdrop-blur-md border ${message.isBot
                    ? 'bg-slate-900/80 text-gray-100 rounded-tl-sm border-white/10'
                    : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm border-white/10 shadow-indigo-500/20'
                    }`}
                >
                  <p className="text-xs leading-5 font-normal break-words tracking-wide decoration-clone">{message.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <span className={`text-[10px] font-medium ${message.isBot ? 'text-gray-400' : 'text-indigo-200'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Render Visual Charts (Lagna & Navamsa) if Data Exists */}
                  {message.chartData && (
                    <>
                      <div className="mt-6 flex flex-col gap-6 w-full items-center">
                        {/* Lagna Chart */}
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center w-full max-w-[350px]">
                          <h3 className="text-xs font-bold text-amber-200 mb-3 uppercase tracking-wider border-b border-white/10 pb-2 w-full text-center">Lagna / Birth Chart</h3>
                          <DynamicKundliChart chartData={message.chartData} variant="D1" />
                        </div>

                        {/* Navamsa Chart */}
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center w-full max-w-[350px]">
                          <h3 className="text-xs font-bold text-amber-200 mb-3 uppercase tracking-wider border-b border-white/10 pb-2 w-full text-center">Navamsa (D9) Chart</h3>
                          <DynamicKundliChart chartData={message.chartData} variant="D9" />
                        </div>
                      </div>

                      {/* Calculation Method Disclaimer */}
                      <p className="text-[10px] text-gray-400 mt-4 text-center italic w-full max-w-[90%] mx-auto opacity-70">
                        “Planetary positions are calculated geocentrically; Ascendant and house cusps are location-dependent, following standard Vedic astrology practice.”
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white p-3.5 rounded-2xl rounded-tl-none border border-white/5">
                  <div className="flex space-x-1.5 items-center h-5">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>



          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            {selectedFile && (
              <div className="mb-2 px-3 py-1.5 bg-white/10 rounded-lg flex items-center justify-between text-xs text-white/80">
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="hover:text-white">✕</button>
              </div>
            )}
            <div className="flex space-x-2 items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf,.txt,.doc,.docx"
              />
              <button
                onClick={triggerFileUpload}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xl"
              >
                +
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('askAboutStars')}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm text-white placeholder-white/50 transition-all"
                onMouseDown={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div >
      )
      }

      {/* Chat Button */}
      <div
        className="fixed bottom-6 right-6 z-[100] cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${safePosition.x}px, ${safePosition.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <button
          onClick={toggleOpen}
          className="w-16 h-16 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/50 pointer-events-auto toggle-chat-btn"
        >
          <Image
            src="/an.png"
            alt="Chat with Nirvana Astro"
            width={64}
            height={64}
            className="w-full h-full object-contain drop-shadow-md pointer-events-none"
          />
        </button>
      </div>
    </>
  );
}
