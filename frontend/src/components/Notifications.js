'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const icons = {
  success: CheckCircle, warning: AlertTriangle, info: Info, error: XCircle,
};
const colors = {
  success: '#10b981', warning: '#f59e0b', info: '#6366f1', error: '#ef4444',
};

export default function Notifications() {
  const { notifications } = useApp();
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map(n => {
          const Icon = icons[n.type] || Info;
          return (
            <motion.div key={n.id}
              initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }} transition={{ type: 'spring', damping: 20 }}
              className="glass-card flex items-start gap-3 p-4 shadow-lg"
              style={{ borderLeft: `3px solid ${colors[n.type]}` }}>
              <Icon size={18} color={colors[n.type]} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.msg}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
