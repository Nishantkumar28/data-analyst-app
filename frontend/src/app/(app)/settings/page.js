'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  Settings, Sun, Moon, Bell, Shield, Key,
  Database, Brain, Sparkles, Check, ChevronRight, Info
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)} className="glass-card overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent-glow)' }}>
          <Icon size={15} color="var(--accent)" />
        </div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
        style={{ background: value ? 'var(--accent)' : 'var(--bg-primary)' }}>
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full"
          style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkCharts, setDarkCharts] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const themeOptions = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp()}>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure your DataAnalystAI platform preferences
        </p>
      </motion.div>

      {/* Appearance */}
      <Section title="Appearance" icon={Sun} delay={0.05}>
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Color Theme</p>
          <div className="flex gap-3">
            {themeOptions.map(opt => (
              <button key={opt.id}
                onClick={() => { if (theme !== opt.id) toggleTheme(); }}
                className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: theme === opt.id ? 'var(--accent)' : 'var(--bg-primary)',
                  color: theme === opt.id ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${theme === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                <opt.icon size={16} />
                {opt.label}
                {theme === opt.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        <ToggleRow
          label="Dark Charts"
          desc="Use dark background for chart visualizations"
          value={darkCharts}
          onChange={setDarkCharts}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell} delay={0.1}>
        <ToggleRow
          label="Toast Notifications"
          desc="Show pop-up notifications for workflow events"
          value={notifications}
          onChange={setNotifications}
        />
        <ToggleRow
          label="Auto-save"
          desc="Automatically save analysis results as they complete"
          value={autoSave}
          onChange={setAutoSave}
        />
      </Section>

      {/* API Configuration */}
      <Section title="AI Configuration" icon={Key} delay={0.15}>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              type={apiKeyVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2.5 pr-10 rounded-xl text-sm font-mono"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
            <button
              onClick={() => setApiKeyVisible(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--text-muted)' }}>
              {apiKeyVisible ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-xs mt-1.5 flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Info size={11} className="mt-0.5 flex-shrink-0" />
            Configure in <code className="font-mono px-1 rounded" style={{ background: 'var(--bg-card)' }}>backend/.env</code> for production use
          </p>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            AI Model
          </label>
          <select
            className="w-full p-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="gpt-4o">GPT-4o (Recommended)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Economy)</option>
          </select>
        </div>
      </Section>

      {/* Platform Info */}
      <Section title="Platform" icon={Brain} delay={0.2}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Backend', value: 'FastAPI 0.104+' },
            { label: 'AI Engine', value: 'OpenAI GPT-4' },
            { label: 'Database', value: 'SQLite / PostgreSQL' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--accent)' }}>
            <Sparkles size={12} className="inline mr-1" /> AI Agents Status
          </p>
          <div className="space-y-1.5">
            {['Manager Agent', 'Audit Agent', 'Cleaning Agent', 'EDA Agent', 'Visualization Agent', 'Insight Agent'].map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a}</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#10b981' }} />
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Save button */}
      <motion.div {...fadeUp(0.25)} className="flex justify-end">
        <button onClick={handleSave} className="btn-primary"
          style={saved ? { background: '#10b981' } : {}}>
          {saved ? <><Check size={15} /> Saved!</> : <><Settings size={15} /> Save Settings</>}
        </button>
      </motion.div>
    </div>
  );
}
