"""
Whisper service — transcribes audio to text using Groq's Whisper API.

Using the cloud API (not a local model) keeps RAM usage minimal on Render's
free tier, where 512 MB is the practical ceiling.

Supported formats: mp3, wav, webm, ogg, m4a, flac
"""

import io
import logging
from typing import BinaryIO

from groq import AsyncGroq

from app.core.config import settings

logger = logging.getLogger(__name__)

# Supported MIME types that Groq Whisper accepts
SUPPORTED_CONTENT_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/m4a",
    "audio/mp4",
    "audio/flac",
    "audio/x-flac",
}

# Maximum file size allowed (25 MB — Groq's limit)
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

# Shared async client
_groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Transcribe an audio file to text via Groq's Whisper API.

    Args:
        audio_bytes: Raw audio bytes (from UploadFile.read()).
        filename:    Original filename — used by Groq to detect the format.

    Returns:
        Transcribed text string (may be empty if audio is silent).

    Raises:
        ValueError: If the file exceeds the size limit.
        RuntimeError: If the Groq Whisper API call fails.
    """
    if len(audio_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(
            f"Audio file too large ({len(audio_bytes) / 1_048_576:.1f} MB). "
            f"Maximum is {MAX_FILE_SIZE_BYTES // 1_048_576} MB."
        )

    logger.debug("Transcribing %.1f KB audio file: %s", len(audio_bytes) / 1024, filename)

    try:
        # Groq expects a file-like tuple: (filename, bytes, content-type)
        transcription = await _groq_client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=(filename, audio_bytes),
            response_format="text",
            language="ru",          # Default to Russian; remove to auto-detect
        )
    except Exception as exc:
        logger.error("Groq Whisper API error: %s", exc)
        raise RuntimeError(f"Transcription failed: {exc}") from exc

    # Groq returns a plain string when response_format="text"
    text = transcription.strip() if isinstance(transcription, str) else transcription.text.strip()
    logger.debug("Transcription result (%d chars)", len(text))
    return text


def validate_audio_content_type(content_type: str) -> bool:
    """Return True if the MIME type is accepted by Groq Whisper."""
    return content_type.lower() in SUPPORTED_CONTENT_TYPES