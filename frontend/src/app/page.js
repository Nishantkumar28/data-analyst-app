'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Database, Brain, BarChart3, MessageSquare,
  Shield, Zap, Code, FileText, Upload, ChevronRight, Star,
  Layers, GitBranch, Cpu, Eye, TrendingUp, PieChart
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, delay },
});

const features = [
  { icon: Database, title: 'Smart Data Audit', desc: 'Automatically detect quality issues, outliers, missing values, and data type mismatches across your entire dataset.', color: '#3b82f6' },
  { icon: Sparkles, title: 'AI-Powered Cleaning', desc: 'Automated imputation, type correction, text normalization, outlier handling, and intelligent feature engineering.', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Deep EDA', desc: 'Statistical analysis, correlation matrices, distribution profiling, and automated pattern discovery.', color: '#06b6d4' },
  { icon: Brain, title: 'Multi-Agent System', desc: '6 specialized AI agents collaborating under a Manager Agent to deliver enterprise-grade analytics.', color: '#6366f1' },
  { icon: MessageSquare, title: 'Chat with Data', desc: 'Ask questions in natural language and receive instant, context-aware analytical answers with charts.', color: '#10b981' },
  { icon: Code, title: 'Code Transparency', desc: 'View, edit, and re-run all generated Python code in a built-in Monaco editor with full control.', color: '#f59e0b' },
];

const agents = [
  { name: 'Manager Agent', role: 'Orchestrates the entire workflow, understands your business goals, and coordinates all agents.', emoji: '🎯', color: '#6366f1' },
  { name: 'Audit Agent', role: 'Deep inspection of data quality — missing values, duplicates, outliers, type mismatches.', emoji: '🔍', color: '#3b82f6' },
  { name: 'Cleaning Agent', role: 'Automated data preprocessing — imputation, normalization, type fixing, feature engineering.', emoji: '🧹', color: '#10b981' },
  { name: 'EDA Agent', role: 'Statistical analysis, correlations, distributions, trend detection, and pattern discovery.', emoji: '📊', color: '#06b6d4' },
  { name: 'Visualization Agent', role: 'Creates interactive charts, KPI dashboards, heatmaps, and publication-ready visuals.', emoji: '📈', color: '#f59e0b' },
  { name: 'Insight Agent', role: 'Generates business intelligence, executive summaries, and actionable recommendations.', emoji: '💡', color: '#ec4899' },
];

const steps = [
  { step: '01', title: 'Upload Your Data', desc: 'Drag & drop any CSV, Excel, or JSON file. We instantly profile it — detecting columns, types, missing values, and quality score.', icon: Upload, color: '#3b82f6' },
  { step: '02', title: 'Describe Your Goal', desc: '"Why are sales dropping?" — describe your business problem in plain English. Our Manager Agent creates an execution plan.', icon: MessageSquare, color: '#8b5cf6' },
  { step: '03', title: 'AI Agents Analyze', desc: '6 specialized agents audit, clean, analyze, visualize, and generate insights automatically in a coordinated pipeline.', icon: Brain, color: '#6366f1' },
  { step: '04', title: 'Get Actionable Results', desc: 'Interactive dashboards, executive summaries, downloadable PDF/PPTX reports, and prioritized business recommendations.', icon: TrendingUp, color: '#10b981' },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative max-w-5xl mx-auto mt-16"
    >
      {/* Glow behind */}
      <div className="absolute -inset-4 rounded-3xl opacity-30"
        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

      {/* Browser frame */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
          </div>
          <div className="flex-1 mx-8">
            <div className="mx-auto max-w-sm h-6 rounded-lg flex items-center justify-center text-xs"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
              localhost:3000/dashboard
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-4 gap-4" style={{ background: 'var(--bg-primary)' }}>
          {/* Sidebar mock */}
          <div className="col-span-1 space-y-3 hidden md:block">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg" style={{ background: 'var(--gradient-1)' }} />
              <div className="h-3 rounded" style={{ width: 80, background: 'var(--bg-card)' }} />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg"
                style={{ background: i === 1 ? 'var(--accent)' : 'transparent' }}>
                <div className="w-4 h-4 rounded" style={{ background: i === 1 ? 'rgba(255,255,255,0.3)' : 'var(--bg-card)' }} />
                <div className="h-2.5 rounded" style={{ width: 60 + i * 8, background: i === 1 ? 'rgba(255,255,255,0.3)' : 'var(--bg-card)' }} />
              </div>
            ))}
          </div>

          {/* Main content mock */}
          <div className="col-span-4 md:col-span-3 space-y-4">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3">
              {['#3b82f6', '#6366f1', '#10b981', '#f59e0b'].map((c, i) => (
                <motion.div key={i} className="rounded-xl p-3 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.1 }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: c }} />
                  <div className="w-6 h-6 rounded-lg mb-2" style={{ background: `${c}20` }} />
                  <div className="h-5 w-12 rounded mb-1" style={{ background: 'var(--bg-card-hover)' }} />
                  <div className="h-2 w-16 rounded" style={{ background: 'var(--bg-card-hover)' }} />
                </motion.div>
              ))}
            </div>

            {/* Chart area */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div className="rounded-xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.8 }}>
                <div className="h-2.5 w-24 rounded mb-3" style={{ background: 'var(--bg-card-hover)' }} />
                <div className="flex items-end gap-1.5 h-20">
                  {[40, 65, 45, 80, 55, 70, 60, 90, 50, 75].map((h, i) => (
                    <motion.div key={i} className="flex-1 rounded-t"
                      style={{ background: `rgba(99,102,241,${0.3 + (h / 100) * 0.7})` }}
                      initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }} transition={{ delay: 1 + i * 0.05 }} />
                  ))}
                </div>
              </motion.div>
              <motion.div className="rounded-xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.9 }}>
                <div className="h-2.5 w-20 rounded mb-3" style={{ background: 'var(--bg-card-hover)' }} />
                <div className="flex items-center justify-center h-20">
                  <div className="w-16 h-16 rounded-full" style={{
                    background: `conic-gradient(#6366f1 0% 35%, #3b82f6 35% 60%, #10b981 60% 80%, #f59e0b 80% 100%)`,
                    mask: 'radial-gradient(circle at center, transparent 40%, black 41%)',
                    WebkitMask: 'radial-gradient(circle at center, transparent 40%, black 41%)',
                  }} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
            <a href="#features" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#agents" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>AI Agents</a>
            <a href="#how" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
          </div>
          <Link href="/dashboard" className="btn-primary text-sm">
            Launch App <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-8 px-6 text-center overflow-hidden">
        <FloatingParticles />

        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 60%)' }} />
        <div className="absolute top-60 left-[20%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 60%)' }} />
        <div className="absolute top-40 right-[15%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 60%)' }} />

        <motion.div {...fadeUp(0)} className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border-active)' }}>
            <Zap size={12} /> AI-Powered Multi-Agent Analytics Platform
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Your AI Data
            <br />
            <span className="gradient-text">Analytics Team</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Upload any dataset. Ask questions in plain English. Get automated auditing, cleaning,
            EDA, visualizations, and actionable business insights — powered by 6 collaborative AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5 shadow-lg" style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <a href="#how" className="btn-secondary text-base px-8 py-3.5">
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.2)}
          className="mt-16 max-w-2xl mx-auto grid grid-cols-3 gap-6">
          {[
            { value: '6', label: 'AI Agents', icon: Cpu },
            { value: '5', label: 'Analysis Stages', icon: GitBranch },
            { value: '∞', label: 'Insights', icon: Eye },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs md:text-sm mt-1 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <s.icon size={12} /> {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <DashboardMockup />
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>FEATURES</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Enterprise-Grade <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Everything you need from ChatGPT + Tableau + Power BI combined into one AI-native platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="glass-card p-6 group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}12` }}>
                  <f.icon size={22} color={f.color} />
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
      <section id="agents" className="py-24 px-6 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.3), transparent)' }} />

        <div className="max-w-5xl mx-auto relative">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>AI TEAM</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Meet Your <span className="gradient-text">AI Team</span>
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Six specialized AI agents working together like a professional data analytics team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="glass-card p-5 flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${a.color}12` }}>
                  {a.emoji}
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{a.name}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>WORKFLOW</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line connector */}
            <div className="absolute left-[23px] top-0 bottom-0 w-px hidden md:block"
              style={{ background: 'linear-gradient(to bottom, var(--border), var(--accent), var(--border))' }} />

            <div className="space-y-6">
              {steps.map((s, i) => (
                <motion.div key={i} {...fadeUp(i * 0.1)}
                  className="glass-card p-6 flex items-start gap-5 md:ml-12 relative">
                  {/* Connector dot */}
                  <div className="absolute -left-[46px] top-8 w-3 h-3 rounded-full hidden md:block"
                    style={{ background: s.color, boxShadow: `0 0 12px ${s.color}50` }} />

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                    style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}>
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>{s.title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Built With Modern Technology</h3>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'FastAPI', 'Python', 'OpenAI GPT-4', 'Pandas', 'Recharts', 'SQLAlchemy', 'LangGraph'].map((tech, i) => (
              <motion.span key={i} {...fadeUp(i * 0.04)}
                className="text-xs font-medium px-4 py-2 rounded-full"
                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3), transparent 70%)' }} />

        <motion.div {...fadeUp()} className="max-w-2xl mx-auto relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to <span className="gradient-text">Transform</span> Your Data?
          </h2>
          <p className="text-base md:text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
            Start analyzing your datasets with AI in seconds. No credit card. No setup. Just upload and ask.
          </p>
          <Link href="/dashboard" className="btn-primary text-base px-10 py-4 shadow-lg" style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}>
            Launch DataAnalystAI <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--gradient-1)' }}>
              <Sparkles size={12} color="white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>DataAnalystAI</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 DataAnalystAI. Enterprise AI Analytics Platform. Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
