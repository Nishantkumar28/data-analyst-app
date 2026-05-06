"""
Data Audit Agent — Stage 1
Inspects raw dataset quality and generates a health report.
"""

import numpy as np
import pandas as pd
from typing import Any


async def run_audit(df: pd.DataFrame, prompt: str = "") -> dict:
    """Execute comprehensive data audit on the DataFrame."""
    findings = {}
    recommendations = []
    issues = []
    n_rows, n_cols = df.shape

    # 1. Missing Values
    missing_info = _analyze_missing(df)
    findings["missing_values"] = missing_info
    if missing_info["total_missing"] > 0:
        sev = "high" if missing_info["missing_pct"] > 20 else "medium" if missing_info["missing_pct"] > 5 else "low"
        issues.append({"type": "missing_values", "severity": sev,
                       "message": f"{missing_info['total_missing']} missing values ({missing_info['missing_pct']}%)"})
        recommendations.append("Handle missing values via imputation or removal")

    # 2. Duplicates
    dup_count = int(df.duplicated().sum())
    dup_pct = round(dup_count / len(df) * 100, 2) if len(df) > 0 else 0
    findings["duplicates"] = {"count": dup_count, "pct": dup_pct}
    if dup_count > 0:
        issues.append({"type": "duplicates", "severity": "medium" if dup_pct > 5 else "low",
                       "message": f"{dup_count} duplicate rows ({dup_pct}%)"})
        recommendations.append("Remove duplicate rows")

    # 3. Data Type Issues
    dtype_issues = _check_dtypes(df)
    findings["data_types"] = dtype_issues
    if dtype_issues:
        issues.append({"type": "data_type_issues", "severity": "medium",
                       "message": f"{len(dtype_issues)} columns have type issues"})
        recommendations.append("Fix data types (dates as strings, numbers as objects)")

    # 4. Outliers
    outlier_info = _detect_outliers(df)
    findings["outliers"] = outlier_info
    if outlier_info:
        issues.append({"type": "outliers", "severity": "medium",
                       "message": f"Outliers in {len(outlier_info)} columns"})
        recommendations.append("Investigate outliers using IQR or z-score methods")

    # 5. Distributions
    findings["distributions"] = _analyze_distributions(df)

    # 6. Quality Score
    score = 100.0
    score -= min(missing_info["missing_pct"] * 0.5, 30)
    score -= min(dup_pct * 0.3, 15)
    score -= min(len(dtype_issues) * 3, 15)
    score -= min(len(outlier_info) * 2, 10)
    quality_score = round(max(0, min(100, score)), 1)

    # 7. Charts
    charts = _build_charts(df, findings)

    # 8. Column diagnostics
    col_diag = [{"name": c, "dtype": str(df[c].dtype), "null_count": int(df[c].isna().sum()),
                 "unique": int(df[c].nunique()),
                 "completeness": round(df[c].count() / len(df) * 100, 1) if len(df) > 0 else 0}
                for c in df.columns]

    label = "Excellent" if quality_score >= 90 else "Good" if quality_score >= 70 else "Fair" if quality_score >= 50 else "Poor"
    summary = (f"**Quality Score: {quality_score}/100 ({label})**\n"
               f"Dataset: {n_rows:,} rows × {n_cols} cols | Issues: {len(issues)}")

    return {
        "quality_score": quality_score, "total_rows": n_rows, "total_columns": n_cols,
        "issues": issues, "recommendations": recommendations, "findings": findings,
        "charts": charts, "column_diagnostics": col_diag, "summary": summary,
    }


def _analyze_missing(df):
    missing = df.isnull().sum()
    cols = [{"column": c, "missing_count": int(missing[c]),
             "missing_pct": round(missing[c] / len(df) * 100, 2)}
            for c in df.columns if missing[c] > 0]
    cols.sort(key=lambda x: x["missing_pct"], reverse=True)
    total = int(df.isnull().sum().sum())
    pct = round(total / (len(df) * len(df.columns)) * 100, 2) if len(df) > 0 else 0
    return {"total_missing": total, "missing_pct": pct, "columns_with_missing": cols}


def _check_dtypes(df):
    issues = []
    for col in df.select_dtypes(include=["object"]).columns:
        sample = df[col].dropna().head(50)
        dates = sum(1 for v in sample if _is_date(v))
        nums = sum(1 for v in sample if _is_num(v))
        if dates > len(sample) * 0.8:
            issues.append({"column": col, "suggested": "datetime"})
        elif nums > len(sample) * 0.8:
            issues.append({"column": col, "suggested": "numeric"})
    return issues


def _is_date(v):
    try: pd.to_datetime(v); return True
    except: return False

def _is_num(v):
    try: float(v); return True
    except: return False


def _detect_outliers(df):
    result = {}
    for col in df.select_dtypes(include=[np.number]).columns:
        data = df[col].dropna()
        if len(data) < 10: continue
        Q1, Q3 = data.quantile(0.25), data.quantile(0.75)
        IQR = Q3 - Q1
        if IQR == 0: continue
        out = data[(data < Q1 - 1.5 * IQR) | (data > Q3 + 1.5 * IQR)]
        if len(out) > 0:
            result[col] = {"count": int(len(out)), "pct": round(len(out) / len(data) * 100, 2)}
    return result


def _analyze_distributions(df):
    dists = {}
    for col in df.select_dtypes(include=[np.number]).columns:
        data = df[col].dropna()
        if len(data) < 10: continue
        sk = float(data.skew())
        ku = float(data.kurtosis())
        shape = "symmetric" if abs(sk) < 0.5 else "right-skewed" if sk > 0 else "left-skewed"
        dists[col] = {"skewness": round(sk, 3), "kurtosis": round(ku, 3), "shape": shape}
    return dists


def _build_charts(df, findings):
    charts = []
    mc = findings["missing_values"]["columns_with_missing"]
    if mc:
        charts.append({"type": "bar", "title": "Missing Values by Column",
                       "data": {"labels": [c["column"] for c in mc[:15]],
                                "values": [c["missing_pct"] for c in mc[:15]]},
                       "config": {"xLabel": "Column", "yLabel": "Missing %", "color": "#ef4444"}})
    dtypes = df.dtypes.astype(str).value_counts().to_dict()
    charts.append({"type": "pie", "title": "Data Type Distribution",
                   "data": {"labels": list(dtypes.keys()), "values": [int(v) for v in dtypes.values()]},
                   "config": {"colors": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}})
    comp = [(c, round(df[c].count() / len(df) * 100, 1)) for c in df.columns]
    comp.sort(key=lambda x: x[1])
    charts.append({"type": "bar", "title": "Column Completeness",
                   "data": {"labels": [c[0] for c in comp[:15]], "values": [c[1] for c in comp[:15]]},
                   "config": {"xLabel": "Column", "yLabel": "%", "color": "#10b981"}})
    return charts
