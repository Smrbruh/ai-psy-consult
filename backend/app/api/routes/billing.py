"""
Billing & payment routes.

GET  /api/user/balance      — current minutes balance
POST /api/payment/webhook   — ApiPay webhook (HMAC-verified)
GET  /api/payment/history   — paginated payment history
"""

import hashlib
import hmac
import logging
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.core.database import get_payments_collection, get_users_collection
from app.models import PaymentRecord, PaymentWebhook

logger = logging.getLogger(__name__)
router = APIRouter()

# 100 RUB → 100 minutes (configurable via MINUTES_PER_RUB in settings)
MINUTES_PER_RUB = settings.MINUTES_PER_RUB


# ── Helpers ───────────────────────────────────────────────────────────────────

def _verify_apipay_signature(raw_body: bytes, received_sig: str | None) -> bool:
    """
    Verify the X-ApiPay-Signature header using HMAC-SHA256.
    Returns False if the header is missing or the signature doesn't match.
    """
    if not received_sig:
        return False
    expected = hmac.new(
        settings.APIPAY_SECRET_KEY.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, received_sig)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/balance", summary="Get current balance in minutes")
async def get_balance(current_user: dict = Depends(get_current_user)) -> dict:
    """Return the authenticated user's remaining minutes."""
    return {
        "balance_minutes": current_user.get("balance_minutes", 0),
        "email": current_user["email"],
    }


@router.post("/webhook", summary="ApiPay payment webhook", status_code=status.HTTP_200_OK)
async def payment_webhook(request: Request) -> dict:
    """
    Receive and process an ApiPay payment notification.

    Security:
      - Verify HMAC-SHA256 signature before touching the database.
      - Skip duplicate payments (idempotent by payment_id).
      - Only credit balance for status == "success".

    Payload example:
      {
        "payment_id": "pay_abc123",
        "amount": 500,
        "status": "success",
        "metadata": {"user_id": "<mongo_user_id>"}
      }
    """
    # 1. Read raw body BEFORE parsing JSON (needed for signature verification)
    raw_body = await request.body()
    received_sig = request.headers.get("X-ApiPay-Signature")

    if not _verify_apipay_signature(raw_body, received_sig):
        logger.warning("Invalid webhook signature — possible spoofed request.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature.",
        )

    # 2. Parse payload
    import json
    try:
        data = json.loads(raw_body)
        webhook = PaymentWebhook(**data)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid payload: {exc}",
        )

    payments = get_payments_collection()
    users = get_users_collection()

    # 3. Idempotency — skip if already processed
    existing = await payments.find_one({"payment_id": webhook.payment_id})
    if existing:
        logger.info("Duplicate webhook received for payment_id=%s — skipping.", webhook.payment_id)
        return {"status": "already_processed"}

    # 4. Only credit on successful payments
    if webhook.status != "success":
        logger.info("Webhook for payment_id=%s has status=%s — skipping.", webhook.payment_id, webhook.status)
        await payments.insert_one({
            "payment_id": webhook.payment_id,
            "amount": webhook.amount,
            "minutes_added": 0,
            "status": webhook.status,
            "user_id": webhook.metadata.get("user_id", "unknown"),
            "created_at": datetime.utcnow(),
        })
        return {"status": "acknowledged"}

    # 5. Resolve user
    user_id_str = webhook.metadata.get("user_id")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="metadata.user_id is required.",
        )

    try:
        user_oid = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="metadata.user_id is not a valid ObjectId.",
        )

    user = await users.find_one({"_id": user_oid})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id_str} not found.",
        )

    # 6. Credit minutes
    minutes_to_add = int(webhook.amount * MINUTES_PER_RUB)
    await users.update_one(
        {"_id": user_oid},
        {"$inc": {"balance_minutes": minutes_to_add}},
    )

    # 7. Record payment
    await payments.insert_one({
        "payment_id": webhook.payment_id,
        "amount": webhook.amount,
        "minutes_added": minutes_to_add,
        "status": "success",
        "user_id": user_id_str,
        "created_at": datetime.utcnow(),
    })

    logger.info(
        "Payment processed: user=%s amount=%.2f RUB → +%d minutes",
        user_id_str, webhook.amount, minutes_to_add,
    )
    return {"status": "ok", "minutes_added": minutes_to_add}


@router.get(
    "/history",
    response_model=list[PaymentRecord],
    summary="Get payment history for current user",
)
async def payment_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 20,
    skip: int = 0,
) -> list[PaymentRecord]:
    """
    Return the authenticated user's payment history, newest first.
    Supports simple pagination via `limit` and `skip` query params.
    """
    payments = get_payments_collection()
    user_id = str(current_user["_id"])

    cursor = (
        payments.find({"user_id": user_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(min(limit, 100))  # cap at 100 per page
    )

    records = []
    async for doc in cursor:
        records.append(
            PaymentRecord(
                payment_id=doc["payment_id"],
                amount=doc["amount"],
                minutes_added=doc.get("minutes_added", 0),
                status=doc["status"],
                created_at=doc["created_at"],
            )
        )
    return records