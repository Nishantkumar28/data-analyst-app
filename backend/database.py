"""
Database configuration and session management.
Uses SQLAlchemy async engine with PostgreSQL.
Falls back to SQLite for development/demo.
"""

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings


# Use SQLite fallback for dev if PostgreSQL is not available
def get_database_url():
    """Get database URL, falling back to SQLite for development."""
    db_url = settings.DATABASE_URL
    if settings.APP_ENV == "development":
        # Check if we should use SQLite fallback
        try:
            import asyncpg  # noqa: F401
            return db_url
        except ImportError:
            sqlite_path = os.path.join(os.path.dirname(__file__), "storage", "app.db")
            os.makedirs(os.path.dirname(sqlite_path), exist_ok=True)
            return f"sqlite+aiosqlite:///{sqlite_path}"
    return db_url


DATABASE_URL = get_database_url()

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


async def get_db() -> AsyncSession:
    """Dependency to get database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database engine."""
    await engine.dispose()
