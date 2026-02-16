'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';

const VoiceEnabledChatWidget = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Chat states
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedKundliData, setSavedKundliData] = useState([]);

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize voice capabilities
  useEffect(() => {
    initializeVoiceCapabilities();
  }, []);

  // Authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const initializeVoiceCapabilities = () => {
    // Check for Speech Recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionInstance.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
        if (transcript.trim()) {
          handleVoiceInput(transcript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Check for Speech Synthesis support
    if ('speechSynthesis' in window) {
      const synthesisInstance = window.speechSynthesis;
      setSynthesis(synthesisInstance);

      const loadVoices = () => {
        const availableVoices = synthesisInstance.getVoices();
        setVoices(availableVoices);

        const preferredVoice = availableVoices.find(voice =>
          voice.lang.startsWith('en') &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha'))
        ) || availableVoices[0];

        setSelectedVoice(preferredVoice);
      };

      if (synthesisInstance.getVoices().length > 0) {
        loadVoices();
      } else {
        synthesisInstance.onvoiceschanged = loadVoices;
      }
    }

    setVoiceEnabled(true);
  };

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        await fetchUserKundliData(user.id);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('Auth check failed:', error.message);
      setIsAuthenticated(false);
    }
  };

  const fetchUserKundliData = async (userId) => {
    try {
      const response = await fetch('/api/user/kundli-data');
      if (response.ok) {
        const data = await response.json();
        setSavedKundliData(data);
      }
    } catch (error) {
      console.log('Failed to fetch Kundli data:', error);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleVoiceInput = async (inputText) => {
    setInputMessage(inputText);
    await sendMessage(inputText);
  };

  const speakResponse = (text) => {
    if (synthesis && selectedVoice) {
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        console.log('🔊 Speaking started');
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        console.log('🔊 Speaking ended');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('🔊 Speaking error:', event.error);
        setIsSpeaking(false);
      };

      synthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Add user message
    const userMessage = { type: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const userData = {
        user: user,
        isAuthenticated: isAuthenticated,
        savedKundliData: savedKundliData
      };

      const response = await fetch('/api/chat-kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuestion: message,
          userData: userData,
          kundliData: savedKundliData,
          relevantContent: '',
          searchResults: '',
          pageContent: '',
          searchCapabilities: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.response;

        // Add AI response
        const aiMessage = { type: 'ai', content: aiResponse, timestamp: new Date() };
        setMessages(prev => [...prev, aiMessage]);

        // Speak the response
        speakResponse(aiResponse);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { type: 'ai', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice control shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && event.ctrlKey) {
        event.preventDefault();
        if (isListening) {
          stopListening();
        } else if (isSpeaking) {
          stopSpeaking();
        } else {
          startListening();
        }
      }
      if (event.code === 'Escape') {
        stopSpeaking();
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isListening, isSpeaking]);

  return (
    <div className="voice-enabled-chat-widget" ref={chatContainerRef}>
      {/* Header */}
      <div className="chat-header">
        <h3>🤖 AI Astrologer</h3>
        <div className="voice-status">
          {isListening && <span className="listening">🎤 Listening...</span>}
          {isSpeaking && <span className="speaking">🔊 Speaking...</span>}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>👋 Welcome! I'm your AI Astrologer with voice capabilities.</p>
            <p>🎤 Click the microphone or press Ctrl+Space to start voice chat</p>
            <p>🔊 I can speak responses back to you</p>
            <p>📚 I have knowledge of Sanskrit, Vedic astrology, and much more!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice..."
            rows="2"
            disabled={isLoading}
          />
          <div className="input-buttons">
            <button
              className={`voice-button ${isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}`}
              onClick={isListening ? stopListening : isSpeaking ? stopSpeaking : startListening}
              disabled={!voiceEnabled}
              title={isListening ? 'Stop Listening' : isSpeaking ? 'Stop Speaking' : 'Start Voice Input'}
            >
              {isListening ? '⏹️' : isSpeaking ? '⏹️' : '🎤'}
            </button>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="send-button"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="voice-controls">
          <div className="voice-info">
            <small>🎤 Ctrl+Space: Voice | 🔊 Auto-speak responses | ⏹️ Escape: Stop</small>
          </div>
          {voiceEnabled && (
            <div className="voice-settings">
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice);
                }}
                className="voice-select"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .voice-enabled-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          height: 600px;
          background: ${theme === 'dark' ? '#1a1a2e' : '#ffffff'};
          border: 2px solid ${theme === 'dark' ? '#16213e' : '#e0e0e0'};
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .chat-header {
          padding: 15px 20px;
          border-bottom: 1px solid ${theme === 'dark' ? '#16213e' : '#e0e0e0'};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-header h3 {
          margin: 0;
          color: ${theme === 'dark' ? '#ffffff' : '#333'};
          font-size: 18px;
        }
        
        .voice-status {
          display: flex;
          gap: 10px;
        }
        
        .listening {
          color: #ff6b6b;
          font-weight: bold;
          animation: pulse 1.5s infinite;
        }
        
        .speaking {
          color: #4ecdc4;
          font-weight: bold;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .welcome-message {
          text-align: center;
          color: ${theme === 'dark' ? '#e0e0e0' : '#666'};
          line-height: 1.6;
        }
        
        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        
        .message.user {
          align-self: flex-end;
        }
        
        .message.ai {
          align-self: flex-start;
        }
        
        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.4;
        }
        
        .message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .message.ai .message-content {
          background: ${theme === 'dark' ? '#16213e' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333'};
          border: 1px solid ${theme === 'dark' ? '#16213e' : '#e0e0e0'};
        }
        
        .message-time {
          font-size: 11px;
          color: ${theme === 'dark' ? '#a0a0a0' : '#999'};
          margin-top: 5px;
          text-align: right;
        }
        
        .message.ai .message-time {
          text-align: left;
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#4ecdc4' : '#667eea'};
          animation: typing 1.4s infinite;
        }
        
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        .input-area {
          padding: 20px;
          border-top: 1px solid ${theme === 'dark' ? '#16213e' : '#e0e0e0'};
        }
        
        .input-container {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        
        .input-container textarea {
          flex: 1;
          padding: 12px;
          border: 1px solid ${theme === 'dark' ? '#16213e' : '#e0e0e0'};
          border-radius: 10px;
          background: ${theme === 'dark' ? '#16213e' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333'};
          resize: none;
          font-family: inherit;
          font-size: 14px;
        }
        
        .input-container textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .input-buttons {
          display: flex;
          gap: 8px;
        }
        
        .voice-button, .send-button {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .voice-button {
          background: ${isListening ? '#ff6b6b' : isSpeaking ? '#4ecdc4' : '#667eea'};
          color: white;
        }
        
        .voice-button:hover {
          transform: scale(1.1);
        }
        
        .send-button {
          background: #667eea;
          color: white;
        }
        
        .send-button:hover:not(:disabled) {
          background: #5a6fd8;
          transform: scale(1.1);
        }
        
        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .voice-controls {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .voice-info {
          color: ${theme === 'dark' ? '#a0a0a0' : '#666'};
        }
        
        .voice-settings {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .voice-select {
          background: ${theme === 'dark' ? '#16213e' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333'};
          border: 1px solid ${theme === 'dark' ? '#16213e' : '#e0e0e0'};
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 12px;
        }
        
        @media (max-width: 768px) {
          .voice-enabled-chat-widget {
            width: 100%;
            height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceEnabledChatWidget;
