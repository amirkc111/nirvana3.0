"use client";

import { useState } from 'react';

export default function DebugChatPage() {
  const [debugLog, setDebugLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testChatFlow = async () => {
    setIsLoading(true);
    setDebugLog([]);
    
    try {
      addLog('🔍 Starting chat flow test...');
      
      // Test 1: Auth API
      addLog('🔍 Setting user session cookie...');
      document.cookie = 'user-session=amir_session; path=/; max-age=3600';
      
      addLog('🔍 Testing /api/auth/me...');
      const authResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      addLog(`🔍 Auth response: ${authResponse.status}`);
      
      if (authResponse.ok) {
        const userData = await authResponse.json();
        addLog(`🔍 User data: ${JSON.stringify(userData)}`);
        
        // Test 2: Kundli API
        addLog('🔍 Testing /api/user/kundli-data...');
        const kundliResponse = await fetch(`/api/user/kundli-data?userId=${userData.id}`, {
          method: 'GET',
          credentials: 'include'
        });
        addLog(`🔍 Kundli response: ${kundliResponse.status}`);
        
        if (kundliResponse.ok) {
          const savedKundliData = await kundliResponse.json();
          addLog(`🔍 Kundli data: ${JSON.stringify(savedKundliData)}`);
          
          // Test 3: Chat API
          addLog('🔍 Testing /api/chat-kundli...');
          const chatResponse = await fetch('/api/chat-kundli', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userQuestion: "hey who am i?",
              userData: {
                user: userData,
                savedKundliData: savedKundliData,
                isAuthenticated: true
              },
              kundliData: {},
              pageContent: "test content"
            }),
          });
          
          addLog(`🔍 Chat response: ${chatResponse.status}`);
          
          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            addLog(`✅ SUCCESS: ${chatData.response.substring(0, 100)}...`);
          } else {
            const errorText = await chatResponse.text();
            addLog(`❌ Chat API failed: ${chatResponse.status} - ${errorText}`);
          }
        } else {
          addLog(`❌ Kundli API failed: ${kundliResponse.status}`);
        }
      } else {
        addLog(`❌ Auth API failed: ${authResponse.status}`);
      }
      
    } catch (error) {
      addLog(`❌ Exception: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Chat Flow Debug</h1>
      
      <button 
        onClick={testChatFlow}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Testing...' : 'Test Complete Chat Flow'}
      </button>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '15px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '400px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {debugLog.length === 0 ? 'Click the button to start testing...' : debugLog.join('\n')}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>What this test does:</h3>
        <ol>
          <li>Tests /api/auth/me endpoint</li>
          <li>Tests /api/user/kundli-data endpoint</li>
          <li>Tests /api/chat-kundli endpoint with real data</li>
          <li>Shows detailed logs of each step</li>
        </ol>
      </div>
    </div>
  );
}
