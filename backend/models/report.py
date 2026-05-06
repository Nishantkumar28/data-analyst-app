"""Report model for generated analysis reports."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    title = Column(String, nullable=False)
    report_type = Column(String, default="pdf")  # pdf, pptx, summary
    file_path = Column(String, nullable=True)
    content = Column(Text, default="{}")  # JSON: structured report content
    executive_summary = Column(Text, nullable=True)
    insights = Column(Text, default="[]")  # JSON: key insights list
    recommendations = Column(Text, default="[]")  # JSON: recommendations list
    kpis = Column(Text, default="[]")  # JSON: KPI data
    charts = Column(Text, default="[]")  # JSON: chart references
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.title}>"
