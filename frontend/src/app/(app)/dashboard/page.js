'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import KPICard from '@/components/KPICard';
import {
  Database, Brain, FileText, Upload, Activity, Sparkles,
  MessageSquare, ChevronRight, Zap, PieChart, Layers
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* ─── Header ─── */}
      <motion.div {...fadeUp()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {greeting} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Your AI analytics command center • <span style={{ color: 'var(--accent)' }}>{datasets.length || 0} datasets</span> loaded
          </p>
        </div>
        <Link href="/upload" className="btn-primary">
          <Upload size={16} /> Upload Dataset
        </Link>
      </motion.div>

      {/* ─── KPIs ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
        <KPICard title="Total Datasets" value={stats.datasets} icon={Database} color="var(--info)" delay={0} change={12.5} />
        <KPICard title="Workflows Run" value={stats.workflows} icon={Brain} color="var(--accent)" delay={0.1} change={8.3} />
        <KPICard title="Insights Generated" value={stats.insights || stats.workflows * 5} icon={Sparkles} color="var(--success)" delay={0.2} change={24.1} />
        <KPICard title="Reports Created" value={stats.reports} icon={FileText} color="var(--warning)" delay={0.3} />
      </div>

      {/* ─── Quick Actions & Activity ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
        
        {/* Quick Actions */}
        <motion.div {...fadeUp(0.4)} className="glass-card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Quick Actions</h3>
            <Zap size={16} color="var(--accent)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[
              { href: '/upload', icon: Upload, label: 'Upload New Dataset', desc: 'CSV, Excel, JSON', color: 'var(--info)' },
              { href: '/analytics', icon: Brain, label: 'Start AI Analysis', desc: 'Multi-agent workflow', color: 'var(--accent)' },
              { href: '/chat', icon: MessageSquare, label: 'Chat with Data', desc: 'Natural language Q&A', color: 'var(--success)' },
              { href: '/reports', icon: FileText, label: 'View Reports', desc: 'Generated insights', color: 'var(--warning)' },
            ].map((a, i) => (
              <Link key={i} href={a.href} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '12px',
                borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)',
                border: '1px solid var(--border)', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <a.icon size={18} color={a.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{a.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</p>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div {...fadeUp(0.5)} className="glass-card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Activity
              {!hasRealData && <span className="badge" style={{ marginLeft: 8, background: 'var(--accent-subtle)', color: 'var(--accent)' }}>Demo</span>}
            </h3>
            <Activity size={16} color="var(--text-muted)" />
          </div>

          {activity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {activity.map((a, i) => (
                <Link key={i} href={hasRealData ? `/analytics?workflow=${a.id}` : '/analytics'} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
                  borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)',
                  border: '1px solid var(--border)', transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: a.status === 'completed' ? 'var(--success)' : a.status === 'failed' ? 'var(--danger)' : 'var(--warning)'
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.prompt}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>
                      {a.status} • {a.time}
                    </p>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          ) : (
             <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <Activity size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
               <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No activity yet. Upload data to begin.</p>
             </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
