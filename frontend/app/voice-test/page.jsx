'use client';

import React, { useState, useEffect } from 'react';
import VoiceEnabledChatWidget from '../../components/VoiceEnabledChatWidget';

export default function VoiceTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎤 Voice-Enabled AI Astrologer
          </h1>
          <p className="text-xl text-blue-200 mb-6">
            Experience the future of astrological consultation with voice interaction
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🎯 Voice Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <h3 className="font-semibold text-white">Voice Input</h3>
                    <p className="text-blue-200 text-sm">Speak your questions naturally</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔊</span>
                  <div>
                    <h3 className="font-semibold text-white">Voice Output</h3>
                    <p className="text-blue-200 text-sm">AI responds with speech</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⌨️</span>
                  <div>
                    <h3 className="font-semibold text-white">Keyboard Shortcuts</h3>
                    <p className="text-blue-200 text-sm">Ctrl+Space for voice, Escape to stop</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <h3 className="font-semibold text-white">Multi-Language</h3>
                    <p className="text-blue-200 text-sm">English, Nepali, Sanskrit support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h3 className="font-semibold text-white">Advanced AI</h3>
                    <p className="text-blue-200 text-sm">Complete astrological knowledge base</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h3 className="font-semibold text-white">Sanskrit Expert</h3>
                    <p className="text-blue-200 text-sm">462-page Sanskrit guide knowledge</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🚀 How to Use</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
                <div>
                  <h3 className="font-semibold text-white">Click the microphone button</h3>
                  <p className="text-blue-200">Or press Ctrl+Space to start voice input</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
                <div>
                  <h3 className="font-semibold text-white">Speak your question</h3>
                  <p className="text-blue-200">Ask about astrology, Sanskrit, or any topic</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
                <div>
                  <h3 className="font-semibold text-white">Listen to the response</h3>
                  <p className="text-blue-200">AI will speak the answer back to you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Voice Chat Widget will be rendered here */}
        <VoiceEnabledChatWidget />
      </div>
    </div>
  );
}
