'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, color = '#6366f1', delay = 0, change }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="kpi-card"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>
            {title}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {value ?? 0}
            </span>
            {change !== undefined && change !== null && (
              <span className="badge" style={{
                background: isPositive ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                color: isPositive ? 'var(--success)' : 'var(--danger)'
              }}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Icon size={20} color={color} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
