'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import KPICard from '@/components/KPICard';
import {
  Database, Brain, BarChart3, FileText, Upload, ArrowRight,
  Activity, Sparkles, Clock, TrendingUp, Layers, Cpu
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { datasets, setDatasets } = useApp();
  const [stats, setStats] = useState({ datasets: 0, workflows: 0, insights: 0, reports: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setStats(s => ({ ...s, workflows: wData.length }));
        setRecentActivity(wData.slice(0, 5).map(w => ({
          id: w.id, prompt: w.prompt, status: w.status,
          time: new Date(w.created_at).toLocaleDateString(),
        })));
      }
    } catch (e) {
      console.log('API not available, using demo data');
      setStats({ datasets: 0, workflows: 0, insights: 0, reports: 0 });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your AI analytics command center
          </p>
        </div>
        <Link href="/upload" className="btn-primary">
          <Upload size={16} /> Upload Dataset
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Datasets" value={stats.datasets} icon={Database} color="#3b82f6" delay={0} />
        <KPICard title="Workflows Run" value={stats.workflows} icon={Brain} color="#6366f1" delay={0.05} />
        <KPICard title="Insights Generated" value={stats.insights || stats.workflows * 5} icon={Sparkles} color="#10b981" delay={0.1} />
        <KPICard title="Reports Created" value={stats.reports} icon={FileText} color="#f59e0b" delay={0.15} />
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-1">
          <div className="glass-card p-5 h-full">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/upload', icon: Upload, label: 'Upload New Dataset', desc: 'CSV, Excel, JSON', color: '#3b82f6' },
                { href: '/analytics', icon: Brain, label: 'Start AI Analysis', desc: 'Multi-agent workflow', color: '#6366f1' },
                { href: '/chat', icon: Sparkles, label: 'Chat with Data', desc: 'Natural language Q&A', color: '#10b981' },
                { href: '/reports', icon: FileText, label: 'View Reports', desc: 'Generated insights', color: '#f59e0b' },
              ].map((a, i) => (
                <Link key={i} href={a.href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${a.color}15` }}>
                    <a.icon size={16} color={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <div className="glass-card p-5 h-full">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <Link key={i} href={`/analytics?workflow=${a.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: a.status === 'completed' ? '#10b981' : a.status === 'failed' ? '#ef4444' : '#f59e0b' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {a.prompt}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {a.status} • {a.time}
                      </p>
                    </div>
                  </Link>
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

      {/* Datasets */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your Datasets</h3>
            <Link href="/upload" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>View All →</Link>
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
                            <div className="h-full rounded-full" style={{
                              width: `${d.health_score || 0}%`,
                              background: d.health_score >= 80 ? '#10b981' : d.health_score >= 50 ? '#f59e0b' : '#ef4444',
                            }} />
                          </div>
                          <span className="text-xs">{d.health_score?.toFixed(0) || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full"
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
            <div className="text-center py-10">
              <Layers size={28} color="var(--text-muted)" className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No datasets uploaded yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
