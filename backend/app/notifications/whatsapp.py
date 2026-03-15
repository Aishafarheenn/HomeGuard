"""
WhatsApp integration for reminders and report notifications (HomeGuard Kerala spec).
Set WHATSAPP_ENABLED=1 and Twilio env vars to send; otherwise in-app notifications only.
"""
import logging
import os

logger = logging.getLogger("homeguard.whatsapp")


def send_whatsapp(phone: str, body: str) -> bool:
    """
    Send a WhatsApp message. Uses Twilio when WHATSAPP_ENABLED and credentials are set.
    phone: E.164 format (e.g. +919876543210).
    Returns True if sent (or skipped because disabled), False on send failure.
    """
    if not phone or not body:
        return True
    if not os.getenv("WHATSAPP_ENABLED", "").strip().lower() in ("1", "true", "yes"):
        logger.debug("WhatsApp disabled; would send to %s: %s", phone[:6] + "***", body[:50])
        return True
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
    if not account_sid or not auth_token:
        logger.warning("WhatsApp enabled but TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set")
        return False
    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        to = phone if phone.startswith("whatsapp:") else f"whatsapp:{phone}"
        client.messages.create(body=body, from_=from_number, to=to)
        logger.info("WhatsApp sent to %s", to)
        return True
    except Exception as e:
        logger.exception("WhatsApp send failed: %s", e)
        return False


def send_reminder(phone: str, property_address: str, scheduled_date: str) -> bool:
    """Reminder for upcoming inspection."""
    body = f"HomeGuard: Reminder – inspection scheduled for {property_address} on {scheduled_date}."
    return send_whatsapp(phone, body)


def send_report_ready(phone: str, property_address: str, report_url: str, base_url: str = "") -> str:
    """Notify owner that inspection report is ready."""
    full_url = report_url if report_url.startswith("http") else f"{base_url.rstrip('/')}{report_url}"
    body = f"HomeGuard: Inspection completed for {property_address}. View report: {full_url}"
    send_whatsapp(phone, body)
    return body
