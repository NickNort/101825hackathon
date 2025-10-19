'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!apiKey.trim()) {
      setApiKeyError('Please enter your API key');
      return;
    }

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setApiKeyError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setApiKeyError('Invalid API key. Please check your key and try again.');
        setMessages(messages); // Restore previous messages
        return;
      }
      
      if (response.status === 429) {
        alert('Rate limit exceeded. Please wait a moment and try again.');
        setMessages(messages); // Restore previous messages
        return;
      }

      if (data.success && data.data.content[0]) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.data.content[0].text,
        }]);
      } else {
        console.error('Error:', data.error);
        alert('Error: ' + (data.error || 'Unknown error'));
        setMessages(messages); // Restore previous messages
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message. Please try again.');
      setMessages(messages); // Restore previous messages
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Claude Agent on Vercel</h1>
      <p style={{ color: '#666' }}>Chat with Claude AI</p>

      {/* API Key Input */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px' 
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: 'bold',
          color: '#0c4a6e' 
        }}>
          API Key:
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setApiKeyError('');
          }}
          placeholder="Enter your authorized API key"
          style={{
            width: '100%',
            padding: '10px',
            border: apiKeyError ? '2px solid #ef4444' : '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {apiKeyError && (
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '5px', marginBottom: '0' }}>
            {apiKeyError}
          </p>
        )}
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginBottom: '0' }}>
          Get your API key from your administrator or server environment variables.
        </p>
      </div>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        minHeight: '400px',
        maxHeight: '500px',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center' }}>No messages yet. Start a conversation!</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '15px',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff',
              border: msg.role === 'assistant' ? '1px solid #ddd' : 'none'
            }}
          >
            <strong style={{ color: msg.role === 'user' ? '#1976d2' : '#2e7d32' }}>
              {msg.role === 'user' ? 'You' : 'Claude'}:
            </strong>
            <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <em>Claude is thinking...</em>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || !input.trim() ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
