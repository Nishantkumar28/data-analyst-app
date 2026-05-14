'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Notifications from '@/components/Notifications';
import { AppProvider } from '@/lib/store';

export default function AppLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  if (!mounted) return null;

  return (
    <AppProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main style={{
          flex: 1, marginLeft: 240, padding: '32px', minHeight: '100vh',
          transition: 'margin-left 0.2s ease', overflowX: 'hidden'
        }} className="md:ml-[240px] ml-0">
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 768px) {
              main { margin-left: 0 !important; padding: 16px !important; padding-top: 64px !important; }
            }
          `}} />
          {children}
        </main>
        <Notifications />
      </div>
    </AppProvider>
  );
}
