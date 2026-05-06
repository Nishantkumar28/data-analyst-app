# DataAnalystAI — Enterprise AI Multi-Agent Data Analytics Platform

An AI-powered full-stack web application where users upload datasets and receive automated data auditing, cleaning, EDA, visualizations, business insights, and downloadable reports — all orchestrated by a team of specialized AI agents.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)              │
│  Landing • Dashboard • Upload • Analytics • Chat │
├─────────────────────────────────────────────────┤
│                Backend (FastAPI)                  │
│  Auth • Datasets • Workflows • Chat • Reports    │
├─────────────────────────────────────────────────┤
│            Multi-Agent System                     │
│  Manager → Audit → Clean → EDA → Viz → Insight   │
├─────────────────────────────────────────────────┤
│           Data Layer                              │
│  SQLite/PostgreSQL • Redis • File Storage         │
└─────────────────────────────────────────────────┘
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # Edit with your OpenAI key
python main.py
```
Backend runs at: http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:3000

## AI Agents

| Agent | Role |
|-------|------|
| **Manager** | Orchestrates workflow, creates execution plans |
| **Audit** | Data quality inspection, health scoring |
| **Cleaning** | Automated imputation, type fixing, normalization |
| **EDA** | Statistics, correlations, distributions, patterns |
| **Visualization** | Chart generation, KPI cards, dashboards |
| **Insight** | Business intelligence, recommendations, summaries |

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Recharts, Framer Motion, Monaco Editor
- **Backend**: FastAPI, SQLAlchemy, Pandas, NumPy, Matplotlib, Plotly
- **AI**: OpenAI GPT-4o, LangGraph
- **Database**: SQLite (dev) / PostgreSQL (prod)
