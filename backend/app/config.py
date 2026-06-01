import os

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Local default only — Docker/Vercel must set DATABASE_URL in environment
    database_url: str = "sqlite:///./inventory_dev.db"

    @model_validator(mode="after")
    def require_production_database(self):
        if not os.getenv("VERCEL"):
            return self
        url = self.database_url
        if not url or url.startswith("sqlite") or "@db:" in url or "@db/" in url:
            raise ValueError(
                "DATABASE_URL is not set on Vercel. "
                "Go to Project → Settings → Environment Variables and add DATABASE_URL "
                "(Neon Postgres connection string, e.g. postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require)"
            )
        return self
    cors_origins: str = (
        "http://localhost:3000,"
        "http://localhost:5173,"
        "https://order-management-frontend-backend.vercel.app"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
