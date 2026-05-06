'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, Circle, AlertCircle } from 'lucide-react';

const stages = [
  { key: 'planning', label: 'Planning', agent: 'Manager Agent' },
  { key: 'audit', label: 'Data Audit', agent: 'Audit Agent' },
  { key: 'cleaning', label: 'Data Cleaning', agent: 'Cleaning Agent' },
  { key: 'eda', label: 'Exploratory Analysis', agent: 'EDA Agent' },
  { key: 'visualization', label: 'Visualizations', agent: 'Visualization Agent' },
  { key: 'insight', label: 'Business Insights', agent: 'Insight Agent' },
  { key: 'done', label: 'Complete', agent: 'Manager Agent' },
];

export default function AgentProgress({ currentStage, progress = 0, status = 'running' }) {
  const currentIdx = stages.findIndex(s => s.key === currentStage);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Agent Workflow
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            color: status === 'completed' ? '#10b981' : status === 'failed' ? '#ef4444' : '#6366f1',
            background: status === 'completed' ? 'rgba(16,185,129,0.1)' : status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
          }}>
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-5">
        <motion.div className="progress-fill" animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }} />
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {stages.map((stage, i) => {
          let state = 'pending';
          if (i < currentIdx) state = 'completed';
          else if (i === currentIdx && status !== 'failed') state = 'running';
          if (status === 'completed') state = 'completed';
          if (status === 'failed' && i === currentIdx) state = 'error';

          const Icon = state === 'completed' ? CheckCircle
            : state === 'running' ? Loader
            : state === 'error' ? AlertCircle : Circle;

          return (
            <motion.div key={stage.key}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`agent-step ${state === 'running' ? 'active' : ''} ${state === 'completed' ? 'completed' : ''}`}>
              <div className={`agent-dot ${state}`}>
                {state === 'running' && (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-full h-full" />
                )}
              </div>
              <Icon size={16} className={state === 'running' ? 'animate-spin' : ''}
                color={state === 'completed' ? '#10b981' : state === 'running' ? '#6366f1' : state === 'error' ? '#ef4444' : 'var(--text-muted)'} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {stage.label}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {stage.agent}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
