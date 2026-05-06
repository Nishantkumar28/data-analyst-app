"""
Chat API routes: AI conversation with dataset context.
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.chat import ChatSession, ChatMessage
from models.dataset import Dataset
from utils.helpers import safe_json_loads, safe_json_dumps

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    dataset_id: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    session_id: str
    response: str
    message_type: str = "text"
    metadata: dict = {}


@router.post("/send")
async def send_message(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Send a message to the AI chat assistant."""
    from agents.chat_agent import process_chat_message

    # Get or create session
    session = None
    if req.session_id:
        result = await db.execute(select(ChatSession).where(ChatSession.id == req.session_id))
        session = result.scalar_one_or_none()

    if not session:
        session = ChatSession(
            user_id="demo-user",
            dataset_id=req.dataset_id,
            title=req.message[:50] + "..." if len(req.message) > 50 else req.message,
        )
        db.add(session)
        await db.flush()

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=req.message,
    )
    db.add(user_msg)

    # Get dataset context if available
    dataset_context = None
    dataset_id = req.dataset_id or session.dataset_id
    if dataset_id:
        ds_result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
        dataset = ds_result.scalar_one_or_none()
        if dataset:
            dataset_context = {
                "name": dataset.name,
                "columns_info": safe_json_loads(dataset.columns_info, {}),
                "summary_stats": safe_json_loads(dataset.summary_stats, {}),
                "preview_data": safe_json_loads(dataset.preview_data, [])[:5],
            }

    # Get conversation history
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at)
    )
    history = history_result.scalars().all()
    messages_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history[-10:]  # Last 10 messages for context
    ]

    # Process with AI
    try:
        ai_response = await process_chat_message(
            message=req.message,
            dataset_context=dataset_context,
            conversation_history=messages_history,
        )
    except Exception as e:
        ai_response = {
            "response": f"I encountered an issue processing your request. Let me try a simpler approach.\n\nYour question: {req.message}\n\nBased on the available data, I'd recommend reviewing the dataset columns and statistics shown in the preview panel for initial insights.",
            "message_type": "text",
            "metadata": {},
        }

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_response.get("response", ""),
        message_type=ai_response.get("message_type", "text"),
        metadata_json=safe_json_dumps(ai_response.get("metadata", {})),
    )
    db.add(assistant_msg)
    await db.flush()

    return {
        "session_id": session.id,
        "response": ai_response.get("response", ""),
        "message_type": ai_response.get("message_type", "text"),
        "metadata": ai_response.get("metadata", {}),
    }


@router.get("/sessions")
async def list_sessions(
    dataset_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List chat sessions."""
    query = select(ChatSession).where(ChatSession.user_id == "demo-user")
    if dataset_id:
        query = query.where(ChatSession.dataset_id == dataset_id)
    query = query.order_by(desc(ChatSession.updated_at))

    result = await db.execute(query)
    sessions = result.scalars().all()

    return [
        {
            "id": s.id,
            "title": s.title,
            "dataset_id": s.dataset_id,
            "created_at": str(s.created_at),
            "updated_at": str(s.updated_at),
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get all messages in a chat session."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()

    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "message_type": msg.message_type,
            "metadata": safe_json_loads(msg.metadata_json, {}),
            "created_at": str(msg.created_at),
        }
        for msg in messages
    ]
