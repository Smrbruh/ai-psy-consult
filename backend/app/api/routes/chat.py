"""
Chat routes.

POST /api/chat              — send a text message, get AI reply
GET  /api/chat/history/{chat_id} — retrieve conversation history
POST /api/chat/voice        — upload audio, get transcription + AI reply as audio
"""

import logging
import uuid
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.api.routes.auth import get_current_user
from app.core.database import get_chats_collection, get_users_collection
from app.models import ChatHistoryResponse, ChatMessage, ChatRequest, ChatResponse
from app.services.ai_service import get_ai_response
from app.services.tts_service import text_to_speech
from app.services.whisper_service import transcribe_audio, validate_audio_content_type

logger = logging.getLogger(__name__)
router = APIRouter()

LOW_BALANCE_MESSAGE = (
    "You've used all your free minutes. "
    "Top up your balance to continue our conversation. "
    "I'm here when you're ready. 💙"
)


# ── Balance guard dependency ──────────────────────────────────────────────────

async def check_balance(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that blocks the request with 403 when balance_minutes == 0.
    Returns the user document so downstream handlers don't need to re-fetch.
    """
    if current_user.get("balance_minutes", 0) <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=LOW_BALANCE_MESSAGE,
        )
    return current_user


# ── Internal helpers ──────────────────────────────────────────────────────────

async def _get_or_create_chat(chat_id: str | None, user_id: str) -> tuple[str, list[ChatMessage]]:
    """
    Fetch existing chat history or initialise a new chat.

    Returns:
        (chat_id, list_of_ChatMessage)
    """
    chats = get_chats_collection()

    if chat_id:
        doc = await chats.find_one({"chat_id": chat_id, "user_id": user_id})
        if doc is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found.")
        messages = [ChatMessage(**m) for m in doc.get("messages", [])]
        return chat_id, messages

    # New conversation
    new_chat_id = str(uuid.uuid4())
    await chats.insert_one({
        "chat_id": new_chat_id,
        "user_id": user_id,
        "messages": [],
        "created_at": datetime.utcnow(),
    })
    return new_chat_id, []


async def _append_messages(chat_id: str, user_msg: str, assistant_reply: str) -> None:
    """Persist both turns to the chat document atomically."""
    chats = get_chats_collection()
    now = datetime.utcnow()
    await chats.update_one(
        {"chat_id": chat_id},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": user_msg, "created_at": now},
                        {"role": "assistant", "content": assistant_reply, "created_at": now},
                    ]
                }
            },
            "$set": {"updated_at": now},
        },
    )


async def _deduct_minute(user_id: str) -> int:
    """
    Atomically decrement balance_minutes by 1.

    Returns:
        The new (post-decrement) balance.
    """
    users = get_users_collection()
    result = await users.find_one_and_update(
        {"_id": ObjectId(user_id), "balance_minutes": {"$gt": 0}},
        {"$inc": {"balance_minutes": -1}},
        return_document=True,  # return AFTER update
    )
    if result is None:
        # Balance hit 0 between the check and the update (race condition guard)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=LOW_BALANCE_MESSAGE)
    return result["balance_minutes"]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse, summary="Send a text message")
async def chat(
    payload: ChatRequest,
    current_user: dict = Depends(check_balance),
) -> ChatResponse:
    """
    Main chat endpoint.

    1. Validate JWT and check balance (via dependency).
    2. Fetch or create conversation.
    3. Call Groq AI with full history.
    4. Persist both turns.
    5. Deduct 1 minute from user balance.
    6. Return the AI reply and remaining minutes.
    """
    user_id = str(current_user["_id"])

    try:
        chat_id, history = await _get_or_create_chat(payload.chat_id, user_id)
        reply = await get_ai_response(payload.message, history, user_id)
    except ValueError as exc:
        # Rate limit exceeded
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc))
    except RuntimeError as exc:
        logger.error("AI service error for user %s: %s", user_id, exc)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    await _append_messages(chat_id, payload.message, reply)
    minutes_remaining = await _deduct_minute(user_id)

    return ChatResponse(reply=reply, chat_id=chat_id, minutes_remaining=minutes_remaining)


@router.get(
    "/history/{chat_id}",
    response_model=ChatHistoryResponse,
    summary="Get conversation history",
)
async def get_history(
    chat_id: str,
    current_user: dict = Depends(get_current_user),
) -> ChatHistoryResponse:
    """Return the full message history for a conversation owned by the current user."""
    user_id = str(current_user["_id"])
    chats = get_chats_collection()

    doc = await chats.find_one({"chat_id": chat_id, "user_id": user_id})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found.")

    messages = [ChatMessage(**m) for m in doc.get("messages", [])]
    return ChatHistoryResponse(chat_id=chat_id, messages=messages)


@router.post("/voice", summary="Send a voice message, receive audio reply")
async def voice_chat(
    audio: UploadFile = File(..., description="Audio file (mp3, wav, webm, ogg)"),
    current_user: dict = Depends(check_balance),
) -> Response:
    """
    Voice pipeline:
      1. Validate audio MIME type.
      2. Transcribe with Groq Whisper.
      3. Feed transcription through AI.
      4. Convert reply to WAV via TTS service.
      5. Deduct 1 minute.
      6. Return WAV audio.
    """
    if audio.content_type and not validate_audio_content_type(audio.content_type):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported audio format: {audio.content_type}. "
                   "Use mp3, wav, webm, ogg, or m4a.",
        )

    user_id = str(current_user["_id"])
    audio_bytes = await audio.read()

    # Step 1: Transcribe
    try:
        text = await transcribe_audio(audio_bytes, filename=audio.filename or "audio.webm")
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    if not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not transcribe audio — please try speaking more clearly.",
        )

    # Step 2: AI response (new chat each voice message for simplicity in MVP)
    try:
        chat_id, history = await _get_or_create_chat(None, user_id)
        reply = await get_ai_response(text, history, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    await _append_messages(chat_id, text, reply)
    await _deduct_minute(user_id)

    # Step 3: TTS
    wav_bytes = await text_to_speech(reply)

    return Response(
        content=wav_bytes,
        media_type="audio/wav",
        headers={"X-Transcript": text[:200], "X-Chat-Id": chat_id},
    )