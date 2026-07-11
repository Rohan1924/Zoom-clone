# ZoomClone — Backend (FastAPI + SQLite)

A FastAPI REST API powering the ZoomClone video conferencing platform.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | FastAPI 0.139+ | Lightweight, auto-generates Swagger docs, async-ready |
| ORM | SQLAlchemy 2.x | Clean model definitions, no raw SQL |
| Database | SQLite | Assignment requirement; zero-config, file-based |
| Validation | Pydantic 2.x | Request/response schemas with automatic validation |
| Server | Uvicorn | ASGI server with hot-reload for development |

## Database Schema

```
meetings
  id             TEXT  PK (UUID)          — internal primary key
  meeting_id     TEXT  UNIQUE, INDEXED    — public Zoom-style code "823-912-456"
  title          TEXT  NOT NULL
  description    TEXT  nullable
  scheduled_time DATETIME nullable        — NULL = instant meeting
  duration_minutes INT nullable
  created_at     DATETIME
  updated_at     DATETIME

participants
  id             TEXT  PK (UUID)
  meeting_id     TEXT  FK → meetings.id
  display_name   TEXT  NOT NULL
  is_host        BOOL  default False
  joined_at      DATETIME
```

**Design decisions:**
- `status` (`upcoming`/`recent`/`instant`) is **never stored** — derived at query time from `scheduled_time` vs `now()` so it can never go stale
- `meeting_id` (short public code) is separate from `id` (internal UUID), matching Zoom's pattern
- `is_host` on participants future-proofs host controls (mute all, end meeting) without a schema change

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/meetings/instant` | Create instant meeting (host auto-added) |
| POST | `/meetings/scheduled` | Schedule a future meeting |
| GET | `/meetings/upcoming` | Meetings with `scheduled_time >= now` |
| GET | `/meetings/recent` | Instant meetings + past scheduled meetings |
| GET | `/meetings/{meeting_id}` | Get meeting by public ID, 404 if not found |
| POST | `/meetings/{meeting_id}/join` | Join meeting with display name |
| GET | `/meetings/{meeting_id}/participants` | List all participants |

Interactive API docs (Swagger UI): **http://localhost:8000/docs**

## Project Structure

```
backend/
├── main.py              # App entry, CORS, startup table creation, router wiring
├── database.py          # SQLite engine, SessionLocal, Base, get_db() dependency
├── models.py            # SQLAlchemy models: Meeting, Participant
├── schemas.py           # Pydantic request/response schemas
├── seed.py              # Seeds 5 sample meetings (3 upcoming, 2 recent)
├── requirements.txt
├── crud/
│   ├── meeting.py       # Meeting queries + status derivation logic
│   └── participant.py   # Participant queries
├── routers/
│   ├── meetings.py      # /meetings/* route handlers
│   └── participants.py  # /meetings/{id}/join, /participants handlers
└── utils/
    └── id_generator.py  # Generates Zoom-style "823-912-456" meeting IDs
```

## Local Setup

```bash
# 1. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed sample data (3 upcoming + 2 recent meetings)
python seed.py

# 4. Start the API server
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

## Assumptions

- No user authentication — a default "guest" user is assumed to be logged in (per assignment spec)
- SQLite is ephemeral on Render/Railway free tier; `seed.py` logic runs on every fresh deploy to repopulate
- `status` is derived, not stored, to keep data consistent without scheduled jobs
- Meeting room video is a local webcam preview only (no multi-party WebRTC); this matches the assignment requirements which do not mention WebRTC
