"""Workflow and AgentLog models for tracking multi-agent analysis pipelines."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Float, Integer, ForeignKey
from database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)  # User's business question
    status = Column(String, default="pending")  # pending, running, completed, failed
    current_stage = Column(String, default="planning")  # planning, audit, cleaning, eda, visualization, insight, done
    progress = Column(Integer, default=0)  # 0-100
    execution_plan = Column(Text, default="{}")  # JSON: manager's plan
    audit_result = Column(Text, default="{}")  # JSON: audit agent output
    cleaning_result = Column(Text, default="{}")  # JSON: cleaning agent output
    eda_result = Column(Text, default="{}")  # JSON: EDA agent output
    visualization_result = Column(Text, default="{}")  # JSON: viz agent output
    insight_result = Column(Text, default="{}")  # JSON: insight agent output
    final_summary = Column(Text, nullable=True)  # Manager's combined summary
    confidence_score = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Workflow {self.id[:8]} - {self.status}>"


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False, index=True)
    agent_name = Column(String, nullable=False)  # manager, audit, cleaning, eda, visualization, insight
    action = Column(String, nullable=False)  # started, processing, completed, error
    message = Column(Text, nullable=True)
    details = Column(Text, default="{}")  # JSON: additional details
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AgentLog {self.agent_name} - {self.action}>"
