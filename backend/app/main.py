import logging
import time

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine
from app.routers import customers, dashboard, orders, products

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready API for products, customers, and orders",
    version="1.0.0",
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

_db_ready = False


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "hint": "Check DATABASE_URL on Vercel (Neon Postgres)"},
    )


def init_db(max_retries: int = 5, delay: float = 1.0):
    """Create tables; fail fast on serverless so requests are not blocked for minutes."""
    is_sqlite = settings.database_url.startswith("sqlite")
    if "@db:" in settings.database_url:
        raise RuntimeError(
            "DATABASE_URL points to hostname 'db' (Docker only). "
            "Set a real Postgres URL in Vercel → Settings → Environment Variables."
        )
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


def _ensure_db():
    global _db_ready
    if _db_ready:
        return None
    try:
        init_db(max_retries=3, delay=0.5)
        _db_ready = True
        return None
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "hint": "Add DATABASE_URL in Vercel → Settings → Environment Variables (Neon Postgres)",
                "detail": str(exc),
            },
        )


# No DB work on startup — avoids Vercel lifespan crash when DATABASE_URL is missing


@app.middleware("http")
async def db_middleware(request: Request, call_next):
    if request.url.path not in ("/health", "/docs", "/openapi.json", "/redoc"):
        err = _ensure_db()
        if err is not None:
            return err
    return await call_next(request)


@app.get("/health")
def health_check():
    err = _ensure_db()
    if err is not None:
        return err
    return {"status": "healthy", "database": "connected"}
