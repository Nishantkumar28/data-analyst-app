'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  FileText, Download, Loader, Plus, BarChart3, Sparkles,
  Calendar, Brain, X, ChevronDown
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

const reportTypes = [
  { id: 'full', label: 'Full Analysis Report', desc: 'Complete report with audit, EDA, visualizations, and insights', icon: BarChart3, color: 'var(--accent)' },
  { id: 'executive', label: 'Executive Summary', desc: 'High-level business insights and key recommendations', icon: Sparkles, color: 'var(--success)' },
  { id: 'data', label: 'Data Quality Report', desc: 'Detailed data audit, cleaning suggestions, and quality scores', icon: Brain, color: 'var(--info)' },
];

export default function ReportsPage() {
  const { addNotification } = useApp();
  const [reports, setReports] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [rRes, wRes] = await Promise.all([ fetch('/api/reports/'), fetch('/api/workflows/') ]);
      if (rRes.ok) setReports(await rRes.json());
      if (wRes.ok) setWorkflows(await wRes.json());
    } catch {}
    setLoading(false);
  }

  async function generateReport() {
    if (!selectedWorkflow) {
      addNotification('Select a workflow to generate a report', 'warning');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: selectedWorkflow, format: selectedFormat }),
      });
      if (!res.ok) throw new Error('Generation failed');
      addNotification('Report generated successfully!', 'success');
      setShowGenerator(false);
      loadData();
    } catch {
      addNotification('Failed to generate report. Make sure the backend is running.', 'error');
    }
    setGenerating(false);
  }

  async function downloadReport(id, format) {
    try {
      const res = await fetch(`/api/reports/${id}/download`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      addNotification('Download failed', 'error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Header */}
      <motion.div {...fadeUp()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Reports</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Generate and download AI-powered analysis reports</p>
        </div>
        <button onClick={() => setShowGenerator(p => !p)} className="btn-primary">
          <Plus size={16} /> Generate Report
        </button>
      </motion.div>

      {/* Generator Panel */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div className="glass-card" style={{ padding: 24, borderLeft: '3px solid var(--accent)', display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Configure New Report</h3>
                <button onClick={() => setShowGenerator(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Report Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {reportTypes.map(rt => (
                    <div key={rt.id} style={{
                      padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                      background: 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = rt.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <rt.icon size={16} color={rt.color} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{rt.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Workflow</label>
                  <select value={selectedWorkflow} onChange={e => setSelectedWorkflow(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, appearance: 'none' }}>
                    <option value="">Select a completed workflow...</option>
                    {workflows.filter(w => w.status === 'completed').map(w => (
                      <option key={w.id} value={w.id}>{w.prompt.slice(0, 50)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export Format</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['pdf', 'pptx', 'html'].map(f => (
                      <button key={f} onClick={() => setSelectedFormat(f)}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                          background: selectedFormat === f ? 'var(--accent)' : 'var(--bg-input)',
                          color: selectedFormat === f ? 'white' : 'var(--text-secondary)',
                          border: `1px solid ${selectedFormat === f ? 'var(--accent)' : 'var(--border)'}`,
                          fontSize: 13, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setShowGenerator(false)}>Cancel</button>
                <button className="btn-primary" onClick={generateReport} disabled={generating}>
                  {generating ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Loader size={24} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto' }}/></div>
      ) : reports.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map((r, i) => (
            <motion.div key={r.id} {...fadeUp(i * 0.05)} className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: 20, gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{r.name || `Report #${r.id.slice(0,8)}`}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{r.format.toUpperCase()}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="btn-secondary" onClick={() => downloadReport(r.id, r.format)} style={{ padding: '8px 16px', fontSize: 12 }}>
                <Download size={14} /> Download
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div {...fadeUp(0.2)} style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <FileText size={32} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No reports yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px auto' }}>Run an AI analysis on a dataset, then generate a downloadable presentation or document here.</p>
          <button className="btn-primary" onClick={() => setShowGenerator(true)}>
            <Plus size={16} /> Generate First Report
          </button>
        </motion.div>
      )}
    </div>
  );
}
