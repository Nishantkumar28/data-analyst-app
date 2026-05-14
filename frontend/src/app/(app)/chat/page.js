'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Send, Bot, User, Loader, Sparkles, MessageSquare, Database, Trash2, ChevronDown } from 'lucide-react';

export default function ChatPage() {
  const { addNotification } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [datasetId, setDatasetId] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadDatasets(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadDatasets() {
    try {
      const res = await fetch('/api/datasets/');
      if (res.ok) setDatasets(await res.json());
    } catch {}
  }

  async function sendMessage(textOverride) {
    const text = textOverride || input;
    if (!text.trim() || sending) return;
    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId, dataset_id: datasetId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Please check backend.', id: Date.now() + 1 }]);
    }
    setSending(false);
  }

  const activeDataset = datasets.find(d => d.id === datasetId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', maxWidth: 800, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="var(--accent)" /> AI Data Chat
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Dataset Dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer'
            }}>
              <Database size={14} color={datasetId ? 'var(--accent)' : 'var(--text-muted)'} />
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeDataset ? activeDataset.name : 'No dataset'}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4, width: 200, zIndex: 50,
                background: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
              }}>
                <button onClick={() => { setDatasetId(''); setShowMenu(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
                  background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer'
                }}>No dataset</button>
                {datasets.map(d => (
                  <button key={d.id} onClick={() => { setDatasetId(d.id); setShowMenu(false); }} style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
                    background: datasetId === d.id ? 'var(--accent-subtle)' : 'transparent', border: 'none',
                    color: datasetId === d.id ? 'var(--accent)' : 'var(--text-primary)', fontSize: 13, cursor: 'pointer'
                  }}>{d.name}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { setMessages([]); setSessionId(null); }} style={{
            padding: 8, background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer'
          }}>
            <Trash2 size={16} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', padding: 40 }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <MessageSquare size={32} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Start a conversation</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Ask anything about your data.</p>
            </div>
          )}

          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)', flexShrink: 0,
                background: msg.role === 'user' ? 'var(--gradient-brand)' : 'var(--bg-card-solid)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="var(--accent)" />}
              </div>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {sending && (
            <div style={{ display: 'flex', gap: 12 }}>
               <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--bg-card-solid)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={14} color="var(--accent)" />
              </div>
              <div className="chat-bubble assistant">
                <Loader size={14} className="animate-spin" color="var(--text-muted)" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-card-solid)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your data..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 14
              }} />
            <button className="btn-primary" onClick={() => sendMessage()} disabled={sending || !input.trim()} style={{ padding: '0 20px' }}>
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
