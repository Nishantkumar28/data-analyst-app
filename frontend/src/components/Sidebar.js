'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  LayoutDashboard, Upload, Brain, MessageSquare, FileText,
  Settings, Sun, Moon, ChevronLeft, ChevronRight,
  Sparkles, Menu, X
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload Data', icon: Upload },
  { href: '/analytics', label: 'AI Analytics', icon: Brain },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Sparkles size={17} color="white" />
        </div>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ overflow: 'hidden', minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              DataAnalyst<span className="gradient-text">AI</span>
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              Multi-Agent Platform
            </p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: sidebarOpen ? '10px 12px' : '10px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? 'white' : 'var(--text-secondary)',
                  background: active ? 'var(--accent)' : 'transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: sidebarOpen ? '10px 12px' : '10px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              borderRadius: 'var(--radius-md)',
              fontSize: 13, color: 'var(--text-secondary)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', width: '100%',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={() => setSidebarOpen(p => !p)}
            className="hidden md:flex"
            style={{
              alignItems: 'center', gap: 12,
              padding: sidebarOpen ? '10px 12px' : '10px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              borderRadius: 'var(--radius-md)',
              fontSize: 13, color: 'var(--text-secondary)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', width: '100%',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button className="md:hidden"
        onClick={() => setMobileOpen(p => !p)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 50,
          padding: 8, borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', cursor: 'pointer',
          backdropFilter: 'var(--blur)',
        }}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="md:hidden"
            style={{
              position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
              width: 260, background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border)',
            }}>
            <NavContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:block"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 30,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
        <NavContent />
      </motion.aside>
    </>
  );
}
