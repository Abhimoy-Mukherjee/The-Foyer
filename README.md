# The Foyer — Event RSVP Platform


A full-stack Event RSVP platform built with **FastAPI** (backend) and vanilla **HTML/CSS/JS** (frontend). Users can register, log in, create events with categories, and manage RSVPs — A SQLite database with JWT authentication.

---

## Features

-  **User Authentication** — Register, login, JWT-based sessions
-  **Event Management** — Create, view, and delete events
-  **Categories** — Organize events by Music, Tech, Business, Sports, Art, Workshop
-  **RSVP System** — Yes / No / Maybe responses with duplicate prevention
-  **Capacity Limits** — Set max attendees per event
-  **Live Summary** — Real-time RSVP counts and capacity bar
-  **Protected Routes** — Only event creators can delete their own events
-  **REST API** — Clean, documented API with auto-generated Swagger UI

---

## Tech Stack

| Backend | FastAPI (Python) |
| Database | SQLite + SQLAlchemy ORM |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Server | Uvicorn |

---

## Project Structure

```
event-rsvp-api/
│
├── main.py              # App entry point, middleware, router registration
├── database.py          # Database connection, session, Base
│
├── auth/
│   ├── __init__.py
│   ├── hashing.py       # Password hashing with bcrypt
│   └── jwt.py           # JWT token creation and verification
│
├── models/
│   ├── __init__.py
│   ├── event.py         # EventDB (SQLAlchemy) + EventCreate/EventResponse (Pydantic)
│   ├── rsvp.py          # RsvpDB + RsvpCreate/RsvpResponse/RsvpSummary
│   └── user.py          # UserDB + UserCreate/UserResponse/TokenResponse
│
├── routes/
│   ├── __init__.py
│   ├── auth.py          # POST /auth/register, POST /auth/login
│   ├── events.py        # GET/POST /events, DELETE /events/{id}
│   └── rsvps.py         # GET/POST /events/{id}/rsvps, DELETE /events/{id}/rsvps/{id}
│
├── frontend/
│   └── index.html       # Complete frontend (single file)
│
├── database.db          # SQLite database (auto-created on first run)
├── requirements.txt     # Python dependencies
└── README.md
```

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/The-Foyer.git
cd The-Foyer
```

### 2. Create and activate virtual environment

```bash
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the server

```bash
uvicorn main:app --reload
```

The API will be live at **http://127.0.0.1:8000**

### 5. Open the frontend

Open `frontend/index.html` in your browser — it automatically connects to the backend.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account
| POST | `/auth/login` | Login and get JWT token

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/events/` | Get all events
| GET | `/events/{id}` | Get a single event
| POST | `/events/` | Create a new event
| DELETE | `/events/{id}` | Delete an event (creator only)

### RSVPs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/events/{id}/rsvps` | Get all RSVPs + summary
| POST | `/events/{id}/rsvps` | Submit an RSVP
| DELETE | `/events/{id}/rsvps/{rsvp_id}` | Cancel an RSVP

### Interactive Docs
Visit **http://127.0.0.1:8000/docs** for the full Swagger UI.

---

## Authentication Flow

1. Register at `POST /auth/register`
2. Login at `POST /auth/login` → receive `access_token`
3. Include token in all protected requests:
   ```
   Authorization: Bearer <your_token>
   ```

---

## Frontend

The frontend is a single `index.html`

---

## Dependencies

```
fastapi
uvicorn
sqlalchemy
python-jose[cryptography]
passlib[bcrypt]
python-multipart
bcrypt==4.0.1
```

Generate `requirements.txt`:
```bash
pip freeze > requirements.txt
```

---

## Future Improvements

- [ ] Edit event route
- [ ] Email confirmation on RSVP
- [ ] Image upload for events
- [ ] Pagination for events list
- [ ] Deploy to Railway / Render
- [ ] PostgreSQL support for production

---
