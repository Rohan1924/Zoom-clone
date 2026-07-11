"""
App entry point.

Tables are created on startup via Base.metadata.create_all() rather than
Alembic migrations -- a deliberate tradeoff for a single-schema-version,
time-boxed project (see database.py docstring). This also means the app
is guaranteed to boot with a populated schema on a fresh deploy, with no
separate migration step that could fail.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import meetings, participants

# Import models so their tables are registered on Base.metadata before
# create_all() runs.
import models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zoom Clone API",
    description="Meeting scheduling, joining, and participant management.",
    version="1.0.0",
)

# Wide-open CORS for the assignment: no auth, and the frontend origin
# (Vercel preview URLs, localhost) isn't fixed ahead of time.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(participants.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "zoom-clone-api"}
