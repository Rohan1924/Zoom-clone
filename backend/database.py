"""
Database engine + session setup.

We use SQLite (per assignment requirement) with SQLAlchemy as the ORM.
No Alembic: for a single-schema-version, 1-day project, calling
Base.metadata.create_all() on startup is simpler and has zero migration
risk. In a real production app this would be swapped for Alembic-managed
migrations.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./zoom_clone.db"

# check_same_thread=False is required for SQLite when used with FastAPI's
# threaded request handling.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
