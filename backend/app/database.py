from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings


def _normalize_database_url(url: str) -> str:
    # Render/Heroku sometimes provide postgres:// — SQLAlchemy needs postgresql://
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


_db_url = _normalize_database_url(settings.database_url)
_connect_args = {}
if _db_url.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine = create_engine(_db_url, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
