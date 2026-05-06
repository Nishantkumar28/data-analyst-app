"""
Manager Agent — Central Orchestrator AI
Understands user goals, creates execution plans, and coordinates all agents.
"""

from typing import Any
from config import settings


async def create_execution_plan(prompt: str, dataset_info: dict) -> dict:
    """
    Analyze user prompt and dataset to create a structured execution plan.
    The Manager determines which agents to run and in what order.
    """
    # Analyze prompt intent
    intent = _classify_intent(prompt)
    
    # Determine required stages based on intent
    stages = ["audit"]  # Always audit first
    
    if intent.get("needs_cleaning", True):
        stages.append("cleaning")
    
    stages.append("eda")  # Always do EDA
    
    if intent.get("needs_visualization", True):
        stages.append("visualization")
    
    stages.append("insight")  # Always generate insights
    
    plan = {
        "prompt": prompt,
        "intent": intent,
        "stages": stages,
        "stage_count": len(stages),
        "estimated_time": f"{len(stages) * 5}-{len(stages) * 15} seconds",
        "strategy": _build_strategy(intent, dataset_info),
        "focus_areas": intent.get("focus_areas", []),
    }
    
    return plan


async def generate_final_summary(
    prompt: str,
    audit_result: dict,
    cleaning_result: dict,
    eda_result: dict,
    viz_result: dict,
    insight_result: dict,
) -> dict:
    """Combine all agent results into a final comprehensive summary."""
    
    quality = audit_result.get("quality_score", 0)
    issues = len(audit_result.get("issues", []))
    transforms = cleaning_result.get("transformation_count", 0)
    charts = viz_result.get("chart_count", 0)
    insights = insight_result.get("insight_count", 0)
    confidence = insight_result.get("confidence_score", 0)
    
    summary = f"""# Analysis Complete

## Your Question
> {prompt}

## Results Overview
- **Data Quality:** {quality}/100
- **Issues Found & Fixed:** {issues} issues detected, {transforms} transformations applied
- **Analysis Depth:** {charts} visualizations, {insights} insights generated
- **Confidence Score:** {confidence}

## Executive Summary
{insight_result.get('executive_summary', 'Analysis complete. Review insights and visualizations for details.')}

## Key Recommendations
"""
    for i, rec in enumerate(insight_result.get("recommendations", [])[:5], 1):
        summary += f"\n{i}. **[{rec.get('priority', 'medium').upper()}]** {rec.get('action', '')}"
    
    return {
        "summary": summary,
        "confidence_score": confidence,
        "quality_score": quality,
        "total_insights": insights,
        "total_charts": charts,
    }


def _classify_intent(prompt: str) -> dict:
    """Classify the user's business question intent."""
    prompt_lower = prompt.lower()
    
    intent = {
        "type": "general_analysis",
        "needs_cleaning": True,
        "needs_visualization": True,
        "focus_areas": [],
    }
    
    # Detect specific analysis types
    if any(w in prompt_lower for w in ["trend", "over time", "growth", "forecast", "predict"]):
        intent["type"] = "trend_analysis"
        intent["focus_areas"].append("time_series")
    
    if any(w in prompt_lower for w in ["compare", "difference", "versus", "vs", "segment"]):
        intent["type"] = "comparison"
        intent["focus_areas"].append("segmentation")
    
    if any(w in prompt_lower for w in ["why", "reason", "cause", "root", "explain"]):
        intent["type"] = "root_cause"
        intent["focus_areas"].append("correlations")
    
    if any(w in prompt_lower for w in ["anomal", "outlier", "unusual", "suspicious"]):
        intent["type"] = "anomaly_detection"
        intent["focus_areas"].append("outliers")
    
    if any(w in prompt_lower for w in ["churn", "retain", "customer"]):
        intent["focus_areas"].append("customer_analysis")
    
    if any(w in prompt_lower for w in ["revenue", "sales", "profit", "cost"]):
        intent["focus_areas"].append("financial_analysis")
    
    return intent


def _build_strategy(intent: dict, dataset_info: dict) -> str:
    """Build analysis strategy description."""
    strategies = {
        "trend_analysis": "Focus on temporal patterns, seasonality, and trend decomposition",
        "comparison": "Perform segment-level comparisons and statistical testing",
        "root_cause": "Deep correlation analysis and feature importance ranking",
        "anomaly_detection": "Statistical outlier detection and pattern deviation analysis",
        "general_analysis": "Comprehensive analysis covering all key aspects of the dataset",
    }
    return strategies.get(intent["type"], strategies["general_analysis"])
