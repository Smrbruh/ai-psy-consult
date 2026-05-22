"""
AI service — wraps the Groq API (Llama 3) to power the psychologist chatbot.

Responsibilities:
- Maintain the empathetic psychologist system prompt
- Build per-request message history (with context-window trimming)
- Enforce per-user rate limiting to prevent API abuse
- Return the model's text reply as a plain string
"""

import logging
import time
from collections import defaultdict
from typing import List

from groq import AsyncGroq

from app.core.config import settings
from app.models import ChatMessage

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are an empathetic psychologist-consultant. "
    "Use active listening techniques. "
    "Ask open-ended questions about feelings and emotions. "
    "Never give direct advice — guide the person to find their own solutions. "
    "Be supportive, warm, and non-judgmental. "
    "Keep responses concise (2-4 sentences)."
)

MODEL = "llama3-8b-8192"          # fast, free-tier Groq model
MAX_HISTORY_MESSAGES = 20         # keep last N messages to stay within context window
MAX_TOKENS_PER_REPLY = 256        # keeps replies concise as per prompt instructions

# Rate limiting: max requests per user per minute
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW_SEC = 60

# In-memory rate-limit store: {user_id: [timestamp, ...]}
_rate_limit_store: dict[str, list[float]] = defaultdict(list)

# Groq async client (shared instance)
_groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


# ── Public API ────────────────────────────────────────────────────────────────

async def get_ai_response(
    user_message: str,
    chat_history: List[ChatMessage],
    user_id: str,
) -> str:
    """
    Send a user message (with conversation context) to Groq and return the reply.

    Args:
        user_message:  The latest message from the user.
        chat_history:  Previous turns (oldest first) stored in MongoDB.
        user_id:       Used for per-user rate limiting.

    Returns:
        The assistant's text reply.

    Raises:
        ValueError: If the user has exceeded the rate limit.
        RuntimeError: If the Groq API returns an unexpected response.
    """
    _enforce_rate_limit(user_id)

    messages = _build_messages(user_message, chat_history)

    logger.debug("Sending %d messages to Groq for user %s", len(messages), user_id)

    try:
        completion = await _groq_client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=MAX_TOKENS_PER_REPLY,
            temperature=0.7,
        )
    except Exception as exc:
        logger.error("Groq API error for user %s: %s", user_id, exc)
        raise RuntimeError(f"AI service unavailable: {exc}") from exc

    try:
        reply = completion.choices[0].message.content.strip()
    except (IndexError, AttributeError) as exc:
        raise RuntimeError("Unexpected response structure from Groq API") from exc

    if not reply:
        raise RuntimeError("Groq returned an empty response")

    logger.debug("Groq reply (%d chars) for user %s", len(reply), user_id)
    return reply


# ── Internal Helpers ──────────────────────────────────────────────────────────

def _build_messages(user_message: str, chat_history: List[ChatMessage]) -> list[dict]:
    """
    Assemble the messages list for the Groq API call.

    - Prepends the system prompt.
    - Trims history to the last MAX_HISTORY_MESSAGES entries so we stay well
      within the 8 192-token context window of llama3-8b-8192.
    - Appends the current user message at the end.
    """
    # Trim history: keep the most recent messages
    trimmed = chat_history[-MAX_HISTORY_MESSAGES:] if len(chat_history) > MAX_HISTORY_MESSAGES else chat_history

    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

    for turn in trimmed:
        messages.append({"role": turn.role, "content": turn.content})

    messages.append({"role": "user", "content": user_message})
    return messages


def _enforce_rate_limit(user_id: str) -> None:
    """
    Sliding-window rate limiter.
    Removes timestamps older than RATE_LIMIT_WINDOW_SEC, then checks count.

    Raises:
        ValueError: If the user has exceeded RATE_LIMIT_REQUESTS per window.
    """
    now = time.monotonic()
    window_start = now - RATE_LIMIT_WINDOW_SEC

    # Evict expired timestamps
    timestamps = _rate_limit_store[user_id]
    _rate_limit_store[user_id] = [t for t in timestamps if t > window_start]

    if len(_rate_limit_store[user_id]) >= RATE_LIMIT_REQUESTS:
        raise ValueError(
            f"Rate limit exceeded: max {RATE_LIMIT_REQUESTS} messages per minute."
        )

    _rate_limit_store[user_id].append(now)