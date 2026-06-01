"""
Test database connection locally.

Usage (PowerShell):
  cd backend
  $env:DATABASE_URL = "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
  py -3.11 check_db.py
"""
import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool


def normalize_url(url: str) -> str:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql") and "sslmode=" not in url:
        url += "&sslmode=require" if "?" in url else "?sslmode=require"
    return url


def load_dotenv() -> None:
    env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def main() -> int:
    load_dotenv()
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        print("ERROR: DATABASE_URL is not set.")
        print('Example: $env:DATABASE_URL = "postgresql://..."')
        return 1

    if url.startswith("sqlite"):
        print(f"Testing SQLite: {url}")
    else:
        host = url.split("@")[1].split("/")[0] if "@" in url else "?"
        print(f"Testing PostgreSQL host: {host}")

    engine = create_engine(
        normalize_url(url),
        poolclass=NullPool if url.startswith("postgresql") else None,
    )

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 AS ok")).scalar()
        print(f"SUCCESS: Connected. SELECT 1 => {result}")
        return 0
    except Exception as exc:
        print(f"FAILED: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
