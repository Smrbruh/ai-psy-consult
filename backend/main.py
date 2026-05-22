"""
AI Psychologist Consultant — FastAPI application entry point.

Startup sequence:
  1. Connect to MongoDB Atlas (with index creation)
  2. Mount all API routers
  3. Start Uvicorn (via render.yaml / Procfile)

Shutdown:
  - Close MongoDB connection gracefully
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo
from app.api.routes import auth, chat, billing

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Application factory ───────────────────────────────────────────────────────

app = FastAPI(
    title="AI Psychologist Consultant",
    description=(
        "An empathetic AI psychologist powered by Groq Llama 3. "
        "Supports text and voice conversations with per-minute billing."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS — open for MVP, tighten in production ────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # restrict to your Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lifecycle events ──────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event() -> None:
    """Connect to MongoDB and ensure indexes exist before accepting requests."""
    await connect_to_mongo()
    logger.info("Application started — environment: %s", settings.APP_ENV)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Close the MongoDB connection pool cleanly."""
    await close_mongo_connection()
    logger.info("Application shut down.")


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(billing.router, prefix="/api", tags=["Billing"])


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"], summary="Service health check")
async def health_check() -> dict:
    """
    Lightweight liveness probe used by Render and load balancers.
    Returns 200 OK when the service is running.
    """
    return {"status": "ok", "environment": settings.APP_ENV}