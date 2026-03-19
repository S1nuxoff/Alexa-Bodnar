"""
Telegram Bot Microservice
Consumes: inquiry_notifications
Sends: Telegram notification to admin group
Run: python main.py
"""
import asyncio
import json
import logging
import os

import aio_pika
import httpx
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

QUEUE_INQUIRY = "inquiry_tg"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [TG-BOT] %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)


def build_message(data: dict) -> str:
    lines = ["📬 *Нова заявка з сайту!*", ""]
    lines.append(f"👤 *Ім'я:* {data.get('name', '—')}")
    if data.get("partner_name"):
        lines.append(f"💑 *Партнер:* {data['partner_name']}")
    lines.append(f"📧 *Email:* {data.get('email', '—')}")
    lines.append(f"📞 *Телефон:* {data.get('phone', '—')}")
    if data.get("service"):
        lines.append(f"🎯 *Послуга:* {data['service']}")
    if data.get("session_date"):
        lines.append(f"📅 *Дата:* {data['session_date']}")
    if data.get("venue"):
        lines.append(f"📍 *Місце:* {data['venue']}")
    if data.get("budget"):
        lines.append(f"💰 *Бюджет:* {data['budget']}")
    if data.get("how_found"):
        lines.append(f"🔍 *Як знайшли:* {data['how_found']}")
    if data.get("message"):
        short = data["message"][:300] + ("…" if len(data["message"]) > 300 else "")
        lines += ["", f"💬 _{short}_"]
    return "\n".join(lines)


async def send_notification(data: dict) -> None:
    text = build_message(data)
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": text,
                "parse_mode": "Markdown",
            })
            resp.raise_for_status()
        logger.info(f"Notification sent for inquiry #{data.get('id')}")
    except Exception as e:
        logger.error(f"Telegram send failed: {e}")


async def on_message(message: aio_pika.IncomingMessage) -> None:
    async with message.process():
        try:
            data = json.loads(message.body)
            await send_notification(data)
        except Exception as e:
            logger.error(f"Error processing message: {e}")


async def main() -> None:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set")
        return

    logger.info("Connecting to RabbitMQ...")
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    logger.info("Connected. Waiting for messages...")

    channel = await connection.channel()
    await channel.set_qos(prefetch_count=5)
    queue = await channel.declare_queue(QUEUE_INQUIRY, durable=True)
    await queue.consume(on_message)

    logger.info(f"Listening on queue: {QUEUE_INQUIRY}")
    try:
        await asyncio.Future()
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
