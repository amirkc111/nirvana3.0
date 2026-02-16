"use client";

import { useState } from 'react';

export default function TestCompleteFlowPage() {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testCompleteFlow = async () => {
    setIsLoading(true);
    setResult('Testing complete flow...\n');
    
    try {
      // Step 1: Set session cookie
      document.cookie = 'user-session=amir_session; path=/; max-age=3600; SameSite=Lax';
      setResult(prev => prev + '✅ Session cookie set\n');
      
      // Step 2: Test auth API
      const authResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (authResponse.ok) {
        const userData = await authResponse.json();
        setResult(prev => prev + `✅ Auth API success: ${JSON.stringify(userData)}\n`);
        
        // Step 3: Test Kundli API
        const kundliResponse = await fetch(`/api/user/kundli-data?userId=${userData.id}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (kundliResponse.ok) {
          const savedKundliData = await kundliResponse.json();
          setResult(prev => prev + `✅ Kundli API success: ${JSON.stringify(savedKundliData)}\n`);
          
          // Step 4: Test Chat API
          const chatResponse = await fetch('/api/chat-kundli', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userQuestion: "who am i?",
              userData: {
                user: userData,
                savedKundliData: savedKundliData,
                isAuthenticated: true
              },
              kundliData: {},
              pageContent: "test content"
            }),
          });
          
          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            setResult(prev => prev + `✅ Chat API success: ${chatData.response.substring(0, 200)}...\n`);
          } else {
            const errorText = await chatResponse.text();
            setResult(prev => prev + `❌ Chat API failed: ${chatResponse.status} - ${errorText}\n`);
          }
        } else {
          setResult(prev => prev + `❌ Kundli API failed: ${kundliResponse.status}\n`);
        }
      } else {
        setResult(prev => prev + `❌ Auth API failed: ${authResponse.status}\n`);
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Exception: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Complete Flow Test</h1>
      
      <button 
        onClick={testCompleteFlow}
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
        {isLoading ? 'Testing...' : 'Test Complete Flow'}
      </button>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '15px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        minHeight: '200px'
      }}>
        {result || 'Click the button to start testing...'}
      </div>
    </div>
  );
}
