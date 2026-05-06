'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import {
  LayoutDashboard, Upload, Brain, MessageSquare, FileText,
  Settings, Sun, Moon, ChevronLeft, ChevronRight, Database,
  Sparkles, Menu, X, Bell
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gradient-1)' }}>
          <Sparkles size={18} color="white" />
        </div>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="overflow-hidden">
            <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              DataAnalyst<span className="gradient-text">AI</span>
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Multi-Agent Platform
            </p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                color: active ? 'white' : 'var(--text-secondary)',
                background: active ? 'var(--accent)' : 'transparent',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--accent-glow)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--border)] space-y-2">
        <button onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={() => setSidebarOpen(p => !p)}
          className="hidden md:flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass"
        onClick={() => setMobileOpen(p => !p)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px]"
            style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
            <NavContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.2 }}
        className="hidden md:block fixed left-0 top-0 bottom-0 z-30"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <NavContent />
      </motion.aside>
    </>
  );
}
