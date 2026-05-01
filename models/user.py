from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel, EmailStr

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id : int
    name : str
    email : str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email : str
    password : str

class TokenResponse(BaseModel):
    access_token : str
    token_type : str = "bearer"
    user : UserResponse


