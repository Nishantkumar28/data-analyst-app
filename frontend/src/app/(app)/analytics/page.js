'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import AgentProgress from '@/components/AgentProgress';
import ChartRenderer from '@/components/ChartRenderer';
import { Play, Brain, Code, Eye, FileText, Loader, Zap, ChevronDown, Check, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 }
};

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const { datasets, theme, addNotification } = useApp();
  const [selectedDataset, setSelectedDataset] = useState(searchParams.get('dataset') || '');
  const [prompt, setPrompt] = useState('');
  const [workflowId, setWorkflowId] = useState(searchParams.get('workflow') || null);
  const [workflow, setWorkflow] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [starting, setStarting] = useState(false);
  const [showDatasetMenu, setShowDatasetMenu] = useState(false);

  useEffect(() => {
    if (workflowId) {
      pollWorkflow(workflowId);
      const iv = setInterval(() => pollWorkflow(workflowId), 2000);
      return () => clearInterval(iv);
    }
  }, [workflowId]);

  async function pollWorkflow(id) {
    try {
      const res = await fetch(`/api/workflows/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data);
        if (['completed', 'failed'].includes(data.status)) return true;
      }
    } catch {}
    return false;
  }

  async function startAnalysis() {
    if (!selectedDataset || !prompt.trim() || starting) return;
    setStarting(true);
    try {
      const res = await fetch('/api/workflows/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: selectedDataset, prompt, agent_mode: 'auto' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setWorkflowId(data.workflow_id);
      addNotification('Analysis started successfully', 'success');
    } catch (e) {
      addNotification(e.message, 'error');
    }
    setStarting(false);
  }

  const activeDS = datasets.find(d => d.id === selectedDataset);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>AI Analytics</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Configure and monitor multi-agent data analysis pipelines</p>
        </div>
        
        {/* Setup Card */}
        <div className="glass-card" style={{ padding: 16, width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDatasetMenu(!showDatasetMenu)} style={{
              width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer'
            }}>
              {activeDS ? activeDS.name : 'Select a dataset to analyze...'}
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>
            {showDatasetMenu && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 50,
                background: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
              }}>
                {datasets.map(d => (
                  <button key={d.id} onClick={() => { setSelectedDataset(d.id); setShowDatasetMenu(false); }} style={{
                    width: '100%', padding: '10px 14px', background: selectedDataset === d.id ? 'var(--accent-subtle)' : 'transparent',
                    border: 'none', textAlign: 'left', color: selectedDataset === d.id ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: 13, cursor: 'pointer'
                  }}>{d.name}</button>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="E.g., Find revenue trends over time..."
              disabled={!!workflowId && workflow?.status === 'running'}
              style={{
                flex: 1, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 13
              }} />
            <button className="btn-primary" onClick={startAnalysis} disabled={!selectedDataset || !prompt.trim() || starting || (workflow?.status === 'running')}
              style={{ padding: '0 16px' }}>
              {starting ? <Loader size={16} className="animate-spin" /> : <Play size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!workflowId && !workflow ? (
          <motion.div key="empty" {...fadeUp} style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <Brain size={32} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Ready to Analyze</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
              Select a dataset and enter your analysis goal. The AI agents will automatically audit, clean, visualize, and extract insights.
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" {...fadeUp} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
            
            {/* Sidebar Workflow Progress */}
            <div style={{ position: 'sticky', top: 90 }}>
              <AgentProgress currentStage={workflow?.current_stage || 'planning'} progress={workflow?.progress || 0} status={workflow?.status || 'running'} />
            </div>

            {/* Results Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              
              {/* Tabs */}
              <div className="tab-list" style={{ alignSelf: 'flex-start' }}>
                {[
                  { id: 'insights', label: 'Insights', icon: Sparkles },
                  { id: 'visualizations', label: 'Visualizations', icon: Eye },
                  { id: 'code', label: 'Generated Code', icon: Code },
                  { id: 'audit', label: 'Audit Log', icon: FileText },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ minHeight: 400 }}>
                {activeTab === 'insights' && (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Business Insights</h3>
                    {workflow?.result?.insights ? (
                      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: workflow.result.insights }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', padding: 40, justifyContent: 'center' }}>
                        <Loader size={18} className="animate-spin" /> Waiting for Insight Agent...
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'visualizations' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-lg)' }}>
                    {workflow?.result?.visualizations?.length > 0 ? (
                      workflow.result.visualizations.map((chart, i) => <ChartRenderer key={i} chart={chart} />)
                    ) : (
                      <div className="glass-card" style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No visualizations generated yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card-solid)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>analysis.py</span>
                    </div>
                    <div style={{ height: 500 }}>
                      <Editor
                        height="100%"
                        language="python"
                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                        value={workflow?.result?.code || '# Code will appear here once EDA Agent generates it...'}
                        options={{ minimap: { enabled: false }, readOnly: true, fontSize: 13, fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Execution Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {workflow?.logs?.map((log, i) => (
                        <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--accent)' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.agent}: {log.message}
                        </div>
                      ))}
                      {!workflow?.logs?.length && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Logs will appear here as agents execute tasks.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 100 }}><Loader className="animate-spin" color="var(--accent)" /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
