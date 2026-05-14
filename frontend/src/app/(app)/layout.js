'use client';
import { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Notifications from '@/components/Notifications';

function AppShell({ children }) {
  const { sidebarOpen } = useApp();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const marginLeft = isDesktop ? (sidebarOpen ? 240 : 72) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <Notifications />
      <main
        style={{
          marginLeft,
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh',
          padding: isDesktop ? '24px' : '64px 16px 16px',
        }}
      >
        {children}
      </main>
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
