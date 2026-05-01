from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from typing import List

class RsvpDB(Base):
    __tablename__ = "rsvps"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    status = Column(String, nullable=False)
    rsvp_at = Column(String, nullable=False)

    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)

    event = relationship("EventDB", back_populates="rsvps")

class Rsvp(BaseModel):
    name : str
    email : str
    status : str

class RsvpCreate(BaseModel):
    name : str
    email : str
    status : str

class RsvpResponse(RsvpCreate):
    id : int
    name : str
    email : str
    status : str
    rsvp_at : str
    event_id : int

class Config:
    from_attributes = True


class RsvpSummary(BaseModel):
    event_id: int
    event_name: str
    total: int
    going: int
    not_going: int
    maybe: int
    rsvps: List[RsvpResponse]