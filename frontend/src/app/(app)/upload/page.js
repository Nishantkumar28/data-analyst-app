'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  Upload, CheckCircle, AlertTriangle, Database,
  Columns, ArrowRight, Loader, FileText, BarChart3,
  Sparkles, Brain, ChevronRight, X
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function UploadPage() {
  const router = useRouter();
  const { addNotification, setActiveDataset } = useApp();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    setResult(null);
    setUploadProgress(0);

    // Animate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(p + Math.random() * 15, 85));
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/datasets/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      clearInterval(progressInterval);
      setUploadProgress(100);
      await new Promise(r => setTimeout(r, 400));
      setResult(data);
      setActiveDataset(data);
      addNotification(`"${data.name}" uploaded & profiled!`, 'success');
    } catch (e) {
      clearInterval(progressInterval);
      setError(e.message);
      addNotification(e.message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [addNotification, setActiveDataset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/json': ['.json'] },
    disabled: uploading,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp()}>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Upload Dataset</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Drop your file and let AI instantly profile, audit, and prepare it for analysis
        </p>
      </motion.div>

      {/* How it works mini */}
      {!result && (
        <motion.div {...fadeUp(0.05)}>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Upload, label: 'Upload File', color: '#3b82f6' },
              { icon: Database, label: 'Profile Data', color: '#6366f1' },
              { icon: BarChart3, label: 'Quality Score', color: '#10b981' },
              { icon: Brain, label: 'AI Analysis', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ background: `${s.color}12`, color: s.color }}>
                  <s.icon size={11} /> {s.label}
                </div>
                {i < 3 && <ChevronRight size={12} color="var(--text-muted)" />}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload Zone */}
      {!result && (
        <motion.div {...fadeUp(0.1)}>
          <div {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'active' : ''}`}
            style={{ opacity: uploading ? 0.9 : 1 }}>
            <input {...getInputProps()} />

            {uploading ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--accent-glow)' }}>
                    <Loader size={28} color="var(--accent)" className="animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Processing your dataset...
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Detecting types · Calculating stats · Scoring quality
                  </p>
                </div>
                <div className="w-64 progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--accent)' }}>{Math.round(uploadProgress)}%</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  animate={isDragActive ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: isDragActive ? 'rgba(99,102,241,0.2)' : 'var(--accent-glow)' }}>
                  <Upload size={28} color="var(--accent)" />
                </motion.div>
                <div className="text-center">
                  <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {isDragActive ? 'Release to upload' : 'Drag & drop your dataset here'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    or <span style={{ color: 'var(--accent)' }}>click to browse</span> · Up to 500MB
                  </p>
                </div>
                <div className="flex gap-2">
                  {[
                    { ext: '.csv', color: '#10b981' },
                    { ext: '.xlsx', color: '#3b82f6' },
                    { ext: '.json', color: '#f59e0b' },
                  ].map(({ ext, color }) => (
                    <span key={ext} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-4 flex items-start gap-3" style={{ borderLeft: '3px solid #ef4444' }}>
            <AlertTriangle size={18} color="#ef4444" className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>Upload Failed</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
            <button onClick={() => setError(null)}><X size={16} color="var(--text-muted)" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Success header */}
            <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{ borderLeft: '3px solid #10b981' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.1)' }}>
                <CheckCircle size={22} color="#10b981" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {result.name}
                </h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {result.row_count?.toLocaleString()} rows · {result.column_count} columns · Health score: {result.health_score?.toFixed(0)}/100
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-secondary text-xs" onClick={() => { setResult(null); setError(null); }}>
                  Upload Another
                </button>
                <button className="btn-primary text-xs" onClick={() => router.push(`/analytics?dataset=${result.id}`)}>
                  <Sparkles size={13} /> Analyze Now <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Rows', value: result.row_count?.toLocaleString(), icon: Database, color: '#3b82f6' },
                { label: 'Columns', value: result.column_count, icon: Columns, color: '#6366f1' },
                { label: 'Health Score', value: `${result.health_score?.toFixed(0)}/100`, icon: CheckCircle, color: '#10b981' },
                { label: 'Missing Data', value: `${result.summary_stats?.total_missing_pct || 0}%`, icon: AlertTriangle, color: '#f59e0b' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}12` }}>
                    <s.icon size={17} color={s.color} />
                  </div>
                  <div>
                    <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Column overview */}
            {result.columns_info && Object.keys(result.columns_info).length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Column Overview
                  <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    {result.column_count} columns
                  </span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>Column</th><th>Type</th><th>Missing</th><th>Unique</th><th>Sample Values</th></tr></thead>
                    <tbody>
                      {Object.entries(result.columns_info).map(([col, info]) => (
                        <tr key={col}>
                          <td className="font-semibold">{col}</td>
                          <td>
                            <span className="badge" style={{
                              background: info.is_numeric ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                              color: info.is_numeric ? '#3b82f6' : '#8b5cf6'
                            }}>
                              {info.dtype}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: info.missing_pct > 10 ? '#ef4444' : info.missing_pct > 0 ? '#f59e0b' : '#10b981' }}>
                              {info.missing_pct}%
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{info.unique_count?.toLocaleString()}</td>
                          <td className="text-xs" style={{ color: 'var(--text-muted)', maxWidth: 180 }}>
                            {info.sample_values?.slice(0, 3).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Data preview */}
            {result.preview_data?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Data Preview
                  <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    first {Math.min(result.preview_data.length, 15)} rows
                  </span>
                </h3>
                <div className="overflow-auto max-h-80">
                  <table className="data-table">
                    <thead>
                      <tr>{Object.keys(result.preview_data[0]).map(col => <th key={col}>{col}</th>)}</tr>
                    </thead>
                    <tbody>
                      {result.preview_data.slice(0, 15).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="whitespace-nowrap">{String(val ?? '—').slice(0, 40)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
