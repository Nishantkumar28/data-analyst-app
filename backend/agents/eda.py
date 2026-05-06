"""
EDA Agent — Stage 3
Performs deep Exploratory Data Analysis with statistical findings.
"""

import json
import numpy as np
import pandas as pd
from typing import Any


async def run_eda(df: pd.DataFrame, prompt: str = "") -> dict:
    """Execute comprehensive EDA on the DataFrame."""
    results = {}

    # 1. Summary Statistics
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    dt_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()

    stats = {}
    for col in num_cols:
        data = df[col].dropna()
        if len(data) == 0:
            continue
        stats[col] = {
            "mean": round(float(data.mean()), 4),
            "median": round(float(data.median()), 4),
            "std": round(float(data.std()), 4),
            "min": float(data.min()),
            "max": float(data.max()),
            "q25": float(data.quantile(0.25)),
            "q75": float(data.quantile(0.75)),
            "skewness": round(float(data.skew()), 4),
            "kurtosis": round(float(data.kurtosis()), 4),
            "cv": round(float(data.std() / data.mean() * 100), 2) if data.mean() != 0 else 0,
        }
    results["summary_statistics"] = stats

    # 2. Correlation Analysis
    if len(num_cols) >= 2:
        corr_matrix = df[num_cols].corr().round(4)
        corr_data = {}
        strong_corrs = []
        for i in range(len(num_cols)):
            for j in range(i + 1, len(num_cols)):
                val = corr_matrix.iloc[i, j]
                if not np.isnan(val):
                    corr_data[f"{num_cols[i]} × {num_cols[j]}"] = float(val)
                    if abs(val) > 0.7:
                        strong_corrs.append({
                            "pair": f"{num_cols[i]} & {num_cols[j]}",
                            "correlation": float(val),
                            "strength": "strong positive" if val > 0 else "strong negative",
                        })
        results["correlations"] = {
            "matrix": {col: {c: float(corr_matrix.loc[col, c]) for c in num_cols} for col in num_cols},
            "strong_correlations": strong_corrs,
        }

    # 3. Distribution data for charts
    distributions = {}
    for col in num_cols[:10]:
        data = df[col].dropna()
        if len(data) == 0:
            continue
        hist, edges = np.histogram(data, bins=min(30, max(10, len(data) // 20)))
        distributions[col] = {
            "histogram": {"counts": hist.tolist(), "edges": [round(e, 4) for e in edges.tolist()]},
        }
    results["distributions"] = distributions

    # 4. Categorical Analysis
    cat_analysis = {}
    for col in cat_cols[:10]:
        vc = df[col].value_counts().head(15)
        cat_analysis[col] = {
            "value_counts": {str(k): int(v) for k, v in vc.items()},
            "unique": int(df[col].nunique()),
            "top": str(vc.index[0]) if len(vc) > 0 else None,
            "top_freq": int(vc.iloc[0]) if len(vc) > 0 else 0,
        }
    results["categorical_analysis"] = cat_analysis

    # 5. Time-series detection and analysis
    ts_analysis = {}
    for col in dt_cols:
        try:
            ts = df.set_index(col).select_dtypes(include=[np.number])
            if len(ts.columns) > 0:
                first_num = ts.columns[0]
                monthly = ts[first_num].resample("M").mean()
                ts_analysis[col] = {
                    "metric": first_num,
                    "trend_data": {
                        "dates": [str(d) for d in monthly.index],
                        "values": [round(v, 2) if not np.isnan(v) else None for v in monthly.values],
                    },
                    "has_trend": True,
                }
        except:
            pass
    results["time_series"] = ts_analysis

    # 6. Group-by analysis (top categorical × top numeric)
    group_analysis = {}
    if cat_cols and num_cols:
        cat_col = cat_cols[0]
        num_col = num_cols[0]
        if df[cat_col].nunique() <= 20:
            grouped = df.groupby(cat_col)[num_col].agg(["mean", "sum", "count"]).round(2)
            group_analysis[f"{cat_col}_by_{num_col}"] = {
                "group_column": cat_col,
                "value_column": num_col,
                "data": {str(k): {"mean": float(r["mean"]), "sum": float(r["sum"]),
                                   "count": int(r["count"])}
                         for k, r in grouped.iterrows()},
            }
    results["group_analysis"] = group_analysis

    # 7. Build EDA charts
    charts = _build_eda_charts(df, results, num_cols, cat_cols)

    # 8. Key Findings
    findings = _extract_findings(results)

    return {
        "results": results,
        "charts": charts,
        "findings": findings,
        "numeric_columns": num_cols,
        "categorical_columns": cat_cols,
        "datetime_columns": dt_cols,
        "summary": f"EDA complete: {len(num_cols)} numeric, {len(cat_cols)} categorical, {len(dt_cols)} datetime columns analyzed.",
    }


def _build_eda_charts(df, results, num_cols, cat_cols):
    charts = []
    # Correlation heatmap
    if "correlations" in results and "matrix" in results["correlations"]:
        matrix = results["correlations"]["matrix"]
        charts.append({"type": "heatmap", "title": "Correlation Matrix",
                       "data": matrix, "config": {"colorScale": "RdBu"}})

    # Distribution histograms for top numeric cols
    for col in num_cols[:4]:
        data = df[col].dropna()
        if len(data) == 0:
            continue
        charts.append({"type": "histogram", "title": f"Distribution: {col}",
                       "data": {"values": data.tolist()[:500], "column": col},
                       "config": {"bins": 30, "color": "#6366f1"}})

    # Top categorical bar charts
    for col in cat_cols[:3]:
        vc = df[col].value_counts().head(10)
        charts.append({"type": "bar", "title": f"Top Values: {col}",
                       "data": {"labels": [str(l) for l in vc.index.tolist()],
                                "values": vc.values.tolist()},
                       "config": {"color": "#8b5cf6"}})

    # Box plots for numeric columns
    for col in num_cols[:4]:
        data = df[col].dropna()
        if len(data) == 0:
            continue
        charts.append({"type": "box", "title": f"Box Plot: {col}",
                       "data": {"values": data.describe().to_dict(), "column": col},
                       "config": {"color": "#06b6d4"}})

    return charts


def _extract_findings(results):
    findings = []
    # Strong correlations
    if "correlations" in results:
        for sc in results["correlations"].get("strong_correlations", []):
            findings.append(f"Strong {sc['strength']} correlation ({sc['correlation']:.2f}) between {sc['pair']}")

    # Skewed distributions
    for col, st in results.get("summary_statistics", {}).items():
        if abs(st.get("skewness", 0)) > 2:
            findings.append(f"{col} is heavily skewed (skewness={st['skewness']})")

    # High variability
    for col, st in results.get("summary_statistics", {}).items():
        if st.get("cv", 0) > 100:
            findings.append(f"{col} has very high variability (CV={st['cv']}%)")

    return findings
