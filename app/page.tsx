'use client';

import { useState, useEffect } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  source: 'anthropic' | 'custom';
}

interface FileInfo {
  id: string;
  filename: string;
  content_type: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillId, setCustomSkillId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [containerId, setContainerId] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<FileInfo[]>([]);
  const [requiresContinuation, setRequiresContinuation] = useState(false);

  // Load available skills on component mount
  useEffect(() => {
    if (apiKey) {
      loadSkills();
    }
  }, [apiKey]);

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/skills', {
        headers: {
          'X-API-Key': apiKey,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAvailableSkills(data.data);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

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
      // Prepare skills configuration
      const skills = [];
      
      // Add selected Anthropic skills
      for (const skillId of selectedSkills) {
        const skill = availableSkills.find(s => s.id === skillId);
        if (skill && skill.source === 'anthropic') {
          skills.push({
            type: 'anthropic',
            skill_id: skillId
          });
        }
      }
      
      // Add custom skill if specified
      if (customSkillId.trim()) {
        skills.push({
          type: 'custom',
          skill_id: customSkillId.trim()
        });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          messages: newMessages,
          skills: skills,
          session_id: sessionId || undefined,
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
        
        // Update container ID if provided
        if (data.container_id) {
          setContainerId(data.container_id);
        }
        
        // Handle generated files
        if (data.file_ids && data.file_ids.length > 0) {
          // Load file metadata for each file ID
          const filePromises = data.file_ids.map(async (fileId: string) => {
            try {
              const fileResponse = await fetch(`/api/files/${fileId}`, {
                headers: { 'X-API-Key': apiKey }
              });
              const fileData = await fileResponse.json();
              if (fileData.success) {
                return fileData.data;
              }
            } catch (error) {
              console.error('Error loading file metadata:', error);
            }
            return null;
          });
          
          const files = await Promise.all(filePromises);
          setGeneratedFiles(files.filter(f => f !== null));
        }
        
        // Handle pause_turn continuation
        if (data.requires_continuation) {
          setRequiresContinuation(true);
          // Automatically continue after a short delay
          setTimeout(() => {
            continueConversation();
          }, 2000);
        }
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

  const continueConversation = async () => {
    if (!containerId || !apiKey) return;
    
    setLoading(true);
    setRequiresContinuation(false);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          messages: messages,
          session_id: sessionId,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data.content[0]) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.data.content[0].text,
        }]);
        
        // Handle generated files
        if (data.file_ids && data.file_ids.length > 0) {
          const filePromises = data.file_ids.map(async (fileId: string) => {
            try {
              const fileResponse = await fetch(`/api/files/${fileId}`, {
                headers: { 'X-API-Key': apiKey }
              });
              const fileData = await fileResponse.json();
              if (fileData.success) {
                return fileData.data;
              }
            } catch (error) {
              console.error('Error loading file metadata:', error);
            }
            return null;
          });
          
          const files = await Promise.all(filePromises);
          setGeneratedFiles(prev => [...prev, ...files.filter(f => f !== null)]);
        }
        
        // Check if another continuation is needed
        if (data.requires_continuation) {
          setRequiresContinuation(true);
          setTimeout(() => {
            continueConversation();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error continuing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/content`, {
        headers: { 'X-API-Key': apiKey }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
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

      {/* Skills Selection */}
      {apiKey && availableSkills.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Skills Configuration</h3>
          
          {/* Anthropic Skills */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#374151' 
            }}>
              Anthropic Skills:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableSkills
                .filter(skill => skill.source === 'anthropic')
                .map(skill => (
                  <label key={skill.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px 12px',
                    backgroundColor: selectedSkills.includes(skill.id) ? '#dbeafe' : '#f1f5f9',
                    border: selectedSkills.includes(skill.id) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSkills(prev => [...prev, skill.id]);
                        } else {
                          setSelectedSkills(prev => prev.filter(id => id !== skill.id));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    {skill.name}
                  </label>
                ))}
            </div>
          </div>

          {/* Custom Skill ID */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#374151' 
            }}>
              Custom Skill ID (optional):
            </label>
            <input
              type="text"
              value={customSkillId}
              onChange={(e) => setCustomSkillId(e.target.value)}
              placeholder="Enter custom skill ID"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Session ID */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#374151' 
            }}>
              Session ID (optional):
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID for conversation continuity"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', marginBottom: '0' }}>
              Leave empty to start a new conversation. Provide a session ID to continue an existing conversation.
            </p>
          </div>
        </div>
      )}

      {/* Generated Files */}
      {generatedFiles.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#166534' }}>Generated Files</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {generatedFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => downloadFile(file.id, file.filename)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📄 {file.filename}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Container Status */}
      {containerId && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <strong>Container ID:</strong> {containerId}
          {requiresContinuation && (
            <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>
              (Processing...)
            </span>
          )}
        </div>
      )}

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
