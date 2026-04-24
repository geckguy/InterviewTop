from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional, Set
from datetime import datetime
from bson import ObjectId


class UserBase(BaseModel):
    email: EmailStr
    username: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    hashed_password: Optional[str] = None
    visited_posts: Optional[Set[ObjectId]] = Field(default_factory=set)
    saved_posts: Optional[Set[ObjectId]] = Field(default_factory=set)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    auth_provider: Optional[str] = Field(default="email")
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

    @field_validator("id", mode="before")
    def convert_objectid_to_str(cls, v):
        return str(v) if isinstance(v, ObjectId) else v


class User(UserBase):
    id: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
