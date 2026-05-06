"""
Visualization Agent — Stage 4
Automatically generates charts, dashboards, and KPI cards.
"""

import numpy as np
import pandas as pd
from typing import Any


async def run_visualization(df: pd.DataFrame, eda_result: dict, prompt: str = "") -> dict:
    """Generate visualization configurations for the frontend."""
    charts = []
    kpis = []
    dashboard_config = {}

    num_cols = eda_result.get("numeric_columns", df.select_dtypes(include=[np.number]).columns.tolist())
    cat_cols = eda_result.get("categorical_columns", df.select_dtypes(include=["object"]).columns.tolist())
    dt_cols = eda_result.get("datetime_columns", [])

    # KPI Cards
    for col in num_cols[:6]:
        data = df[col].dropna()
        if len(data) == 0:
            continue
        kpis.append({
            "title": col.replace("_", " ").title(),
            "value": round(float(data.mean()), 2),
            "subtitle": f"Avg of {len(data):,} values",
            "change": round(float(data.pct_change().dropna().mean() * 100), 2) if len(data) > 1 else 0,
            "format": "number",
        })

    # Auto-select best chart types
    # Line charts for time-series
    for dt_col in dt_cols:
        for num_col in num_cols[:3]:
            try:
                ts = df.sort_values(dt_col)
                charts.append({
                    "type": "line", "title": f"{num_col} over Time",
                    "data": {"x": ts[dt_col].astype(str).tolist()[:200],
                             "y": ts[num_col].tolist()[:200]},
                    "config": {"xLabel": dt_col, "yLabel": num_col, "color": "#6366f1", "smooth": True},
                })
            except:
                pass

    # Bar charts for categorical breakdowns
    for cat_col in cat_cols[:3]:
        if df[cat_col].nunique() > 20:
            continue
        for num_col in num_cols[:2]:
            grouped = df.groupby(cat_col)[num_col].mean().sort_values(ascending=False).head(12)
            charts.append({
                "type": "bar", "title": f"Average {num_col} by {cat_col}",
                "data": {"labels": [str(l) for l in grouped.index.tolist()],
                         "values": [round(v, 2) for v in grouped.values.tolist()]},
                "config": {"xLabel": cat_col, "yLabel": f"Avg {num_col}",
                           "color": "#3b82f6", "gradient": True},
            })

    # Scatter plots for top correlated pairs
    corrs = eda_result.get("results", {}).get("correlations", {}).get("strong_correlations", [])
    for sc in corrs[:3]:
        pair = sc["pair"].split(" & ")
        if len(pair) == 2 and pair[0] in df.columns and pair[1] in df.columns:
            sample = df[[pair[0], pair[1]]].dropna().head(500)
            charts.append({
                "type": "scatter", "title": f"{pair[0]} vs {pair[1]}",
                "data": {"x": sample[pair[0]].tolist(), "y": sample[pair[1]].tolist()},
                "config": {"xLabel": pair[0], "yLabel": pair[1], "color": "#f59e0b",
                           "correlation": sc["correlation"]},
            })

    # Pie charts for categorical distributions
    for cat_col in cat_cols[:2]:
        if 2 <= df[cat_col].nunique() <= 10:
            vc = df[cat_col].value_counts()
            charts.append({
                "type": "pie", "title": f"{cat_col} Distribution",
                "data": {"labels": [str(l) for l in vc.index.tolist()],
                         "values": vc.values.tolist()},
                "config": {"colors": ["#6366f1", "#3b82f6", "#06b6d4", "#10b981",
                                       "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
                                       "#14b8a6", "#f97316"]},
            })

    # Histograms
    for col in num_cols[:4]:
        data = df[col].dropna()
        if len(data) < 10:
            continue
        hist, edges = np.histogram(data, bins=min(30, max(10, len(data) // 20)))
        mids = [(edges[i] + edges[i + 1]) / 2 for i in range(len(edges) - 1)]
        charts.append({
            "type": "area", "title": f"{col} Distribution",
            "data": {"x": [round(m, 2) for m in mids], "y": hist.tolist()},
            "config": {"xLabel": col, "yLabel": "Count", "color": "#8b5cf6", "fill": True},
        })

    # Correlation heatmap
    if len(num_cols) >= 2:
        corr = df[num_cols[:10]].corr().round(3)
        charts.append({
            "type": "heatmap", "title": "Feature Correlations",
            "data": {col: {c: float(corr.loc[col, c]) for c in corr.columns} for col in corr.index},
            "config": {"colorScale": "RdBu", "annotate": True},
        })

    # Dashboard layout
    dashboard_config = {
        "kpi_count": len(kpis),
        "chart_count": len(charts),
        "layout": "auto",
        "theme": "dark",
    }

    return {
        "charts": charts,
        "kpis": kpis,
        "dashboard_config": dashboard_config,
        "chart_count": len(charts),
        "summary": f"Generated {len(charts)} charts and {len(kpis)} KPI cards",
    }
