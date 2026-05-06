"""
Chat Agent — AI assistant for conversational dataset interaction.
Processes user messages with dataset context awareness.
"""

import json
from typing import Any, Optional
from config import settings


async def process_chat_message(
    message: str,
    dataset_context: Optional[dict] = None,
    conversation_history: list = None,
) -> dict:
    """
    Process a chat message and generate a contextual AI response.
    Falls back to rule-based responses when OpenAI is unavailable.
    """
    
    # Try OpenAI first
    try:
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your-openai-api-key-here":
            return await _openai_chat(message, dataset_context, conversation_history)
    except Exception:
        pass
    
    # Fall back to smart rule-based response
    return _rule_based_response(message, dataset_context)


async def _openai_chat(message, dataset_context, conversation_history):
    """Generate response using OpenAI API."""
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    system_prompt = """You are an expert data analyst AI assistant. You help users understand their datasets, 
    generate insights, suggest analyses, and answer questions about their data.
    Be specific, use numbers when available, and provide actionable advice.
    If you generate code, use Python with pandas."""
    
    if dataset_context:
        system_prompt += f"\n\nDataset Context:\n"
        system_prompt += f"Name: {dataset_context.get('name', 'Unknown')}\n"
        stats = dataset_context.get('summary_stats', {})
        system_prompt += f"Rows: {stats.get('row_count', 'N/A')}, Columns: {stats.get('column_count', 'N/A')}\n"
        cols = dataset_context.get('columns_info', {})
        system_prompt += f"Columns: {', '.join(list(cols.keys())[:20])}\n"
    
    messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        messages.extend(conversation_history[-8:])
    messages.append({"role": "user", "content": message})
    
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        max_tokens=1500,
        temperature=0.7,
    )
    
    return {
        "response": response.choices[0].message.content,
        "message_type": "text",
        "metadata": {},
    }


def _rule_based_response(message: str, dataset_context: Optional[dict]) -> dict:
    """Generate intelligent rule-based response without API."""
    msg_lower = message.lower()
    
    if not dataset_context:
        return {
            "response": "I'd be happy to help analyze your data! Please upload a dataset first, and I can answer questions about it, generate charts, find patterns, and provide business insights.",
            "message_type": "text",
            "metadata": {},
        }
    
    stats = dataset_context.get("summary_stats", {})
    cols = dataset_context.get("columns_info", {})
    col_names = list(cols.keys())
    
    if any(w in msg_lower for w in ["summary", "overview", "describe", "tell me about"]):
        resp = f"## Dataset Overview\n\n"
        resp += f"- **Rows:** {stats.get('row_count', 'N/A'):,}\n"
        resp += f"- **Columns:** {stats.get('column_count', 'N/A')}\n"
        resp += f"- **Missing Values:** {stats.get('total_missing', 0):,} ({stats.get('total_missing_pct', 0)}%)\n"
        resp += f"- **Duplicates:** {stats.get('duplicate_rows', 0):,}\n\n"
        resp += f"**Columns:** {', '.join(col_names[:15])}"
        if len(col_names) > 15:
            resp += f" and {len(col_names) - 15} more"
        return {"response": resp, "message_type": "text", "metadata": {}}
    
    if any(w in msg_lower for w in ["column", "variable", "feature"]):
        resp = "## Column Details\n\n"
        for name, info in list(cols.items())[:15]:
            dtype = info.get("dtype", "unknown")
            missing = info.get("missing_pct", 0)
            resp += f"- **{name}** ({dtype}) — {missing}% missing, {info.get('unique_count', 'N/A')} unique\n"
        return {"response": resp, "message_type": "text", "metadata": {}}
    
    if any(w in msg_lower for w in ["missing", "null", "empty"]):
        resp = "## Missing Value Analysis\n\n"
        resp += f"Total missing cells: {stats.get('total_missing', 0):,} ({stats.get('total_missing_pct', 0)}%)\n\n"
        for name, info in cols.items():
            if info.get("missing_pct", 0) > 0:
                resp += f"- **{name}**: {info['missing_count']} missing ({info['missing_pct']}%)\n"
        return {"response": resp, "message_type": "text", "metadata": {}}
    
    # Default response
    resp = f"Based on your dataset with {stats.get('row_count', 0):,} rows and {stats.get('column_count', 0)} columns:\n\n"
    resp += "I can help you with:\n"
    resp += "- 📊 **Data summary** — 'Give me an overview'\n"
    resp += "- 📋 **Column details** — 'Show me the columns'\n"
    resp += "- 🔍 **Missing data** — 'Analyze missing values'\n"
    resp += "- 📈 **Visualizations** — 'Create a chart for [column]'\n"
    resp += "- 💡 **Insights** — 'What patterns exist?'\n"
    resp += "\nTry asking a specific question about your data!"
    
    return {"response": resp, "message_type": "text", "metadata": {}}
