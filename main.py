from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routes import events, rsvps
from routes import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event RSVP API 🎉")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "*"
    ],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(rsvps.router, prefix="/events", tags=["RSVPs"])


@app.get("/")
def home():
    return {"message": "Welcome to Event RSVP API 🎉"}