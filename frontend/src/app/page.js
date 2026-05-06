'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Database, Brain, BarChart3, MessageSquare,
  Shield, Zap, Code, FileText, Upload, ChevronRight, Star
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };

const features = [
  { icon: Database, title: 'Smart Data Audit', desc: 'Automatically detect quality issues, outliers, and data type mismatches', color: '#3b82f6' },
  { icon: Sparkles, title: 'AI-Powered Cleaning', desc: 'Automated imputation, type fixing, text normalization, and feature engineering', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Deep EDA', desc: 'Statistical analysis, correlations, distributions, and pattern discovery', color: '#06b6d4' },
  { icon: Brain, title: 'Multi-Agent System', desc: '5 specialized AI agents collaborating under a Manager Agent', color: '#6366f1' },
  { icon: MessageSquare, title: 'Chat with Data', desc: 'Ask questions in natural language and get instant analytical answers', color: '#10b981' },
  { icon: Code, title: 'Code Transparency', desc: 'View, edit, and re-run all generated Python code with Monaco editor', color: '#f59e0b' },
];

const agents = [
  { name: 'Manager Agent', role: 'Orchestrates workflow, understands business goals', emoji: '🎯' },
  { name: 'Audit Agent', role: 'Inspects data quality, detects issues', emoji: '🔍' },
  { name: 'Cleaning Agent', role: 'Cleans, imputes, transforms data', emoji: '🧹' },
  { name: 'EDA Agent', role: 'Statistical analysis & pattern discovery', emoji: '📊' },
  { name: 'Visualization Agent', role: 'Creates charts & dashboards', emoji: '📈' },
  { name: 'Insight Agent', role: 'Generates business intelligence', emoji: '💡' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-1)' }}>
              <Sparkles size={16} color="white" />
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              DataAnalyst<span className="gradient-text">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#agents" className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI Agents</a>
            <a href="#how" className="text-sm" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
          </div>
          <Link href="/dashboard" className="btn-primary text-sm">
            Launch App <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />

        <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border-active)' }}>
            <Zap size={12} /> AI-Powered Multi-Agent Analytics
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
            Your AI Data
            <br />
            <span className="gradient-text">Analytics Team</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Upload any dataset. Ask questions in plain English. Get automated auditing, cleaning,
            EDA, visualizations, and actionable business insights — all powered by collaborative AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary text-base px-8 py-3">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link href="#how" className="btn-secondary text-base px-8 py-3">
              See How It Works
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-20 max-w-3xl mx-auto grid grid-cols-3 gap-6">
          {[
            { value: '6', label: 'AI Agents' },
            { value: '5', label: 'Analysis Stages' },
            { value: '∞', label: 'Insights' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Enterprise-Grade <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Everything you need from ChatGPT + Tableau + Power BI combined into one AI-native platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="glass-card p-6 group cursor-default">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15` }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Meet Your <span className="gradient-text">AI Team</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Six specialized AI agents work together like a professional data analytics team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="glass-card p-5 flex items-start gap-4">
                <span className="text-2xl">{a.emoji}</span>
                <div>
                  <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{a.name}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '1', title: 'Upload Your Data', desc: 'Drop any CSV, Excel, or JSON file. We instantly preview and profile it.', icon: Upload },
              { step: '2', title: 'Ask a Question', desc: '"Why are sales dropping?" — describe your business problem in plain English.', icon: MessageSquare },
              { step: '3', title: 'AI Agents Analyze', desc: '5 specialized agents audit, clean, analyze, visualize, and generate insights automatically.', icon: Brain },
              { step: '4', title: 'Get Results', desc: 'Interactive dashboards, executive summaries, downloadable reports, and actionable recommendations.', icon: BarChart3 },
            ].map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex items-start gap-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white"
                  style={{ background: 'var(--gradient-1)' }}>
                  {s.step}
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{s.title}</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to <span className="gradient-text">Transform</span> Your Data?
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Start analyzing your datasets with AI in seconds. No setup required.
          </p>
          <Link href="/dashboard" className="btn-primary text-base px-10 py-3.5">
            Launch DataAnalystAI <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} color="#6366f1" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>DataAnalystAI</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 DataAnalystAI. Enterprise AI Analytics Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
