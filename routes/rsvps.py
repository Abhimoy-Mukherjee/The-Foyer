from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models.event import EventDB
from models.rsvp import RsvpDB, RsvpCreate, RsvpResponse, RsvpSummary

router = APIRouter()


@router.get("/{event_id}/rsvps", response_model=RsvpSummary)
def get_rsvps(event_id: int, db: Session = Depends(get_db)):
    event = db.query(EventDB).filter(EventDB.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    rsvps = db.query(RsvpDB).filter(RsvpDB.event_id == event_id).all()

    going = len([r for r in rsvps if r.status == "yes"])
    not_going = len([r for r in rsvps if r.status == "no"])
    maybe = len([r for r in rsvps if r.status == "maybe"])

    rsvp_responses = [RsvpResponse.model_validate(r, from_attributes=True) for r in rsvps]

    return RsvpSummary(
        event_id=event.id,
        event_name=event.name,
        total=len(rsvps),
        going=going,
        not_going=not_going,
        maybe=maybe,
        rsvps=rsvp_responses
    )

@router.post("/{event_id}/rsvps", response_model=RsvpResponse)
def create_rsvp(event_id: int, rsvp: RsvpCreate, db: Session = Depends(get_db)):
    event = db.query(EventDB).filter(EventDB.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if rsvp.status not in ["yes", "no", "maybe"]:
        raise HTTPException(status_code=400, detail="Status must be 'yes', 'no', or 'maybe'")

    existing = db.query(RsvpDB).filter(
        RsvpDB.event_id == event_id,
        RsvpDB.email == rsvp.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email has already RSVP'd")

    if rsvp.status == "yes" and event.max_attendees:
        going_count = db.query(RsvpDB).filter(
            RsvpDB.event_id == event_id,
            RsvpDB.status == "yes"
        ).count()
        if going_count >= event.max_attendees:
            raise HTTPException(status_code=400, detail="Sorry, this event is fully booked!")

    new_rsvp = RsvpDB(
        **rsvp.model_dump(),
        event_id=event_id,
        rsvp_at=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    db.add(new_rsvp)
    db.commit()
    db.refresh(new_rsvp)
    return new_rsvp


@router.delete("/{event_id}/rsvps/{rsvp_id}")
def delete_rsvp(event_id: int, rsvp_id: int, db: Session = Depends(get_db)):
    rsvp = db.query(RsvpDB).filter(
        RsvpDB.id == rsvp_id,
        RsvpDB.event_id == event_id
    ).first()
    if not rsvp:
        raise HTTPException(status_code=404, detail="RSVP not found")
    db.delete(rsvp)
    db.commit()
    return {"message": f"RSVP cancelled for {rsvp.name}"}