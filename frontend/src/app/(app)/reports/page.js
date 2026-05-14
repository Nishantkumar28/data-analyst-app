'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  FileText, Download, Loader, Plus, BarChart3, Sparkles,
  Calendar, Cpu, ChevronRight, RefreshCw, Eye, Brain
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

const reportTypes = [
  {
    id: 'full', label: 'Full Analysis Report',
    desc: 'Complete report with audit, EDA, visualizations, and insights',
    icon: BarChart3, color: '#6366f1', formats: ['PDF', 'PPTX'],
  },
  {
    id: 'executive', label: 'Executive Summary',
    desc: 'High-level business insights and key recommendations',
    icon: Sparkles, color: '#10b981', formats: ['PDF'],
  },
  {
    id: 'data', label: 'Data Quality Report',
    desc: 'Detailed data audit, cleaning suggestions, and quality scores',
    icon: Brain, color: '#3b82f6', formats: ['PDF', 'CSV'],
  },
];

export default function ReportsPage() {
  const { addNotification } = useApp();
  const [reports, setReports] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [rRes, wRes, dRes] = await Promise.all([
        fetch('/api/reports/'),
        fetch('/api/workflows/'),
        fetch('/api/datasets/'),
      ]);
      if (rRes.ok) setReports(await rRes.json());
      if (wRes.ok) setWorkflows(await wRes.json());
      if (dRes.ok) setDatasets(await dRes.json());
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
      const data = await res.json();
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
      addNotification('Download failed — backend may not be running', 'error');
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Generate and download AI-powered analysis reports
          </p>
        </div>
        <button onClick={() => setShowGenerator(p => !p)} className="btn-primary">
          <Plus size={16} /> Generate Report
        </button>
      </motion.div>

      {/* Generator Panel */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }} style={{ overflow: 'hidden' }}>
            <div className="glass-card p-5 space-y-4" style={{ borderLeft: '3px solid var(--accent)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Generate New Report
              </h3>

              {/* Report types */}
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Report Type</label>
                <div className="grid md:grid-cols-3 gap-3">
                  {reportTypes.map(rt => (
                    <div key={rt.id} className="glass-card p-4 cursor-pointer group">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                        style={{ background: `${rt.color}12` }}>
                        <rt.icon size={18} color={rt.color} />
                      </div>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{rt.label}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{rt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Select Workflow</label>
                  <select value={selectedWorkflow} onChange={e => setSelectedWorkflow(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    <option value="">Choose a workflow...</option>
                    {workflows.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.prompt?.slice(0, 50)} ({w.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Format</label>
                  <div className="flex gap-2">
                    {['pdf', 'pptx', 'html'].map(f => (
                      <button key={f}
                        onClick={() => setSelectedFormat(f)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase transition-all"
                        style={{
                          background: selectedFormat === f ? 'var(--accent)' : 'var(--bg-primary)',
                          color: selectedFormat === f ? 'white' : 'var(--text-muted)',
                          border: `1px solid ${selectedFormat === f ? 'var(--accent)' : 'var(--border)'}`,
                        }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button className="btn-secondary" onClick={() => setShowGenerator(false)}>Cancel</button>
                <button className="btn-primary" onClick={generateReport} disabled={generating}>
                  {generating ? <Loader size={15} className="animate-spin" /> : <FileText size={15} />}
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports list */}
      {loading ? (
        <div className="text-center py-20">
          <Loader size={28} className="animate-spin mx-auto mb-3" color="var(--accent)" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <motion.div key={r.id} {...fadeUp(i * 0.05)}
              className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-glow)' }}>
                <FileText size={18} color="var(--accent)" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {r.name || `Report #${r.id?.slice(0, 8)}`}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="badge badge-accent">{r.format?.toUpperCase()}</span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={10} /> {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-secondary text-xs py-1.5 px-3"
                  onClick={() => downloadReport(r.id, r.format)}>
                  <Download size={13} /> Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div {...fadeUp(0.2)} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent-glow)' }}>
            <FileText size={28} color="var(--accent)" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No reports yet</h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Run an AI analysis on a dataset, then generate a downloadable report here.
          </p>
          <button className="btn-primary" onClick={() => setShowGenerator(true)}>
            <Plus size={15} /> Generate First Report
          </button>
        </motion.div>
      )}
    </div>
  );
}
