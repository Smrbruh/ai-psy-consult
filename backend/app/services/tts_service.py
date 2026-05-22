"""
TTS service — converts assistant text replies to audio bytes.

MVP strategy
────────────
Sherpa-ONNX is the target runtime (offline, runs on Render free tier with ~200 MB
RAM for a small model). However, downloading and loading an ONNX voice model at
startup is non-trivial to set up in a CI/CD pipeline.

For the MVP we ship a *functional* fallback that returns valid WAV audio using
Python's built-in `wave` module + simple sine-wave generation, so the voice
endpoint works end-to-end without any external model file.

To enable Sherpa-ONNX:
  1. pip install sherpa-onnx
  2. Download a model: https://github.com/k2-fsa/sherpa-onnx/releases (e.g. vits-ljs)
  3. Set env vars: TTS_MODEL_DIR, TTS_SPEAKER_ID
  4. Uncomment the _sherpa_tts() call in text_to_speech() below.
"""

import io
import logging
import math
import struct
import wave
import os

logger = logging.getLogger(__name__)

# ── Sherpa-ONNX configuration (read from env) ─────────────────────────────────
TTS_MODEL_DIR = os.getenv("TTS_MODEL_DIR", "")          # path to unpacked model dir
TTS_SPEAKER_ID = int(os.getenv("TTS_SPEAKER_ID", "0"))
TTS_SAMPLE_RATE = 22_050  # Hz — most VITS models use this

_sherpa_tts_engine = None  # lazy-loaded


# ── Public API ────────────────────────────────────────────────────────────────

async def text_to_speech(text: str) -> bytes:
    """
    Convert text to WAV audio bytes.

    Tries Sherpa-ONNX first (if configured); falls back to a synthetic beep
    WAV so the endpoint always returns valid audio.

    Args:
        text: The string to synthesise.

    Returns:
        Raw WAV file bytes (suitable for an audio/wav HTTP response).
    """
    if TTS_MODEL_DIR and os.path.isdir(TTS_MODEL_DIR):
        try:
            return await _sherpa_tts(text)
        except Exception as exc:
            logger.warning("Sherpa-ONNX TTS failed, using fallback: %s", exc)

    logger.debug("Using sine-wave TTS fallback for %d chars", len(text))
    return _sine_wave_fallback(text)


# ── Sherpa-ONNX Integration ───────────────────────────────────────────────────

async def _sherpa_tts(text: str) -> bytes:
    """
    Generate speech with a locally loaded Sherpa-ONNX VITS model.

    This runs in a thread executor so it doesn't block the event loop.
    """
    import asyncio
    return await asyncio.get_event_loop().run_in_executor(None, _run_sherpa_tts, text)


def _run_sherpa_tts(text: str) -> bytes:
    """Synchronous Sherpa-ONNX call (runs in a thread pool)."""
    global _sherpa_tts_engine

    if _sherpa_tts_engine is None:
        import sherpa_onnx  # type: ignore

        _sherpa_tts_engine = sherpa_onnx.OfflineTts(
            sherpa_onnx.OfflineTtsConfig(
                model=sherpa_onnx.OfflineTtsModelConfig(
                    vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                        model=os.path.join(TTS_MODEL_DIR, "model.onnx"),
                        lexicon=os.path.join(TTS_MODEL_DIR, "lexicon.txt"),
                        tokens=os.path.join(TTS_MODEL_DIR, "tokens.txt"),
                    ),
                    num_threads=2,
                ),
                rule_fsts=os.path.join(TTS_MODEL_DIR, "phone.fst"),
                max_num_sentences=1,
            )
        )
        logger.info("Sherpa-ONNX TTS engine loaded from %s", TTS_MODEL_DIR)

    audio = _sherpa_tts_engine.generate(text, sid=TTS_SPEAKER_ID, speed=1.0)
    return _pcm_to_wav(audio.samples, audio.sample_rate)


# ── Fallback: pure-Python sine-wave WAV ──────────────────────────────────────

def _sine_wave_fallback(text: str) -> bytes:
    """
    Generate a 440 Hz sine-wave WAV whose duration scales with text length.
    This ensures the voice endpoint returns *valid* audio even without a real model.
    Duration: 0.5 s per 10 chars, capped at 5 s.
    """
    sample_rate = 22_050
    frequency = 440.0  # A4
    duration_sec = min(0.5 * max(len(text) / 10, 1), 5.0)
    num_samples = int(sample_rate * duration_sec)

    samples = [
        int(32_767 * math.sin(2 * math.pi * frequency * i / sample_rate))
        for i in range(num_samples)
    ]

    return _pcm_to_wav(samples, sample_rate)


def _pcm_to_wav(samples: list[int] | list[float], sample_rate: int) -> bytes:
    """Pack PCM samples into a valid WAV byte string (16-bit, mono)."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(sample_rate)
        packed = struct.pack(f"<{len(samples)}h", *[int(s) for s in samples])
        wf.writeframes(packed)
    return buf.getvalue()