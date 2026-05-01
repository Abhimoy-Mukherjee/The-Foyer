from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from typing import Optional

class EventDB(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=False)
    date = Column(String, nullable=False)
    max_attendees = Column(Integer, nullable=True)
    created_at = Column(String, nullable=False)
    category = Column(String, nullable=False, default="general")

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("UserDB")

    rsvps = relationship("RsvpDB", back_populates="event", cascade="all, delete")

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    date: str
    max_attendees: Optional[int] = None
    category: str = "general"

class EventResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    location: str
    date: str
    max_attendees: Optional[int] = None
    created_at: str
    owner_id : int
    category: str

    class Config:
        from_attributes = True  