"""
Reports API routes: generate and download analysis reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.report import Report
from models.workflow import Workflow
from utils.helpers import safe_json_loads

router = APIRouter(prefix="/reports", tags=["Reports"])


class ReportRequest(BaseModel):
    workflow_id: str
    report_type: str = "pdf"  # pdf, pptx, summary
    title: Optional[str] = None


@router.post("/generate")
async def generate_report(req: ReportRequest, db: AsyncSession = Depends(get_db)):
    """Generate a report from workflow results."""
    from services.report_generator import generate_report as gen_report

    # Get workflow
    result = await db.execute(select(Workflow).where(Workflow.id == req.workflow_id))
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if workflow.status != "completed":
        raise HTTPException(status_code=400, detail="Workflow not yet completed")

    try:
        report_data = await gen_report(workflow, req.report_type)

        report = Report(
            workflow_id=workflow.id,
            user_id="demo-user",
            dataset_id=workflow.dataset_id,
            title=req.title or f"Analysis Report - {workflow.prompt[:50]}",
            report_type=req.report_type,
            file_path=report_data.get("file_path"),
            content=str(report_data.get("content", {})),
            executive_summary=report_data.get("executive_summary", ""),
            insights=str(report_data.get("insights", [])),
            recommendations=str(report_data.get("recommendations", [])),
        )
        db.add(report)
        await db.flush()

        return {
            "id": report.id,
            "title": report.title,
            "report_type": report.report_type,
            "file_path": report.file_path,
            "executive_summary": report.executive_summary,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/")
async def list_reports(db: AsyncSession = Depends(get_db)):
    """List all generated reports."""
    result = await db.execute(
        select(Report)
        .where(Report.user_id == "demo-user")
        .order_by(desc(Report.created_at))
    )
    reports = result.scalars().all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "report_type": r.report_type,
            "workflow_id": r.workflow_id,
            "created_at": str(r.created_at),
        }
        for r in reports
    ]


@router.get("/{report_id}")
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Get report details."""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": report.id,
        "title": report.title,
        "report_type": report.report_type,
        "executive_summary": report.executive_summary,
        "insights": safe_json_loads(report.insights, []),
        "recommendations": safe_json_loads(report.recommendations, []),
        "kpis": safe_json_loads(report.kpis, []),
        "created_at": str(report.created_at),
    }


@router.get("/{report_id}/download")
async def download_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Download a generated report file."""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not report.file_path:
        raise HTTPException(status_code=404, detail="Report file not available")

    return FileResponse(
        report.file_path,
        media_type="application/octet-stream",
        filename=f"{report.title}.{report.report_type}",
    )
