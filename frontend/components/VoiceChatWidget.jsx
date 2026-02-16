'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const VoiceChatWidget = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  // Audio refs
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Initialize voice capabilities
  useEffect(() => {
    initializeVoiceCapabilities();
  }, []);
  
  const initializeVoiceCapabilities = () => {
    // Check for Speech Recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US'; // Can be changed based on user preference
      
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
          processVoiceInput(transcript);
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
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = synthesisInstance.getVoices();
        setVoices(availableVoices);
        
        // Select a good default voice
        const preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha'))
        ) || availableVoices[0];
        
        setSelectedVoice(preferredVoice);
      };
      
      // Load voices when they become available
      if (synthesisInstance.getVoices().length > 0) {
        loadVoices();
      } else {
        synthesisInstance.onvoiceschanged = loadVoices;
      }
    }
    
    setIsVoiceEnabled(true);
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
  
  const processVoiceInput = async (inputText) => {
    try {
      console.log('🎤 Processing voice input:', inputText);
      
      // Send to AI chat API
      const response = await fetch('/api/chat-kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuestion: inputText,
          userData: { isAuthenticated: false }, // For now, handle as guest
          kundliData: [],
          relevantContent: '',
          searchResults: '',
          pageContent: '',
          searchCapabilities: false
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.response;
        
        // Speak the AI response
        speakResponse(aiResponse);
        setVoiceResponse(aiResponse);
      } else {
        console.error('❌ Error getting AI response');
        speakResponse("Sorry, I couldn't process your request. Please try again.");
      }
    } catch (error) {
      console.error('❌ Error processing voice input:', error);
      speakResponse("Sorry, there was an error processing your request.");
    }
  };
  
  const speakResponse = (text) => {
    if (synthesis && selectedVoice) {
      // Stop any current speech
      synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 0.9; // Slightly slower for better comprehension
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
  
  const toggleVoiceMode = () => {
    if (isVoiceEnabled) {
      if (isListening) {
        stopListening();
      } else if (isSpeaking) {
        stopSpeaking();
      } else {
        startListening();
      }
    }
  };
  
  // Voice control shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Space bar to start/stop listening
      if (event.code === 'Space' && event.ctrlKey) {
        event.preventDefault();
        toggleVoiceMode();
      }
      // Escape to stop speaking
      if (event.code === 'Escape') {
        stopSpeaking();
        stopListening();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isListening, isSpeaking]);
  
  if (!isVoiceEnabled) {
    return (
      <div className="voice-widget-disabled">
        <p>🎤 Voice features not supported in this browser</p>
        <p>Please use Chrome, Safari, or Edge for voice capabilities</p>
      </div>
    );
  }
  
  return (
    <div className="voice-chat-widget">
      {/* Voice Status Display */}
      <div className="voice-status">
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse-ring"></div>
            <div className="pulse-ring-2"></div>
            <div className="pulse-ring-3"></div>
            <span>🎤 Listening...</span>
          </div>
        )}
        
        {isSpeaking && (
          <div className="speaking-indicator">
            <div className="sound-waves">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
            <span>🔊 Speaking...</span>
          </div>
        )}
      </div>
      
      {/* Voice Controls */}
      <div className="voice-controls">
        <button
          className={`voice-button ${isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}`}
          onClick={toggleVoiceMode}
          disabled={!isVoiceEnabled}
        >
          {isListening ? '⏹️ Stop Listening' : isSpeaking ? '⏹️ Stop Speaking' : '🎤 Start Voice Chat'}
        </button>
        
        <div className="voice-info">
          <p>Press Ctrl+Space to start/stop voice chat</p>
          <p>Press Escape to stop speaking</p>
        </div>
      </div>
      
      {/* Transcript Display */}
      {transcript && (
        <div className="voice-transcript">
          <h4>🎤 You said:</h4>
          <p>{transcript}</p>
        </div>
      )}
      
      {/* AI Response Display */}
      {voiceResponse && (
        <div className="voice-response">
          <h4>🤖 AI Response:</h4>
          <p>{voiceResponse}</p>
        </div>
      )}
      
      {/* Voice Settings */}
      <div className="voice-settings">
        <label htmlFor="voice-select">Voice:</label>
        <select
          id="voice-select"
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const voice = voices.find(v => v.name === e.target.value);
            setSelectedVoice(voice);
          }}
        >
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
      
      <style jsx>{`
        .voice-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: ${theme === 'dark' ? '#1a1a2e' : '#ffffff'};
          border: 2px solid ${theme === 'dark' ? '#16213e' : '#e0e0e0'};
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          z-index: 1000;
          min-width: 300px;
          max-width: 400px;
        }
        
        .voice-status {
          margin-bottom: 15px;
        }
        
        .listening-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ff6b6b;
          font-weight: bold;
        }
        
        .speaking-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #4ecdc4;
          font-weight: bold;
        }
        
        .pulse-ring {
          width: 20px;
          height: 20px;
          border: 2px solid #ff6b6b;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        
        .pulse-ring-2 {
          width: 20px;
          height: 20px;
          border: 2px solid #ff6b6b;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          animation-delay: 0.5s;
        }
        
        .pulse-ring-3 {
          width: 20px;
          height: 20px;
          border: 2px solid #ff6b6b;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          animation-delay: 1s;
        }
        
        .sound-waves {
          display: flex;
          gap: 3px;
          align-items: center;
        }
        
        .wave {
          width: 4px;
          height: 20px;
          background: #4ecdc4;
          border-radius: 2px;
          animation: wave 1s infinite;
        }
        
        .wave:nth-child(2) { animation-delay: 0.1s; }
        .wave:nth-child(3) { animation-delay: 0.2s; }
        .wave:nth-child(4) { animation-delay: 0.3s; }
        
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 30px; }
        }
        
        .voice-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          margin-bottom: 15px;
        }
        
        .voice-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .voice-button.listening {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }
        
        .voice-button.speaking {
          background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        }
        
        .voice-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .voice-info {
          font-size: 12px;
          color: ${theme === 'dark' ? '#a0a0a0' : '#666'};
          margin-bottom: 15px;
        }
        
        .voice-transcript, .voice-response {
          background: ${theme === 'dark' ? '#16213e' : '#f8f9fa'};
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
        }
        
        .voice-transcript h4, .voice-response h4 {
          margin: 0 0 10px 0;
          color: ${theme === 'dark' ? '#ffffff' : '#333'};
        }
        
        .voice-transcript p, .voice-response p {
          margin: 0;
          color: ${theme === 'dark' ? '#e0e0e0' : '#555'};
          line-height: 1.5;
        }
        
        .voice-settings {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .voice-settings label {
          font-size: 14px;
          color: ${theme === 'dark' ? '#ffffff' : '#333'};
        }
        
        .voice-settings select {
          background: ${theme === 'dark' ? '#16213e' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333'};
          border: 1px solid ${theme === 'dark' ? '#333' : '#ddd'};
          border-radius: 5px;
          padding: 5px 10px;
          font-size: 12px;
        }
        
        .voice-widget-disabled {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #ff6b6b;
          color: white;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default VoiceChatWidget;
