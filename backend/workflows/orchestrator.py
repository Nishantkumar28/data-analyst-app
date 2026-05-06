"""
Workflow Orchestrator — Coordinates the multi-agent analysis pipeline.
"""

import json
import time
import os
from datetime import datetime
from database import async_session
from models.dataset import Dataset
from models.workflow import Workflow, AgentLog
from agents.manager import create_execution_plan, generate_final_summary
from agents.audit import run_audit
from agents.cleaning import run_cleaning
from agents.eda import run_eda
from agents.visualization import run_visualization
from agents.insight import run_insights
from services.upload import parse_dataset
from utils.helpers import safe_json_dumps, safe_json_loads
from sqlalchemy import select
from config import settings


async def execute_workflow(workflow_id: str):
    """Execute the full multi-agent analysis pipeline."""
    async with async_session() as db:
        try:
            # Load workflow
            result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
            workflow = result.scalar_one_or_none()
            if not workflow:
                return

            # Load dataset
            ds_result = await db.execute(select(Dataset).where(Dataset.id == workflow.dataset_id))
            dataset = ds_result.scalar_one_or_none()
            if not dataset:
                workflow.status = "failed"
                workflow.error_message = "Dataset not found"
                await db.commit()
                return

            # Update status
            workflow.status = "running"
            workflow.started_at = datetime.utcnow()
            await db.commit()

            # Parse dataset
            df = parse_dataset(dataset.file_path, dataset.file_type)

            # Create execution plan
            workflow.current_stage = "planning"
            workflow.progress = 5
            await db.commit()

            dataset_info = safe_json_loads(dataset.columns_info, {})
            plan = await create_execution_plan(workflow.prompt, dataset_info)
            workflow.execution_plan = safe_json_dumps(plan)
            workflow.progress = 10
            await _log(db, workflow.id, "manager", "completed", "Execution plan created")
            await db.commit()

            # Stage 1: Audit
            workflow.current_stage = "audit"
            workflow.progress = 15
            await db.commit()
            await _log(db, workflow.id, "audit", "started", "Starting data audit")

            t0 = time.time()
            audit_result = await run_audit(df, workflow.prompt)
            dur = int((time.time() - t0) * 1000)

            workflow.audit_result = safe_json_dumps(audit_result)
            workflow.progress = 30
            await _log(db, workflow.id, "audit", "completed",
                       f"Audit complete: score={audit_result['quality_score']}", dur)
            await db.commit()

            # Update dataset health score
            dataset.health_score = audit_result.get("quality_score", 0)
            await db.commit()

            # Stage 2: Cleaning
            workflow.current_stage = "cleaning"
            workflow.progress = 35
            await db.commit()
            await _log(db, workflow.id, "cleaning", "started", "Starting data cleaning")

            t0 = time.time()
            cleaning_result = await run_cleaning(df, audit_result, workflow.prompt)
            dur = int((time.time() - t0) * 1000)

            df_clean = cleaning_result.pop("cleaned_df")
            workflow.cleaning_result = safe_json_dumps(cleaning_result)
            workflow.progress = 50
            await _log(db, workflow.id, "cleaning", "completed",
                       f"Cleaning complete: {cleaning_result['transformation_count']} transforms", dur)

            # Save cleaned dataset
            clean_path = dataset.file_path.replace(".", "_cleaned.")
            df_clean.to_csv(clean_path, index=False)
            dataset.cleaned_file_path = clean_path
            dataset.cleaning_log = safe_json_dumps(cleaning_result.get("cleaning_log", []))
            await db.commit()

            # Stage 3: EDA
            workflow.current_stage = "eda"
            workflow.progress = 55
            await db.commit()
            await _log(db, workflow.id, "eda", "started", "Starting exploratory data analysis")

            t0 = time.time()
            eda_result = await run_eda(df_clean, workflow.prompt)
            dur = int((time.time() - t0) * 1000)

            workflow.eda_result = safe_json_dumps(eda_result)
            workflow.progress = 70
            await _log(db, workflow.id, "eda", "completed", "EDA complete", dur)
            await db.commit()

            # Stage 4: Visualization
            workflow.current_stage = "visualization"
            workflow.progress = 75
            await db.commit()
            await _log(db, workflow.id, "visualization", "started", "Generating visualizations")

            t0 = time.time()
            viz_result = await run_visualization(df_clean, eda_result, workflow.prompt)
            dur = int((time.time() - t0) * 1000)

            workflow.visualization_result = safe_json_dumps(viz_result)
            workflow.progress = 85
            await _log(db, workflow.id, "visualization", "completed",
                       f"Generated {viz_result['chart_count']} charts", dur)
            await db.commit()

            # Stage 5: Insights
            workflow.current_stage = "insight"
            workflow.progress = 88
            await db.commit()
            await _log(db, workflow.id, "insight", "started", "Generating business insights")

            t0 = time.time()
            df_info = {"row_count": len(df_clean), "column_count": len(df_clean.columns)}
            insight_result = await run_insights(df_info, audit_result, eda_result, viz_result, workflow.prompt)
            dur = int((time.time() - t0) * 1000)

            workflow.insight_result = safe_json_dumps(insight_result)
            workflow.progress = 95
            await _log(db, workflow.id, "insight", "completed",
                       f"Generated {insight_result['insight_count']} insights", dur)
            await db.commit()

            # Final Summary
            workflow.current_stage = "done"
            final = await generate_final_summary(
                workflow.prompt, audit_result, cleaning_result,
                eda_result, viz_result, insight_result,
            )
            workflow.final_summary = final["summary"]
            workflow.confidence_score = final["confidence_score"]
            workflow.status = "completed"
            workflow.progress = 100
            workflow.completed_at = datetime.utcnow()
            await _log(db, workflow.id, "manager", "completed", "All agents finished successfully")
            await db.commit()

        except Exception as e:
            async with async_session() as db2:
                result = await db2.execute(select(Workflow).where(Workflow.id == workflow_id))
                wf = result.scalar_one_or_none()
                if wf:
                    wf.status = "failed"
                    wf.error_message = str(e)
                    await _log(db2, workflow_id, "manager", "error", str(e))
                    await db2.commit()


async def _log(db, workflow_id, agent, action, message, duration_ms=None):
    """Helper to create an agent log entry."""
    log = AgentLog(
        workflow_id=workflow_id,
        agent_name=agent,
        action=action,
        message=message,
        duration_ms=duration_ms,
    )
    db.add(log)
    await db.flush()
