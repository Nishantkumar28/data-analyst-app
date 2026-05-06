"""
Dataset upload service: file handling, validation, and initial parsing.
"""

import os
import uuid
import json
from typing import Optional
from fastapi import UploadFile
import pandas as pd
import numpy as np
from config import settings
from utils.helpers import format_file_size, generate_file_hash


async def save_upload(file: UploadFile) -> dict:
    """
    Save uploaded file to storage and return metadata.
    
    Returns:
        dict with file_path, file_type, file_size, original_filename
    """
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}. Allowed: {settings.ALLOWED_EXTENSIONS}")

    # Read content
    content = await file.read()
    file_size = len(content)

    # Check size limit
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise ValueError(f"File too large: {format_file_size(file_size)}. Max: {settings.MAX_UPLOAD_SIZE_MB}MB")

    # Generate unique filename
    file_hash = generate_file_hash(content)[:12]
    unique_name = f"{uuid.uuid4().hex[:8]}_{file_hash}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    # Save file
    with open(file_path, "wb") as f:
        f.write(content)

    file_type_map = {
        ".csv": "csv",
        ".xlsx": "xlsx",
        ".xls": "xlsx",
        ".json": "json",
    }

    return {
        "file_path": file_path,
        "file_type": file_type_map.get(ext, "unknown"),
        "file_size": file_size,
        "original_filename": file.filename,
    }


def parse_dataset(file_path: str, file_type: str, nrows: Optional[int] = None) -> pd.DataFrame:
    """
    Parse uploaded file into a pandas DataFrame.
    
    Args:
        file_path: Path to the saved file
        file_type: Type of file (csv, xlsx, json)
        nrows: Optional limit on rows to read
    """
    try:
        if file_type == "csv":
            df = pd.read_csv(file_path, nrows=nrows)
        elif file_type == "xlsx":
            df = pd.read_excel(file_path, nrows=nrows)
        elif file_type == "json":
            df = pd.read_json(file_path, nrows=nrows)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        return df
    except Exception as e:
        raise ValueError(f"Failed to parse file: {str(e)}")


def get_dataset_info(df: pd.DataFrame) -> dict:
    """
    Extract comprehensive dataset information for preview and analysis.
    
    Returns dict with columns_info, summary_stats, preview_data, etc.
    """
    # Column information
    columns_info = {}
    for col in df.columns:
        col_data = df[col]
        dtype = str(col_data.dtype)
        missing = int(col_data.isna().sum())
        missing_pct = round(missing / len(df) * 100, 2) if len(df) > 0 else 0
        unique = int(col_data.nunique())

        info = {
            "name": col,
            "dtype": dtype,
            "missing_count": missing,
            "missing_pct": missing_pct,
            "unique_count": unique,
            "sample_values": [str(v) for v in col_data.dropna().head(5).tolist()],
        }

        # Numeric stats
        if pd.api.types.is_numeric_dtype(col_data):
            info["is_numeric"] = True
            desc = col_data.describe()
            info["stats"] = {
                "mean": round(float(desc.get("mean", 0)), 4),
                "std": round(float(desc.get("std", 0)), 4),
                "min": float(desc.get("min", 0)),
                "max": float(desc.get("max", 0)),
                "median": round(float(col_data.median()), 4),
                "q25": float(desc.get("25%", 0)),
                "q75": float(desc.get("75%", 0)),
            }
        else:
            info["is_numeric"] = False
            if pd.api.types.is_datetime64_any_dtype(col_data):
                info["is_datetime"] = True
            else:
                info["is_datetime"] = False
                # Top categories for categorical columns
                if unique <= 50:
                    value_counts = col_data.value_counts().head(10).to_dict()
                    info["top_values"] = {str(k): int(v) for k, v in value_counts.items()}

        columns_info[col] = info

    # Summary statistics
    summary_stats = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "total_missing": int(df.isna().sum().sum()),
        "total_missing_pct": round(df.isna().sum().sum() / (len(df) * len(df.columns)) * 100, 2) if len(df) > 0 else 0,
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_pct": round(df.duplicated().sum() / len(df) * 100, 2) if len(df) > 0 else 0,
        "numeric_columns": int(df.select_dtypes(include=[np.number]).shape[1]),
        "categorical_columns": int(df.select_dtypes(include=["object", "category"]).shape[1]),
        "datetime_columns": int(df.select_dtypes(include=["datetime64"]).shape[1]),
        "memory_usage": format_file_size(df.memory_usage(deep=True).sum()),
    }

    # Preview data (first 20 rows)
    preview_df = df.head(20).copy()
    # Convert timestamps and other non-JSON-serializable types
    for col in preview_df.columns:
        if pd.api.types.is_datetime64_any_dtype(preview_df[col]):
            preview_df[col] = preview_df[col].astype(str)
    preview_data = json.loads(preview_df.to_json(orient="records"))

    return {
        "columns_info": columns_info,
        "summary_stats": summary_stats,
        "preview_data": preview_data,
        "row_count": len(df),
        "column_count": len(df.columns),
    }
