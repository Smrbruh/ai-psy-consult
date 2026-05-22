"""
MongoDB Atlas connection management using Motor (async driver).
Provides a shared database client, collection accessors, and index setup.
"""

import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings

logger = logging.getLogger(__name__)


class Database:
    """Holds the Motor client and exposes typed collection accessors."""

    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


# Module-level singleton
_db = Database()


async def connect_to_mongo() -> None:
    """
    Create the Motor client and verify connectivity.
    Called once at application startup.
    """
    logger.info("Connecting to MongoDB Atlas…")
    try:
        _db.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5_000,
            maxPoolSize=10,
            minPoolSize=1,
        )
        # Ping to verify connection before accepting traffic
        await _db.client.admin.command("ping")
        _db.db = _db.client[settings.MONGODB_DB_NAME]
        await _create_indexes()
        logger.info("MongoDB connected — database: %s", settings.MONGODB_DB_NAME)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        logger.error("MongoDB connection failed: %s", exc)
        raise


async def close_mongo_connection() -> None:
    """Gracefully close the Motor client. Called at application shutdown."""
    if _db.client is not None:
        _db.client.close()
        logger.info("MongoDB connection closed.")


async def _create_indexes() -> None:
    """
    Ensure all required indexes exist.
    Motor's create_indexes is idempotent — safe to call on every startup.
    """
    db = get_database()

    # users — unique email, fast lookup by email
    await db["users"].create_indexes([
        IndexModel([("email", ASCENDING)], unique=True, name="email_unique"),
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ])

    # chats — fast history retrieval per user/chat
    await db["chats"].create_indexes([
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_chat_desc"),
        IndexModel([("chat_id", ASCENDING)], name="chat_id_asc"),
    ])

    # payments — lookup by user and by external payment_id
    await db["payments"].create_indexes([
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_payment_desc"),
        IndexModel([("payment_id", ASCENDING)], unique=True, name="payment_id_unique"),
    ])

    logger.info("MongoDB indexes verified.")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database handle. Raises RuntimeError if not initialised."""
    if _db.db is None:
        raise RuntimeError("Database is not initialised. Call connect_to_mongo() first.")
    return _db.db


# Convenient typed collection getters
def get_users_collection():
    return get_database()["users"]


def get_chats_collection():
    return get_database()["chats"]


def get_payments_collection():
    return get_database()["payments"]