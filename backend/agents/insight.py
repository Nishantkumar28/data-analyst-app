"""
Insight Agent — Stage 5
Transforms analytics into business intelligence and actionable recommendations.
"""

import json
from typing import Any
from config import settings


async def run_insights(
    df_info: dict,
    audit_result: dict,
    eda_result: dict,
    viz_result: dict,
    prompt: str = "",
) -> dict:
    """Generate business insights from all analysis results."""

    insights = []
    recommendations = []
    anomalies = []
    executive_summary = ""

    # Extract key metrics
    eda_findings = eda_result.get("findings", [])
    eda_stats = eda_result.get("results", {}).get("summary_statistics", {})
    correlations = eda_result.get("results", {}).get("correlations", {})
    quality_score = audit_result.get("quality_score", 0)
    audit_issues = audit_result.get("issues", [])

    # 1. Data Quality Insights
    if quality_score < 70:
        insights.append({
            "category": "Data Quality",
            "title": "Dataset quality needs attention",
            "description": f"The dataset health score is {quality_score}/100. Significant data quality issues may affect analysis reliability.",
            "severity": "high",
            "confidence": 0.95,
        })
    elif quality_score >= 90:
        insights.append({
            "category": "Data Quality",
            "title": "Excellent data quality",
            "description": f"The dataset health score is {quality_score}/100. The data is clean and reliable for analysis.",
            "severity": "low",
            "confidence": 0.95,
        })

    # 2. Statistical Insights
    for col, stat in eda_stats.items():
        if abs(stat.get("skewness", 0)) > 2:
            insights.append({
                "category": "Distribution",
                "title": f"{col} has an unusual distribution",
                "description": f"{col} is heavily {'right' if stat['skewness'] > 0 else 'left'}-skewed (skewness={stat['skewness']}). Consider log transformation for modeling.",
                "severity": "medium",
                "confidence": 0.85,
            })

        if stat.get("cv", 0) > 150:
            insights.append({
                "category": "Variability",
                "title": f"High variability in {col}",
                "description": f"{col} has a coefficient of variation of {stat['cv']}%, indicating extreme variability. Investigate potential subgroups.",
                "severity": "medium",
                "confidence": 0.8,
            })

    # 3. Correlation Insights
    strong_corrs = correlations.get("strong_correlations", [])
    for sc in strong_corrs[:5]:
        direction = "increases" if sc["correlation"] > 0 else "decreases"
        insights.append({
            "category": "Relationships",
            "title": f"Strong relationship: {sc['pair']}",
            "description": f"When one {direction}, the other tends to follow (r={sc['correlation']:.2f}). This may indicate a causal or confounding relationship.",
            "severity": "medium",
            "confidence": min(abs(sc["correlation"]), 0.95),
        })

    # 4. EDA-derived insights
    for finding in eda_findings[:5]:
        insights.append({
            "category": "Pattern",
            "title": finding[:80],
            "description": finding,
            "severity": "medium",
            "confidence": 0.75,
        })

    # 5. Generate recommendations
    recommendations = [
        {"priority": "high", "action": "Address data quality issues before advanced analysis",
         "rationale": f"Quality score: {quality_score}/100"} if quality_score < 80 else None,
        {"priority": "medium", "action": "Investigate strong correlations for causal relationships",
         "rationale": f"Found {len(strong_corrs)} strong correlations"} if strong_corrs else None,
        {"priority": "medium", "action": "Consider feature engineering from datetime columns",
         "rationale": "Temporal patterns may reveal trends"},
        {"priority": "low", "action": "Set up monitoring alerts for key metrics",
         "rationale": "Proactive detection of data drift and anomalies"},
    ]
    recommendations = [r for r in recommendations if r is not None]

    # 6. Executive Summary
    n_rows = df_info.get("row_count", 0)
    n_cols = df_info.get("column_count", 0)

    executive_summary = f"""## Executive Summary

**Dataset Overview:** {n_rows:,} records across {n_cols} dimensions were analyzed.

**Data Quality:** The dataset scored {quality_score}/100, with {len(audit_issues)} issues identified.

**Key Findings:**
"""
    for i, insight in enumerate(insights[:5], 1):
        executive_summary += f"\n{i}. **{insight['title']}** — {insight['description']}"

    executive_summary += f"\n\n**Recommendations:** {len(recommendations)} actionable items identified."

    if prompt:
        executive_summary += f"\n\n**Analysis Context:** {prompt}"

    return {
        "insights": insights,
        "recommendations": recommendations,
        "anomalies": anomalies,
        "executive_summary": executive_summary,
        "insight_count": len(insights),
        "confidence_score": round(sum(i.get("confidence", 0.5) for i in insights) / max(len(insights), 1), 2),
        "summary": f"Generated {len(insights)} insights and {len(recommendations)} recommendations",
    }
