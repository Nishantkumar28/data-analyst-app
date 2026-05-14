'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  Settings, Sun, Moon, Bell, Shield, Key,
  Database, Brain, Sparkles, Check, Info, Cpu
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)} className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color="var(--text-secondary)" />
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>
    </motion.div>
  );
}

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</p>
        {desc && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} style={{
        position: 'relative', width: 44, height: 24, borderRadius: 'var(--radius-full)',
        background: value ? 'var(--success)' : 'var(--bg-input)', border: 'none', cursor: 'pointer', transition: 'background 0.3s'
      }}>
        <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: 'var(--shadow-sm)' }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 800, margin: '0 auto' }}>
      
      {/* Header */}
      <motion.div {...fadeUp()}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Configure your platform preferences and API keys</p>
      </motion.div>

      {/* Appearance */}
      <Section title="Appearance" icon={Sun} delay={0.05}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 12 }}>Color Theme</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[{ id: 'dark', label: 'Dark Mode', icon: Moon }, { id: 'light', label: 'Light Mode', icon: Sun }].map(opt => (
              <button key={opt.id} onClick={() => { if (theme !== opt.id) toggleTheme(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12,
                  borderRadius: 'var(--radius-md)', background: theme === opt.id ? 'var(--accent)' : 'var(--bg-input)',
                  color: theme === opt.id ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${theme === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                <opt.icon size={16} /> {opt.label} {theme === opt.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Configuration */}
      <Section title="AI Configuration" icon={Key} delay={0.1}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>OpenAI API Key</label>
          <div style={{ position: 'relative' }}>
            <input type={apiKeyVisible ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              style={{
                width: '100%', padding: '10px 14px', paddingRight: 60, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                fontFamily: 'monospace', fontSize: 13
              }} />
            <button onClick={() => setApiKeyVisible(!apiKeyVisible)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer'
            }}>
              {apiKeyVisible ? 'Hide' : 'Show'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={12} /> Configure in backend/.env for persistent production use
          </p>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Engine Model</label>
          <select style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
            border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, appearance: 'none'
          }}>
            <option value="gpt-4o">GPT-4o (Recommended - Best Logic)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Fastest)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
          </select>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Preferences" icon={Bell} delay={0.15}>
        <ToggleRow label="Toast Notifications" desc="Show pop-up notifications for workflow events" value={notifications} onChange={setNotifications} />
        <ToggleRow label="Auto-save Analyses" desc="Automatically save analysis results as they complete" value={autoSave} onChange={setAutoSave} />
      </Section>

      {/* Platform Info */}
      <Section title="System Status" icon={Cpu} delay={0.2}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Version', value: '1.0.0 (Beta)' },
            { label: 'Backend', value: 'FastAPI 0.104+' },
            { label: 'Database', value: 'SQLite / PostgreSQL Ready' },
            { label: 'UI Framework', value: 'Next.js 15 App Router' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-input)' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--success-subtle)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Check size={14} /> All 6 AI Agents Online
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['Manager', 'Audit', 'Cleaning', 'EDA', 'Visualization', 'Insight'].map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} /> {a} Agent
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Save Button */}
      <motion.div {...fadeUp(0.25)} style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16 }}>
        <button onClick={handleSave} className="btn-primary" style={{ background: saved ? 'var(--success)' : 'var(--gradient-brand)' }}>
          {saved ? <><Check size={16} /> Saved Successfully!</> : <><Settings size={16} /> Save Settings</>}
        </button>
      </motion.div>
    </div>
  );
}
