'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Send, Bot, User, Loader, Database, Sparkles, MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { addNotification } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [datasetId, setDatasetId] = useState('');
  const [datasets, setDatasets] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadDatasets(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadDatasets() {
    try {
      const res = await fetch('/api/datasets/');
      if (res.ok) setDatasets(await res.json());
    } catch {}
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, session_id: sessionId, dataset_id: datasetId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setSessionId(data.session_id);
      setMessages(prev => [...prev, {
        role: 'assistant', content: data.response,
        message_type: data.message_type, id: Date.now() + 1,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant', content: `I can help with your data questions. Try asking about column details, missing values, or dataset statistics.`,
        id: Date.now() + 1,
      }]);
    }
    setSending(false);
  }

  const suggestions = [
    'Give me a dataset overview',
    'Show me the columns and their types',
    'Analyze missing values',
    'What patterns exist in this data?',
    'Which variables are most correlated?',
    'Suggest the best analysis approach',
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Sparkles size={20} className="inline mr-2" color="#6366f1" />AI Data Chat
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Ask questions about your data in natural language
          </p>
        </div>
        <select value={datasetId} onChange={e => setDatasetId(e.target.value)}
          className="p-2 rounded-xl text-sm max-w-[200px]"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <option value="">No dataset selected</option>
          {datasets.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare size={40} color="var(--text-muted)" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Start a conversation
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              {datasetId ? 'Ask me anything about your dataset!' : 'Select a dataset above, then ask me anything.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); }}
                  className="text-xs px-3 py-2 rounded-lg transition-all"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <motion.div key={msg.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
            style={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: msg.role === 'user' ? 'var(--gradient-1)' : 'var(--bg-card)', border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none' }}>
              {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="var(--accent)" />}
            </div>
            <div className={`chat-bubble ${msg.role}`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </motion.div>
        ))}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <Bot size={14} color="var(--accent)" />
            </div>
            <div className="chat-bubble assistant flex items-center gap-2">
              <Loader size={14} className="animate-spin" color="var(--accent)" />
              <span style={{ color: 'var(--text-muted)' }}>Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card p-3 flex gap-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your data..."
          className="flex-1 p-2.5 rounded-xl text-sm"
          style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        <button onClick={sendMessage} disabled={sending || !input.trim()} className="btn-primary">
          {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
