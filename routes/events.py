from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models.event import EventCreate, EventResponse, EventDB
from models.user import UserDB
from auth.jwt import verify_access_token
from datetime import datetime

router = APIRouter()
oauth2scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2scheme), db: Session=Depends(get_db)) -> UserDB:
     """Dependency — extracts and validates current user from JWT token"""
     payload = verify_access_token(token)
     user=db.query(UserDB).filter(UserDB.id==payload["user_id"]).first()
     if not user:
         raise HTTPException(status_code=401, detail="User not found")
     return user

@router.get("/", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(EventDB).all()
    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id : int, db: Session = Depends(get_db)):
    event = db.query(EventDB).filter(EventDB.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/", response_model=EventResponse)
def create_event(event : EventCreate,  db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    new_event = EventDB(
    name=event.name,
    description=event.description,
    location=event.location,
    date=event.date,
    max_attendees=event.max_attendees,
    category=event.category,
    created_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
    owner_id=current_user.id
)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.delete("/{event_id}")
def delete_event(event_id : int,  db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    event = db.query(EventDB).filter(EventDB.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own events")
    db.delete(event)
    db.commit()
    return {"message": f"Event '{event.name}' deleted successfully"}

