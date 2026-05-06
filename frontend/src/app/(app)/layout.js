'use client';
import { AppProvider, useApp } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Notifications from '@/components/Notifications';
import { motion } from 'framer-motion';

function AppShell({ children }) {
  const { sidebarOpen } = useApp();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <Notifications />
      <motion.main
        animate={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? (sidebarOpen ? 240 : 72) : 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen p-4 md:p-6 pt-16 md:pt-6"
      >
        {children}
      </motion.main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
