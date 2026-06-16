from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Finance Tracker API"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/finance_tracker"
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60 * 24
    GOOGLE_CLIENT_ID: str = ""
    FRONTEND_URL: str = "http://localhost:5173"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def strip_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

    @property
    def DEV_MODE(self) -> bool:
        return not self.GOOGLE_CLIENT_ID

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()

