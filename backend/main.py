"""
DataAnalystAI — FastAPI Application Entry Point
Enterprise-grade AI Multi-Agent Data Analyst Platform
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import settings
from database import init_db, close_db
from api.auth import router as auth_router
from api.datasets import router as datasets_router
from api.workflows import router as workflows_router
from api.chat import router as chat_router
from api.reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # Startup
    print(f"[*] Starting {settings.APP_NAME}...")
    await init_db()
    print("[OK] Database initialized")
    yield
    # Shutdown
    await close_db()
    print("[*] Application shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise-grade AI Multi-Agent Data Analyst Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth_router, prefix="/api")
app.include_router(datasets_router, prefix="/api")
app.include_router(workflows_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(reports_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
    }


@app.get("/api/config")
async def get_config():
    """Get public app configuration."""
    return {
        "app_name": settings.APP_NAME,
        "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_MB,
        "allowed_extensions": settings.ALLOWED_EXTENSIONS,
        "ai_enabled": bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your-openai-api-key-here"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
