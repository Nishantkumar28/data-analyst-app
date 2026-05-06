'use client';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Sun, Moon, Palette, Bell, Shield, Database, Key, User } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useApp();

  const sections = [
    {
      title: 'Appearance', icon: Palette,
      items: [
        {
          label: 'Theme', desc: 'Switch between dark and light mode',
          action: (
            <button onClick={toggleTheme} className="btn-secondary text-sm">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          ),
        },
      ],
    },
    {
      title: 'AI Configuration', icon: Key,
      items: [
        { label: 'OpenAI API Key', desc: 'Configure in backend .env file', action: <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>Server-side</span> },
        { label: 'AI Model', desc: 'GPT-4o (default)', action: <span className="text-xs" style={{ color: 'var(--text-muted)' }}>gpt-4o</span> },
      ],
    },
    {
      title: 'Data & Storage', icon: Database,
      items: [
        { label: 'Upload Size Limit', desc: 'Maximum file size for uploads', action: <span className="text-xs" style={{ color: 'var(--text-muted)' }}>500 MB</span> },
        { label: 'Supported Formats', desc: 'File types accepted for upload', action: <span className="text-xs" style={{ color: 'var(--text-muted)' }}>CSV, XLSX, JSON</span> },
      ],
    },
    {
      title: 'Notifications', icon: Bell,
      items: [
        { label: 'Analysis Complete', desc: 'Notify when AI analysis finishes', action: <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Enabled</span> },
        { label: 'Error Alerts', desc: 'Notify on pipeline failures', action: <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Enabled</span> },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your preferences</p>
      </motion.div>

      {sections.map((section, si) => (
        <motion.div key={si} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <section.icon size={18} color="var(--accent)" />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{section.title}</h3>
          </div>
          <div className="space-y-4">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2"
                style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? '16px' : 0 }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          DataAnalystAI v1.0.0 • Multi-Agent Analytics Platform
        </p>
      </div>
    </div>
  );
}
