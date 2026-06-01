import logging
import os
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine
from app.routers import customers, dashboard, orders, products

logger = logging.getLogger(__name__)

_root_path = os.getenv("VERCEL", "") and "/_/backend" or ""

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready API for products, customers, and orders",
    version="1.0.0",
    root_path=_root_path,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


def init_db(max_retries: int = 5, delay: float = 1.0):
    """Create tables; fail fast on serverless so requests are not blocked for minutes."""
    is_sqlite = settings.database_url.startswith("sqlite")
    if not is_sqlite and settings.database_url.startswith("postgresql://postgres:postgres@db:"):
        logger.warning("DATABASE_URL looks like local Docker default — set a real Postgres URL on Vercel")
    retries = 1 if is_sqlite else max_retries
    last_error = None
    for attempt in range(retries):
        try:
            if not is_sqlite:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            return
        except Exception as exc:
            last_error = exc
            if attempt == retries - 1:
                raise
            time.sleep(delay)
    if last_error:
        raise last_error


_db_ready = False


@app.on_event("startup")
def on_startup():
    global _db_ready
    try:
        init_db()
        _db_ready = True
    except Exception as exc:
        logger.error("Database startup failed: %s", exc)
        _db_ready = False


@app.get("/health")
def health_check():
    if not _db_ready:
        try:
            init_db(max_retries=2, delay=0.5)
        except Exception as exc:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "unhealthy",
                    "database": "disconnected",
                    "hint": "Set DATABASE_URL in Vercel (Neon or Vercel Postgres)",
                    "detail": str(exc),
                },
            )
    return {"status": "healthy", "database": "connected"}
