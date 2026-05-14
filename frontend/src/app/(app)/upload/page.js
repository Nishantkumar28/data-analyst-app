'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  Upload, CheckCircle, AlertTriangle, Database,
  Columns, ArrowRight, Loader, Sparkles, ChevronRight, X
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
      addNotification(`"${data.name}" uploaded successfully!`, 'success');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Header */}
      <motion.div {...fadeUp()}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Upload Dataset</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Drop your file and let AI instantly profile, audit, and prepare it for analysis
        </p>
      </motion.div>

      {/* Upload Zone */}
      {!result && (
        <motion.div {...fadeUp(0.1)}>
          <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`} style={{ opacity: uploading ? 0.8 : 1 }}>
            <input {...getInputProps()} />

            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Loader size={24} color="var(--accent)" className="animate-spin" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Processing dataset...</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Detecting schema and running initial audit</p>
                </div>
                <div className="progress-bar" style={{ width: 240 }}>
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{Math.round(uploadProgress)}%</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <motion.div
                  animate={isDragActive ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                    background: isDragActive ? 'var(--accent-subtle)' : 'var(--bg-card-solid)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  <Upload size={24} color="var(--accent)" />
                </motion.div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {isDragActive ? 'Release to upload' : 'Drag & drop your dataset here'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>click to browse</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge" style={{ background: 'var(--info-subtle)', color: 'var(--info)' }}>.csv</span>
                  <span className="badge" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>.xlsx</span>
                  <span className="badge" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>.json</span>
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
            className="glass-card" style={{ padding: 16, borderLeft: '3px solid var(--danger)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertTriangle size={18} color="var(--danger)" style={{ marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)' }}>Upload Failed</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{error}</p>
            </div>
            <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="var(--text-muted)" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            
            {/* Success Card */}
            <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '3px solid var(--success)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={20} color="var(--success)" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{result.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {result.row_count?.toLocaleString()} rows • {result.column_count} columns • Score: {result.health_score?.toFixed(0)}/100
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" onClick={() => { setResult(null); setError(null); }}>Upload Another</button>
                <button className="btn-primary" onClick={() => router.push(`/analytics?dataset=${result.id}`)}>
                  <Sparkles size={14} /> Analyze <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Column Overview */}
            {result.columns_info && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Schema Overview</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Column</th><th>Type</th><th>Missing</th><th>Unique</th></tr></thead>
                    <tbody>
                      {Object.entries(result.columns_info).map(([col, info]) => (
                        <tr key={col}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{col}</td>
                          <td><span className="badge" style={{ background: info.is_numeric ? 'var(--info-subtle)' : 'var(--accent-subtle)', color: info.is_numeric ? 'var(--info)' : 'var(--accent)' }}>{info.dtype}</span></td>
                          <td style={{ color: info.missing_pct > 10 ? 'var(--danger)' : info.missing_pct > 0 ? 'var(--warning)' : 'var(--success)' }}>
                            {info.missing_pct}%
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{info.unique_count?.toLocaleString()}</td>
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
