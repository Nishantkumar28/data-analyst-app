'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle,
  Database, Columns, ArrowRight, X, Loader, FileText
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { addNotification, setActiveDataset } = useApp();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/datasets/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || 'Upload failed');

      setResult(data);
      setActiveDataset(data);
      addNotification(`Dataset "${data.name}" uploaded successfully!`, 'success');
    } catch (e) {
      setError(e.message);
      addNotification(e.message, 'error');
    } finally {
      setUploading(false);
    }
  }, [addNotification, setActiveDataset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/json': ['.json'] },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Upload Dataset</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Drop your CSV, Excel, or JSON file to start AI-powered analysis
        </p>
      </motion.div>

      {/* Upload Zone */}
      {!result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'active' : ''}`}
            style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader size={40} color="var(--accent)" className="animate-spin" />
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Processing your dataset...</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Parsing columns, detecting types, calculating statistics</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--accent-glow)' }}>
                  <Upload size={28} color="var(--accent)" />
                </div>
                <div>
                  <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your dataset'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    or click to browse • CSV, Excel, JSON • Up to 500MB
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  {['CSV', 'XLSX', 'JSON'].map(t => (
                    <span key={t} className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      .{t.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-4 flex items-start gap-3" style={{ borderLeft: '3px solid #ef4444' }}>
          <AlertTriangle size={18} color="#ef4444" />
          <div>
            <p className="text-sm font-medium" style={{ color: '#ef4444' }}>Upload Failed</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Success Header */}
            <div className="glass-card p-5 flex items-center gap-4" style={{ borderLeft: '3px solid #10b981' }}>
              <CheckCircle size={24} color="#10b981" />
              <div className="flex-1">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {result.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {result.row_count?.toLocaleString()} rows × {result.column_count} columns •
                  Health: {result.health_score?.toFixed(0)}/100
                </p>
              </div>
              <button className="btn-primary" onClick={() => router.push(`/analytics?dataset=${result.id}`)}>
                Start Analysis <ArrowRight size={14} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Rows', value: result.row_count?.toLocaleString(), icon: Database, color: '#3b82f6' },
                { label: 'Columns', value: result.column_count, icon: Columns, color: '#6366f1' },
                { label: 'Health Score', value: `${result.health_score?.toFixed(0)}/100`, icon: CheckCircle, color: '#10b981' },
                { label: 'Missing', value: `${result.summary_stats?.total_missing_pct || 0}%`, icon: AlertTriangle, color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="glass-card p-4 flex items-center gap-3">
                  <s.icon size={18} color={s.color} />
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column Info */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Column Overview</h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Column</th><th>Type</th><th>Missing</th><th>Unique</th><th>Sample Values</th></tr></thead>
                  <tbody>
                    {Object.entries(result.columns_info || {}).map(([col, info]) => (
                      <tr key={col}>
                        <td className="font-medium">{col}</td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded-md"
                            style={{ background: info.is_numeric ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                                     color: info.is_numeric ? '#3b82f6' : '#8b5cf6' }}>
                            {info.dtype}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: info.missing_pct > 10 ? '#ef4444' : info.missing_pct > 0 ? '#f59e0b' : '#10b981' }}>
                            {info.missing_pct}%
                          </span>
                        </td>
                        <td>{info.unique_count}</td>
                        <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {info.sample_values?.slice(0, 3).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preview */}
            {result.preview_data?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Data Preview (first {result.preview_data.length} rows)
                </h3>
                <div className="overflow-x-auto max-h-80">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {Object.keys(result.preview_data[0]).map(col => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
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

            {/* Upload another */}
            <div className="text-center">
              <button className="btn-secondary" onClick={() => { setResult(null); setError(null); }}>
                Upload Another Dataset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
