"""
Workflow API routes: create, monitor, and retrieve analysis workflows.
"""

import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.dataset import Dataset
from models.workflow import Workflow, AgentLog
from utils.helpers import safe_json_loads, safe_json_dumps

router = APIRouter(prefix="/workflows", tags=["Workflows"])


class WorkflowRequest(BaseModel):
    dataset_id: str
    prompt: str


class WorkflowResponse(BaseModel):
    id: str
    status: str
    current_stage: str
    progress: int


@router.post("/create")
async def create_workflow(
    req: WorkflowRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create a new analysis workflow from a user prompt."""
    # Validate dataset exists
    result = await db.execute(select(Dataset).where(Dataset.id == req.dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Create workflow
    workflow = Workflow(
        dataset_id=req.dataset_id,
        user_id="demo-user",
        prompt=req.prompt,
        status="pending",
        current_stage="planning",
        progress=0,
    )
    db.add(workflow)
    await db.flush()

    # Log creation
    log = AgentLog(
        workflow_id=workflow.id,
        agent_name="manager",
        action="started",
        message=f"Workflow created with prompt: {req.prompt}",
    )
    db.add(log)
    await db.flush()

    # Queue the workflow for background execution
    background_tasks.add_task(run_workflow_pipeline, workflow.id)

    return {
        "id": workflow.id,
        "status": workflow.status,
        "current_stage": workflow.current_stage,
        "progress": workflow.progress,
        "message": "Workflow created. Analysis starting...",
    }


async def run_workflow_pipeline(workflow_id: str):
    """
    Background task to run the complete multi-agent analysis pipeline.
    This is called asynchronously after workflow creation.
    """
    from workflows.orchestrator import execute_workflow
    try:
        await execute_workflow(workflow_id)
    except Exception as e:
        print(f"Workflow {workflow_id} failed: {e}")


@router.get("/")
async def list_workflows(
    dataset_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List workflows, optionally filtered by dataset."""
    query = select(Workflow).where(Workflow.user_id == "demo-user")
    if dataset_id:
        query = query.where(Workflow.dataset_id == dataset_id)
    query = query.order_by(desc(Workflow.created_at))

    result = await db.execute(query)
    workflows = result.scalars().all()

    return [
        {
            "id": w.id,
            "dataset_id": w.dataset_id,
            "prompt": w.prompt,
            "status": w.status,
            "current_stage": w.current_stage,
            "progress": w.progress,
            "confidence_score": w.confidence_score,
            "created_at": str(w.created_at),
            "completed_at": str(w.completed_at) if w.completed_at else None,
        }
        for w in workflows
    ]


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    """Get full workflow details including all agent results."""
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Get agent logs
    logs_result = await db.execute(
        select(AgentLog)
        .where(AgentLog.workflow_id == workflow_id)
        .order_by(AgentLog.created_at)
    )
    logs = logs_result.scalars().all()

    return {
        "id": workflow.id,
        "dataset_id": workflow.dataset_id,
        "prompt": workflow.prompt,
        "status": workflow.status,
        "current_stage": workflow.current_stage,
        "progress": workflow.progress,
        "confidence_score": workflow.confidence_score,
        "execution_plan": safe_json_loads(workflow.execution_plan, {}),
        "audit_result": safe_json_loads(workflow.audit_result, {}),
        "cleaning_result": safe_json_loads(workflow.cleaning_result, {}),
        "eda_result": safe_json_loads(workflow.eda_result, {}),
        "visualization_result": safe_json_loads(workflow.visualization_result, {}),
        "insight_result": safe_json_loads(workflow.insight_result, {}),
        "final_summary": workflow.final_summary,
        "error_message": workflow.error_message,
        "created_at": str(workflow.created_at),
        "completed_at": str(workflow.completed_at) if workflow.completed_at else None,
        "agent_logs": [
            {
                "agent_name": log.agent_name,
                "action": log.action,
                "message": log.message,
                "duration_ms": log.duration_ms,
                "created_at": str(log.created_at),
            }
            for log in logs
        ],
    }


@router.get("/{workflow_id}/status")
async def get_workflow_status(workflow_id: str, db: AsyncSession = Depends(get_db)):
    """Get quick workflow status (for polling)."""
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return {
        "id": workflow.id,
        "status": workflow.status,
        "current_stage": workflow.current_stage,
        "progress": workflow.progress,
        "error_message": workflow.error_message,
    }
