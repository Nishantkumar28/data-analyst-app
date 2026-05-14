'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  Send, Bot, User, Loader, Sparkles, MessageSquare,
  Database, Plus, Trash2, ChevronDown, Zap
} from 'lucide-react';

const suggestions = [
  { label: 'Dataset Overview', prompt: 'Give me a complete overview of this dataset' },
  { label: 'Missing Values', prompt: 'Analyze missing values and suggest imputation strategies' },
  { label: 'Correlations', prompt: 'Which variables are most correlated with each other?' },
  { label: 'Outliers', prompt: 'Find and explain any outliers in this data' },
  { label: 'Best Analysis', prompt: 'What is the best analytical approach for this dataset?' },
  { label: 'Key Patterns', prompt: 'What patterns or trends stand out in this data?' },
];

export default function ChatPage() {
  const { addNotification } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [datasetId, setDatasetId] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [showDatasetMenu, setShowDatasetMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadDatasets(); }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadDatasets() {
    try {
      const res = await fetch('/api/datasets/');
      if (res.ok) setDatasets(await res.json());
    } catch {}
  }

  async function sendMessage(messageText) {
    const text = messageText || input;
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
      setMessages(prev => [...prev, {
        role: 'assistant', content: data.response,
        message_type: data.message_type, id: Date.now() + 1,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m ready to help analyze your data. Connect the backend API to enable AI-powered responses.',
        id: Date.now() + 1,
      }]);
    }
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function clearChat() {
    setMessages([]);
    setSessionId(null);
    addNotification('Chat cleared', 'info');
  }

  const activeDataset = datasets.find(d => d.id === datasetId);

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Sparkles size={18} color="var(--accent)" />
            </div>
            AI Data Chat
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Ask questions about your data in natural language
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Dataset Picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatasetMenu(p => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: 'var(--bg-card)', color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}>
              <Database size={14} color={datasetId ? 'var(--accent)' : 'var(--text-muted)'} />
              <span className="max-w-[120px] truncate">
                {activeDataset ? activeDataset.name : 'No dataset'}
              </span>
              <ChevronDown size={12} color="var(--text-muted)" />
            </button>
            {showDatasetMenu && (
              <div className="absolute right-0 top-full mt-1 min-w-[200px] z-50 rounded-xl overflow-hidden shadow-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => { setDatasetId(''); setShowDatasetMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  No dataset
                </button>
                {datasets.map(d => (
                  <button key={d.id}
                    onClick={() => { setDatasetId(d.id); setShowDatasetMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-all"
                    style={{ color: datasetId === d.id ? 'var(--accent)' : 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat}
              className="p-2 rounded-xl transition-all"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              title="Clear chat"
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <Trash2 size={15} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Active dataset banner */}
      {activeDataset && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 flex-shrink-0 text-xs"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Database size={12} color="var(--accent)" />
          <span style={{ color: 'var(--text-secondary)' }}>Chatting about:</span>
          <span className="font-medium" style={{ color: 'var(--accent)' }}>{activeDataset.name}</span>
          <span style={{ color: 'var(--text-muted)' }}>({activeDataset.row_count?.toLocaleString()} rows)</span>
        </motion.div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--accent-glow)' }}>
              <MessageSquare size={28} color="var(--accent)" />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Start a conversation
            </h3>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              {datasetId ? 'Ask me anything about your dataset!' : 'Select a dataset above, then ask away.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {suggestions.map((s, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => sendMessage(s.prompt)}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all font-medium"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                    e.currentTarget.style.background = 'var(--accent-glow)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}>
                  <Zap size={10} />
                  {s.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div key={msg.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-3"
            style={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: msg.role === 'user' ? 'var(--gradient-1)' : 'var(--bg-card)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              }}>
              {msg.role === 'user'
                ? <User size={14} color="white" />
                : <Bot size={14} color="var(--accent)" />}
            </div>
            <div className={`chat-bubble ${msg.role}`}
              style={{ maxWidth: '78%' }}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </motion.div>
        ))}

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <Bot size={14} color="var(--accent)" />
            </div>
            <div className="chat-bubble assistant flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 pt-2">
        <div className="glass-card p-2.5 flex gap-2 items-end"
          style={{ borderColor: 'var(--border-active)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about your data... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none text-sm leading-relaxed"
            style={{
              background: 'transparent', color: 'var(--text-primary)',
              border: 'none', outline: 'none', padding: '6px 4px',
              maxHeight: 120, boxShadow: 'none',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={sending || !input.trim()}
            className="btn-primary flex-shrink-0 p-2.5"
            style={{ borderRadius: 10, padding: '10px 14px' }}>
            {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--text-muted)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
