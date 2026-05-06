"""
Dataset API routes: upload, list, preview, delete datasets.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from database import get_db
from models.dataset import Dataset
from services.upload import save_upload, parse_dataset, get_dataset_info
from utils.helpers import safe_json_dumps, safe_json_loads, calculate_quality_score

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new dataset (CSV, Excel, or JSON)."""
    try:
        # Save file
        file_info = await save_upload(file)

        # Parse and extract metadata
        df = parse_dataset(file_info["file_path"], file_info["file_type"])
        dataset_info = get_dataset_info(df)

        # Calculate initial quality score
        stats = dataset_info["summary_stats"]
        health_score = calculate_quality_score(
            missing_pct=stats.get("total_missing_pct", 0),
            duplicate_pct=stats.get("duplicate_pct", 0),
            type_issues_pct=0,  # Will be refined by audit agent
            outlier_pct=0,
        )

        # Create dataset record
        dataset = Dataset(
            user_id="demo-user",
            name=name or file_info["original_filename"],
            original_filename=file_info["original_filename"],
            file_path=file_info["file_path"],
            file_type=file_info["file_type"],
            file_size=file_info["file_size"],
            row_count=dataset_info["row_count"],
            column_count=dataset_info["column_count"],
            columns_info=safe_json_dumps(dataset_info["columns_info"]),
            preview_data=safe_json_dumps(dataset_info["preview_data"]),
            summary_stats=safe_json_dumps(dataset_info["summary_stats"]),
            health_score=health_score,
            status="ready",
        )
        db.add(dataset)
        await db.flush()

        return {
            "id": dataset.id,
            "name": dataset.name,
            "file_type": dataset.file_type,
            "file_size": dataset.file_size,
            "row_count": dataset.row_count,
            "column_count": dataset.column_count,
            "health_score": health_score,
            "columns_info": dataset_info["columns_info"],
            "summary_stats": dataset_info["summary_stats"],
            "preview_data": dataset_info["preview_data"],
            "status": "ready",
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/")
async def list_datasets(db: AsyncSession = Depends(get_db)):
    """List all datasets for the current user."""
    result = await db.execute(
        select(Dataset)
        .where(Dataset.user_id == "demo-user")
        .order_by(desc(Dataset.created_at))
    )
    datasets = result.scalars().all()

    return [
        {
            "id": d.id,
            "name": d.name,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "row_count": d.row_count,
            "column_count": d.column_count,
            "health_score": d.health_score,
            "status": d.status,
            "created_at": str(d.created_at),
        }
        for d in datasets
    ]


@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """Get full dataset details including preview and column info."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()

    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    return {
        "id": dataset.id,
        "name": dataset.name,
        "original_filename": dataset.original_filename,
        "file_type": dataset.file_type,
        "file_size": dataset.file_size,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "health_score": dataset.health_score,
        "status": dataset.status,
        "columns_info": safe_json_loads(dataset.columns_info, {}),
        "summary_stats": safe_json_loads(dataset.summary_stats, {}),
        "preview_data": safe_json_loads(dataset.preview_data, []),
        "cleaning_log": safe_json_loads(dataset.cleaning_log, []),
        "created_at": str(dataset.created_at),
    }


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a dataset."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    await db.delete(dataset)
    return {"message": "Dataset deleted successfully"}


@router.get("/{dataset_id}/preview")
async def get_dataset_preview(
    dataset_id: str,
    rows: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Get dataset preview with more rows."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    try:
        df = parse_dataset(dataset.file_path, dataset.file_type, nrows=rows)
        # Convert to JSON-safe format
        for col in df.columns:
            if hasattr(df[col], "dt"):
                df[col] = df[col].astype(str)

        records = json.loads(df.to_json(orient="records"))
        return {
            "columns": list(df.columns),
            "data": records,
            "total_rows": dataset.row_count,
            "showing": len(records),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
