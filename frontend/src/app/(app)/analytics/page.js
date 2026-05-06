'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import AgentProgress from '@/components/AgentProgress';
import ChartRenderer from '@/components/ChartRenderer';
import KPICard from '@/components/KPICard';
import {
  Brain, Play, Loader, Send, Database, BarChart3,
  Sparkles, FileText, Download, RefreshCw, ChevronDown
} from 'lucide-react';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const { activeDataset, setActiveDataset, addNotification, datasets, setDatasets } = useApp();
  const [prompt, setPrompt] = useState('');
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [tab, setTab] = useState('overview');
  const [datasetList, setDatasetList] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams?.get('dataset') || '');
  const pollRef = useRef(null);

  useEffect(() => {
    loadDatasets();
    const wfId = searchParams?.get('workflow');
    if (wfId) loadWorkflow(wfId);
  }, []);

  useEffect(() => {
    if (selectedDatasetId && !activeDataset) {
      fetch(`/api/datasets/${selectedDatasetId}`).then(r => r.json())
        .then(d => setActiveDataset(d)).catch(() => {});
    }
  }, [selectedDatasetId]);

  async function loadDatasets() {
    try {
      const res = await fetch('/api/datasets/');
      if (res.ok) { const d = await res.json(); setDatasetList(d); setDatasets(d); }
    } catch {}
  }

  async function loadWorkflow(id) {
    try {
      const res = await fetch(`/api/workflows/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data);
        if (data.status === 'running' || data.status === 'pending') startPolling(id);
      }
    } catch {}
  }

  function startPolling(id) {
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/workflows/${id}`);
        if (res.ok) {
          const data = await res.json();
          setWorkflow(data);
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(pollRef.current);
            setPolling(false);
            addNotification(
              data.status === 'completed' ? 'Analysis complete!' : 'Analysis failed',
              data.status === 'completed' ? 'success' : 'error'
            );
          }
        }
      } catch { clearInterval(pollRef.current); setPolling(false); }
    }, 2000);
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function startAnalysis() {
    if (!selectedDatasetId || !prompt.trim()) {
      addNotification('Select a dataset and enter a prompt', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/workflows/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: selectedDatasetId, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setWorkflow(data);
      startPolling(data.id);
      addNotification('Analysis started! AI agents are working...', 'info');
    } catch (e) {
      addNotification(e.message, 'error');
    }
    setLoading(false);
  }

  const auditResult = workflow?.audit_result || {};
  const cleaningResult = workflow?.cleaning_result || {};
  const edaResult = workflow?.eda_result || {};
  const vizResult = workflow?.visualization_result || {};
  const insightResult = workflow?.insight_result || {};

  const allCharts = [...(auditResult.charts || []), ...(edaResult.charts || []), ...(vizResult.charts || [])];
  const kpis = vizResult.kpis || [];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'audit', label: 'Audit' },
    { key: 'eda', label: 'EDA' },
    { key: 'charts', label: 'Charts' },
    { key: 'insights', label: 'Insights' },
    { key: 'logs', label: 'Logs' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          AI Analytics Workspace
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Multi-agent analysis pipeline
        </p>
      </motion.div>

      {/* Input Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4">
        {/* Dataset Select */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            Select Dataset
          </label>
          <select value={selectedDatasetId} onChange={e => setSelectedDatasetId(e.target.value)}
            className="w-full p-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="">Choose a dataset...</option>
            {datasetList.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.row_count?.toLocaleString()} rows)</option>
            ))}
          </select>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            What would you like to analyze?
          </label>
          <div className="flex gap-3">
            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., Why are sales decreasing? Find customer churn reasons..."
              className="flex-1 p-2.5 rounded-xl text-sm"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              onKeyDown={e => e.key === 'Enter' && startAnalysis()} />
            <button onClick={startAnalysis} disabled={loading || polling}
              className="btn-primary whitespace-nowrap">
              {loading ? <Loader size={16} className="animate-spin" /> : <Play size={16} />}
              {loading ? 'Starting...' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="flex flex-wrap gap-2">
          {['Explain what this dataset tells about my business',
            'Find anomalies and patterns',
            'Identify key drivers and correlations',
            'Generate comprehensive report',
          ].map((s, i) => (
            <button key={i} onClick={() => setPrompt(s)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results Area */}
      {workflow && (
        <div className="grid lg:grid-cols-4 gap-5">
          {/* Sidebar: Agent Progress */}
          <div className="lg:col-span-1">
            <AgentProgress currentStage={workflow.current_stage} progress={workflow.progress} status={workflow.status} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-5">
            {/* Tabs */}
            <div className="tab-list overflow-x-auto">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`tab-item whitespace-nowrap ${tab === t.key ? 'active' : ''}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                {tab === 'overview' && (
                  <div className="space-y-5">
                    {/* Final Summary */}
                    {workflow.final_summary && (
                      <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                          <Sparkles size={16} className="inline mr-2" color="#6366f1" />Analysis Summary
                        </h3>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                          {workflow.final_summary}
                        </div>
                      </div>
                    )}
                    {/* KPIs */}
                    {kpis.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {kpis.slice(0, 6).map((k, i) => (
                          <KPICard key={i} title={k.title} value={k.value} subtitle={k.subtitle}
                            change={k.change} color="#6366f1" delay={i * 0.05} />
                        ))}
                      </div>
                    )}
                    {/* Top Charts */}
                    {allCharts.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {allCharts.slice(0, 4).map((c, i) => <ChartRenderer key={i} chart={c} />)}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'audit' && (
                  <div className="space-y-4">
                    {auditResult.summary && (
                      <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Audit Summary</h3>
                        <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{auditResult.summary}</div>
                      </div>
                    )}
                    {auditResult.issues?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Issues Found</h3>
                        <div className="space-y-2">
                          {auditResult.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  background: issue.severity === 'high' ? 'rgba(239,68,68,0.1)' : issue.severity === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                  color: issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#f59e0b' : '#10b981',
                                }}>{issue.severity}</span>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{issue.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(auditResult.charts || []).map((c, i) => <ChartRenderer key={i} chart={c} />)}
                  </div>
                )}

                {tab === 'eda' && (
                  <div className="space-y-4">
                    {edaResult.findings?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Key Findings</h3>
                        <ul className="space-y-2">
                          {edaResult.findings.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <span className="text-[var(--accent)] mt-1">•</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      {(edaResult.charts || []).map((c, i) => <ChartRenderer key={i} chart={c} />)}
                    </div>
                  </div>
                )}

                {tab === 'charts' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {allCharts.length > 0 ? allCharts.map((c, i) => <ChartRenderer key={i} chart={c} />) : (
                      <div className="col-span-2 text-center py-16 glass-card">
                        <BarChart3 size={32} color="var(--text-muted)" className="mx-auto mb-3" />
                        <p style={{ color: 'var(--text-muted)' }}>Charts will appear here after analysis</p>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'insights' && (
                  <div className="space-y-4">
                    {insightResult.executive_summary && (
                      <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Executive Summary</h3>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {insightResult.executive_summary}
                        </div>
                      </div>
                    )}
                    {insightResult.insights?.map((insight, i) => (
                      <div key={i} className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                            {insight.category}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Confidence: {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{insight.title}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insight.description}</p>
                      </div>
                    ))}
                    {insightResult.recommendations?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recommendations</h3>
                        {insightResult.recommendations.map((r, i) => (
                          <div key={i} className="flex items-start gap-3 mb-3">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-0.5"
                              style={{ background: r.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                       color: r.priority === 'high' ? '#ef4444' : '#f59e0b' }}>
                              {r.priority}
                            </span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.action}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.rationale}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'logs' && (
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Agent Logs</h3>
                    <div className="space-y-2 font-mono text-xs">
                      {(workflow.agent_logs || []).map((log, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                          <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                            style={{ background: log.action === 'completed' ? '#10b981' : log.action === 'error' ? '#ef4444' : '#6366f1' }} />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold" style={{ color: 'var(--accent)' }}>[{log.agent_name}]</span>
                            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
                            {log.duration_ms && <span className="ml-2" style={{ color: 'var(--text-muted)' }}>({log.duration_ms}ms)</span>}
                          </div>
                        </div>
                      ))}
                      {(!workflow.agent_logs || workflow.agent_logs.length === 0) && (
                        <p style={{ color: 'var(--text-muted)' }}>Logs will appear as agents execute...</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!workflow && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center py-20">
          <Brain size={48} color="var(--text-muted)" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Ready to Analyze
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Select a dataset and describe your business question. Our AI agents will automatically
            audit, clean, analyze, visualize, and generate insights.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader className="animate-spin" size={24} color="var(--accent)" /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
