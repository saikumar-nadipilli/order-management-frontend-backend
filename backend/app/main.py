import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine
from app.routers import customers, dashboard, orders, products

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


def init_db(max_retries: int = 30, delay: float = 2.0):
    is_sqlite = settings.database_url.startswith("sqlite")
    retries = 1 if is_sqlite else max_retries
    for attempt in range(retries):
        try:
            if not is_sqlite:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            return
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(delay)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health_check():
    return {"status": "healthy"}
