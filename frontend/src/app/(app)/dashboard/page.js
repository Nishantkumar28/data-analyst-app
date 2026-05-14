'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import KPICard from '@/components/KPICard';
import {
  Database, Brain, BarChart3, FileText, Upload, ArrowRight,
  Activity, Sparkles, Clock, TrendingUp, Layers, Cpu,
  MessageSquare, Settings, ChevronRight, Zap, PieChart
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

const demoActivity = [
  { id: 1, prompt: 'Analyze customer churn drivers in Q4 data', status: 'completed', time: 'Today' },
  { id: 2, prompt: 'Find revenue correlations across regions', status: 'completed', time: 'Yesterday' },
  { id: 3, prompt: 'Identify anomalies in transaction logs', status: 'running', time: 'Just now' },
];

export default function DashboardPage() {
  const { datasets, setDatasets } = useApp();
  const [stats, setStats] = useState({ datasets: 0, workflows: 0, insights: 0, reports: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await fetch('/api/datasets/');
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
        setStats(s => ({ ...s, datasets: data.length }));
      }
      const wRes = await fetch('/api/workflows/');
      if (wRes.ok) {
        const wData = await wRes.json();
        setStats(s => ({ ...s, workflows: wData.length, insights: wData.length * 5 }));
        if (wData.length > 0) {
          setRecentActivity(wData.slice(0, 5).map(w => ({
            id: w.id, prompt: w.prompt, status: w.status,
            time: new Date(w.created_at).toLocaleDateString(),
          })));
        }
      }
    } catch {
      console.log('API not available — showing demo state');
    }
    setLoading(false);
  }

  const activity = recentActivity.length > 0 ? recentActivity : demoActivity;
  const hasRealData = recentActivity.length > 0 || datasets.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {greeting} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your AI analytics command center • <span style={{ color: 'var(--accent)' }}>{datasets.length || 0} datasets</span> loaded
          </p>
        </div>
        <Link href="/upload" className="btn-primary">
          <Upload size={16} /> Upload Dataset
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Datasets" value={stats.datasets} icon={Database} color="#3b82f6" delay={0} change={12.5} />
        <KPICard title="Workflows Run" value={stats.workflows} icon={Brain} color="#6366f1" delay={0.05} change={8.3} />
        <KPICard title="Insights Generated" value={stats.insights || stats.workflows * 5} icon={Sparkles} color="#10b981" delay={0.1} change={24.1} />
        <KPICard title="Reports Created" value={stats.reports} icon={FileText} color="#f59e0b" delay={0.15} />
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-1">
          <div className="glass-card p-5 h-full" style={{ cursor: 'default' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
              <Zap size={14} color="var(--accent)" />
            </div>
            <div className="space-y-1.5">
              {[
                { href: '/upload', icon: Upload, label: 'Upload New Dataset', desc: 'CSV, Excel, JSON', color: '#3b82f6' },
                { href: '/analytics', icon: Brain, label: 'Start AI Analysis', desc: 'Multi-agent workflow', color: '#6366f1' },
                { href: '/chat', icon: MessageSquare, label: 'Chat with Data', desc: 'Natural language Q&A', color: '#10b981' },
                { href: '/reports', icon: FileText, label: 'View Reports', desc: 'Generated insights', color: '#f59e0b' },
              ].map((a, i) => (
                <Link key={i} href={a.href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `${a.color}12` }}>
                    <a.icon size={16} color={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div {...fadeUp(0.25)} className="lg:col-span-2">
          <div className="glass-card p-5 h-full" style={{ cursor: 'default' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Recent Activity
                {!hasRealData && <span className="ml-2 text-[10px] font-normal px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>Demo</span>}
              </h3>
              <Activity size={14} color="var(--text-muted)" />
            </div>

            {activity.length > 0 ? (
              <div className="space-y-2">
                {activity.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}>
                    <Link href={hasRealData ? `/analytics?workflow=${a.id}` : '/analytics'}
                      className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: a.status === 'completed' ? '#10b981' : a.status === 'failed' ? '#ef4444' : '#f59e0b' }} />
                        {a.status === 'running' && (
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping"
                            style={{ background: '#f59e0b', opacity: 0.4 }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {a.prompt}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <span className="capitalize">{a.status}</span> • {a.time}
                        </p>
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity size={32} color="var(--text-muted)" className="mx-auto mb-3" />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No activity yet. Upload a dataset to get started!
                </p>
                <Link href="/upload" className="btn-primary mt-4 inline-flex">
                  <Upload size={14} /> Upload Data
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Platform Overview Cards */}
      <motion.div {...fadeUp(0.3)}>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Brain, title: 'AI Agent Pipeline', desc: 'Manager → Audit → Clean → EDA → Viz → Insight',
              color: '#6366f1', href: '/analytics',
              extra: '6 agents, fully automated'
            },
            {
              icon: MessageSquare, title: 'Natural Language Chat', desc: 'Ask questions about your data and get instant AI answers',
              color: '#10b981', href: '/chat',
              extra: 'GPT-4 powered Q&A'
            },
            {
              icon: PieChart, title: 'Auto Visualizations', desc: 'Bar, line, pie, scatter, heatmaps, and correlation charts',
              color: '#f59e0b', href: '/analytics',
              extra: '8+ chart types'
            },
          ].map((card, i) => (
            <Link key={i} href={card.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="glass-card p-5 h-full group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${card.color}12` }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)"
                    className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                </div>
                <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{card.title}</h4>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: `${card.color}12`, color: card.color }}>{card.extra}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Datasets Table */}
      <motion.div {...fadeUp(0.35)}>
        <div className="glass-card p-5" style={{ cursor: 'default' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Your Datasets</h3>
            <Link href="/upload" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              View All <ChevronRight size={12} />
            </Link>
          </div>
          {datasets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Type</th><th>Rows</th><th>Columns</th><th>Health</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.slice(0, 5).map(d => (
                    <tr key={d.id}>
                      <td className="font-medium">{d.name}</td>
                      <td><span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{d.file_type}</span></td>
                      <td>{d.row_count?.toLocaleString()}</td>
                      <td>{d.column_count}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--bg-primary)' }}>
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${d.health_score || 0}%`,
                              background: d.health_score >= 80 ? '#10b981' : d.health_score >= 50 ? '#f59e0b' : '#ef4444',
                            }} />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.health_score?.toFixed(0) || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: d.status === 'ready' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            color: d.status === 'ready' ? '#10b981' : '#f59e0b',
                          }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--accent-glow)' }}>
                <Layers size={24} color="var(--accent)" />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No datasets yet</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Upload a CSV, Excel, or JSON file to get started</p>
              <Link href="/upload" className="btn-primary inline-flex">
                <Upload size={14} /> Upload Dataset
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
