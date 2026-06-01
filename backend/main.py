"""Vercel / ASGI entrypoint — keeps imports working (package root is backend/)."""
from app.main import app

__all__ = ["app"]
