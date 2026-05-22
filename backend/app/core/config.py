"""
Application configuration using Pydantic Settings.
Loads and validates all environment variables at startup.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # ── Groq AI ──────────────────────────────────────────────
    GROQ_API_KEY: str = Field(..., description="Groq API key for LLM and Whisper")

    # ── MongoDB ───────────────────────────────────────────────
    MONGODB_URI: str = Field(..., description="MongoDB Atlas connection string")
    MONGODB_DB_NAME: str = Field(default="ai_psychologist", description="Database name")

    # ── ApiPay ────────────────────────────────────────────────
    APIPAY_SECRET_KEY: str = Field(..., description="ApiPay secret for webhook HMAC verification")

    # ── JWT ───────────────────────────────────────────────────
    JWT_SECRET_KEY: str = Field(..., description="Secret key for signing JWTs")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_EXPIRE_MINUTES: int = Field(default=60 * 24 * 7)  # 7 days

    # ── Business Logic ────────────────────────────────────────
    DEFAULT_FREE_MINUTES: int = Field(default=60, description="Free minutes granted on registration")
    MINUTES_PER_RUB: float = Field(default=1.0, description="Minutes added per 1 RUB paid")

    # ── App ───────────────────────────────────────────────────
    APP_ENV: str = Field(default="production")
    LOG_LEVEL: str = Field(default="INFO")

    model_config = {"env_file": ".env", "case_sensitive": True}


# Singleton instance used throughout the app
settings = Settings()