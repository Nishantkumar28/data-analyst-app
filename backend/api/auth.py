"""
Authentication API routes: login, signup, profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from services.auth import (
    create_access_token,
    authenticate_user,
    create_user,
    get_user_by_email,
    get_user_by_username,
    get_user_by_id,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# --- Schemas ---

class SignupRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    created_at: str


# --- Helper ---

async def get_current_user(
    token: str = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Extract current user from JWT token. Returns a dict for flexibility."""
    if not token:
        # For demo purposes, return a demo user
        return {"id": "demo-user", "email": "demo@example.com", "username": "demo"}
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await get_user_by_id(db, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
    }


# --- Routes ---

@router.post("/signup", response_model=TokenResponse)
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check existing email
    existing = await get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check existing username
    existing = await get_user_by_username(db, req.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user = await create_user(db, req.email, req.username, req.password, req.full_name)
    
    # Generate token
    token = create_access_token({"sub": user.id, "email": user.email})
    
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    user = await authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.id, "email": user.email})
    
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
        },
    )


@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db)):
    """Get current user profile (demo mode returns demo user)."""
    return {
        "id": "demo-user",
        "email": "demo@example.com",
        "username": "demo",
        "full_name": "Demo User",
        "is_active": True,
    }
