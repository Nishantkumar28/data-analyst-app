"""
Data Cleaning Agent — Stage 2
Automatically cleans and preprocesses data with explainable transformations.
"""

import numpy as np
import pandas as pd
from typing import Any


async def run_cleaning(df: pd.DataFrame, audit_result: dict, prompt: str = "") -> dict:
    """Execute automated data cleaning pipeline."""
    log = []
    original_shape = df.shape
    df_clean = df.copy()

    # 1. Remove exact duplicates
    dup_before = df_clean.duplicated().sum()
    if dup_before > 0:
        df_clean = df_clean.drop_duplicates()
        log.append({"action": "remove_duplicates", "removed": int(dup_before),
                     "reason": f"Removed {dup_before} exact duplicate rows"})

    # 2. Handle missing values
    for col in df_clean.columns:
        missing = df_clean[col].isna().sum()
        if missing == 0:
            continue
        pct = missing / len(df_clean) * 100

        if pct > 70:
            df_clean = df_clean.drop(columns=[col])
            log.append({"action": "drop_column", "column": col,
                         "reason": f"Dropped column with {pct:.1f}% missing values"})
        elif pd.api.types.is_numeric_dtype(df_clean[col]):
            median_val = df_clean[col].median()
            df_clean[col] = df_clean[col].fillna(median_val)
            log.append({"action": "impute_median", "column": col,
                         "value": float(median_val),
                         "reason": f"Filled {missing} missing numeric values with median ({median_val:.2f})"})
        else:
            mode_val = df_clean[col].mode()
            if len(mode_val) > 0:
                fill_val = mode_val.iloc[0]
                df_clean[col] = df_clean[col].fillna(fill_val)
                log.append({"action": "impute_mode", "column": col,
                             "value": str(fill_val),
                             "reason": f"Filled {missing} missing categorical values with mode"})

    # 3. Fix data types
    for col in df_clean.select_dtypes(include=["object"]).columns:
        sample = df_clean[col].dropna().head(50)
        date_count = sum(1 for v in sample if _try_date(v))
        num_count = sum(1 for v in sample if _try_num(v))

        if date_count > len(sample) * 0.8:
            try:
                df_clean[col] = pd.to_datetime(df_clean[col], errors="coerce")
                log.append({"action": "convert_datetime", "column": col,
                             "reason": "Converted string column to datetime"})
            except: pass
        elif num_count > len(sample) * 0.8:
            try:
                df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce")
                log.append({"action": "convert_numeric", "column": col,
                             "reason": "Converted string column to numeric"})
            except: pass

    # 4. Standardize text columns
    for col in df_clean.select_dtypes(include=["object"]).columns:
        original = df_clean[col].copy()
        df_clean[col] = df_clean[col].str.strip().str.lower()
        changed = (original != df_clean[col]).sum()
        if changed > 0:
            log.append({"action": "standardize_text", "column": col,
                         "changes": int(changed),
                         "reason": f"Standardized {changed} text values (lowercase + trim)"})

    # 5. Treat outliers (winsorization for extreme cases)
    for col in df_clean.select_dtypes(include=[np.number]).columns:
        data = df_clean[col].dropna()
        if len(data) < 20:
            continue
        Q1, Q3 = data.quantile(0.25), data.quantile(0.75)
        IQR = Q3 - Q1
        if IQR == 0:
            continue
        lower, upper = Q1 - 3 * IQR, Q3 + 3 * IQR  # 3x IQR for extreme only
        extreme = ((data < lower) | (data > upper)).sum()
        if extreme > 0 and extreme / len(data) < 0.05:
            df_clean[col] = df_clean[col].clip(lower=lower, upper=upper)
            log.append({"action": "clip_outliers", "column": col,
                         "clipped": int(extreme),
                         "reason": f"Clipped {extreme} extreme outliers to [{lower:.2f}, {upper:.2f}]"})

    # 6. Feature engineering from datetime columns
    for col in df_clean.select_dtypes(include=["datetime64"]).columns:
        try:
            df_clean[f"{col}_year"] = df_clean[col].dt.year
            df_clean[f"{col}_month"] = df_clean[col].dt.month
            df_clean[f"{col}_dayofweek"] = df_clean[col].dt.dayofweek
            log.append({"action": "extract_date_features", "column": col,
                         "new_columns": [f"{col}_year", f"{col}_month", f"{col}_dayofweek"],
                         "reason": "Extracted year, month, day-of-week features from datetime"})
        except: pass

    # Build comparison
    comparison = {
        "before": {"rows": original_shape[0], "columns": original_shape[1]},
        "after": {"rows": len(df_clean), "columns": len(df_clean.columns)},
        "rows_removed": original_shape[0] - len(df_clean),
        "columns_removed": original_shape[1] - len([c for c in df.columns if c in df_clean.columns]),
        "columns_added": len([c for c in df_clean.columns if c not in df.columns]),
    }

    return {
        "cleaned_df": df_clean,
        "cleaning_log": log,
        "transformation_count": len(log),
        "comparison": comparison,
        "summary": f"Applied {len(log)} transformations. Shape: {original_shape} → {df_clean.shape}",
    }


def _try_date(v):
    try: pd.to_datetime(v); return True
    except: return False

def _try_num(v):
    try: float(v); return True
    except: return False
