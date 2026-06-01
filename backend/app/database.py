import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings


def _normalize_database_url(url: str) -> str:
    # Render/Heroku sometimes provide postgres:// — SQLAlchemy needs postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # Neon / Vercel Postgres require SSL in production
    if url.startswith("postgresql") and os.getenv("VERCEL") and "sslmode=" not in url:
        url += "&sslmode=require" if "?" in url else "?sslmode=require"
    return url


_db_url = _normalize_database_url(settings.database_url)
_connect_args = {}
_engine_kwargs = {}

if _db_url.startswith("sqlite"):
    _connect_args["check_same_thread"] = False
elif _db_url.startswith("postgresql"):
    # Serverless: one connection per request, no pooled idle connections
    _engine_kwargs["poolclass"] = NullPool
    _engine_kwargs["pool_pre_ping"] = True

engine = create_engine(_db_url, connect_args=_connect_args, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
