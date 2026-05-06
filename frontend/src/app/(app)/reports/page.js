'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Loader, Plus, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [selectedType, setSelectedType] = useState('pdf');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [rRes, wRes] = await Promise.all([fetch('/api/reports/'), fetch('/api/workflows/')]);
      if (rRes.ok) setReports(await rRes.json());
      if (wRes.ok) {
        const data = await wRes.json();
        setWorkflows(data.filter(w => w.status === 'completed'));
      }
    } catch {}
    setLoading(false);
  }

  async function generate() {
    if (!selectedWorkflow) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: selectedWorkflow, report_type: selectedType }),
      });
      if (res.ok) {
        const data = await res.json();
        setReports(prev => [data, ...prev]);
      }
    } catch {}
    setGenerating(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Generate and download analysis reports
        </p>
      </motion.div>

      {/* Generate Report */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Generate New Report</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={selectedWorkflow} onChange={e => setSelectedWorkflow(e.target.value)}
            className="flex-1 p-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="">Select completed workflow...</option>
            {workflows.map(w => (
              <option key={w.id} value={w.id}>{w.prompt?.slice(0, 60)}</option>
            ))}
          </select>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
            className="p-2.5 rounded-xl text-sm w-32"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="pdf">PDF</option>
            <option value="pptx">PowerPoint</option>
          </select>
          <button onClick={generate} disabled={generating || !selectedWorkflow} className="btn-primary">
            {generating ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
            Generate
          </button>
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Generated Reports</h3>
        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{ background: 'var(--bg-primary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-primary)'}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: r.report_type === 'pdf' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                  <FileText size={18} color={r.report_type === 'pdf' ? '#ef4444' : '#f59e0b'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.report_type?.toUpperCase()} • {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{r.report_type}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 size={32} color="var(--text-muted)" className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No reports yet. Complete an analysis workflow to generate reports.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
