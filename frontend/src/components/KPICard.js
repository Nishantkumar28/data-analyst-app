'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, color = '#6366f1', delay = 0, change, subtitle }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="kpi-card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-3 truncate" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {value ?? 0}
            </span>
            {change !== undefined && change !== null && (
              <span className="flex items-center gap-0.5 text-xs font-semibold"
                style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
                {isPositive
                  ? <TrendingUp size={11} />
                  : <TrendingDown size={11} />}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 transition-transform group-hover:scale-110"
          style={{ background: `${color}12` }}>
          {Icon && <Icon size={18} color={color} />}
        </div>
      </div>
    </motion.div>
  );
}
