'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, subtitle, change, icon: Icon, color = '#6366f1', delay = 0 }) {
  const isPositive = change > 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="kpi-card group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}>
          {Icon && <Icon size={20} color={color} />}
        </div>
        {!isNeutral && (
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
            style={{
              color: isPositive ? '#10b981' : '#ef4444',
              background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{title}</p>
      {subtitle && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      )}
    </motion.div>
  );
}
