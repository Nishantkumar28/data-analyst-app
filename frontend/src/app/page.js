'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Database, Brain, BarChart3, MessageSquare,
  Zap, Code, Upload, ChevronRight, Cpu, GitBranch, Eye
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, delay },
});

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ─── Navigation ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-card)', backdropFilter: 'var(--blur)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
            DataAnalyst<span className="gradient-text">AI</span>
          </span>
        </div>
        <div className="hidden md:flex" style={{ gap: 32 }}>
          <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Features</a>
          <a href="#agents" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>AI Agents</a>
          <a href="#how" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>How It Works</a>
        </div>
        <Link href="/dashboard" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
          Launch App <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ─── Hero Section ─── */}
      <section style={{
        paddingTop: '160px', paddingBottom: '80px', paddingLeft: 24, paddingRight: 24,
        textAlign: 'center', position: 'relative', overflow: 'hidden', flex: 1
      }}>
        
        {/* Background Glows */}
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <motion.div {...fadeUp(0)} style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent-subtle)', border: '1px solid var(--border-active)',
            color: 'var(--accent)', fontSize: 13, fontWeight: 600, marginBottom: 32
          }}>
            <Zap size={14} /> Modern AI SaaS for Data Analytics
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 24
          }}>
            Your Autonomous Data <br />
            <span className="gradient-text">Analytics Team</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
            maxWidth: 680, margin: '0 auto 48px auto', lineHeight: 1.6
          }}>
            Clean interfaces. Powerful insights. Upload any dataset and let our multi-agent AI system perform auditing, cleaning, EDA, and visualization automatically.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15, borderRadius: 'var(--radius-lg)' }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <a href="#how" className="btn-secondary" style={{ padding: '14px 32px', fontSize: 15, borderRadius: 'var(--radius-lg)' }}>
              See How It Works
            </a>
          </div>

        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.2)} style={{
          display: 'flex', justifyContent: 'center', gap: 'clamp(32px, 8vw, 80px)',
          marginTop: 80, position: 'relative', zIndex: 1, flexWrap: 'wrap'
        }}>
          {[
            { value: '6', label: 'AI Agents', icon: Cpu },
            { value: '5', label: 'Analysis Stages', icon: GitBranch },
            { value: '∞', label: 'Deep Insights', icon: Eye },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div className="gradient-text" style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, marginTop: 8 }}>
                <s.icon size={14} /> {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" style={{ padding: '100px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              Enterprise-Grade <span className="gradient-text">Features</span>
            </h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              A clean, minimal interface packed with powerful AI capabilities.
            </p>
          </motion.div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24
          }}>
            {[
              { icon: Database, title: 'Smart Data Audit', desc: 'Automatically detect quality issues, outliers, and missing values.', color: 'var(--info)' },
              { icon: Sparkles, title: 'AI-Powered Cleaning', desc: 'Automated imputation, text normalization, and feature engineering.', color: 'var(--accent)' },
              { icon: BarChart3, title: 'Deep EDA', desc: 'Statistical analysis, correlation matrices, and automated pattern discovery.', color: 'var(--success)' },
              { icon: Brain, title: 'Multi-Agent System', desc: '6 specialized AI agents collaborating to deliver perfect analytics.', color: 'var(--warning)' },
              { icon: MessageSquare, title: 'Chat with Data', desc: 'Ask questions in natural language and receive context-aware answers.', color: 'var(--danger)' },
              { icon: Code, title: 'Code Transparency', desc: 'View and edit all generated Python code in a built-in editor.', color: 'var(--info)' },
            ].map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="glass-card" style={{ padding: 32 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24, border: '1px solid var(--border)'
                }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        padding: '32px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 'var(--radius-sm)',
            background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={12} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>DataAnalystAI</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2026 DataAnalystAI. Modern AI SaaS.
        </p>
      </footer>

    </div>
  );
}
