from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ── Auth ──────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ── Todo ──────────────────────────────────────────────────────
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    order: Optional[int] = None

class TodoOut(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    priority: str
    due_date: Optional[datetime]
    created_at: datetime
    order: int

    class Config:
        from_attributes = True
