"use client";

import { useState } from 'react';

export default function TestChatPage() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testChatAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      const response = await fetch('/api/chat-kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuestion: "Hello, this is a test message",
          userData: {
            user: { id: "user_123", name: "amir" },
            savedKundliData: [
              {
                id: "kundli_1",
                name: "amir",
                date: "1997-11-02",
                user_id: "user_123",
                isActive: true
              }
            ],
            isAuthenticated: true
          },
          kundliData: {},
          pageContent: "test content"
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ SUCCESS: ${result.response}`);
      } else {
        setTestResult(`❌ ERROR: ${response.status} - ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setTestResult(`❌ EXCEPTION: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Chat API Test</h1>
      
      <button 
        onClick={testChatAPI}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Testing...' : 'Test Chat API'}
      </button>
      
      {testResult && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: testResult.includes('✅') ? '#e6ffe6' : '#ffe6e6',
          border: `1px solid ${testResult.includes('✅') ? '#4CAF50' : '#f44336'}`,
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          <strong>Test Result:</strong><br />
          {testResult}
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Test Chat API" to test the chat endpoint</li>
          <li>Check if the API responds successfully</li>
          <li>If there's an error, check the browser console for more details</li>
        </ol>
      </div>
    </div>
  );
}
