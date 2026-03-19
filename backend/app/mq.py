import json
import logging
import aio_pika
from typing import Optional

logger = logging.getLogger(__name__)
_connection: Optional[aio_pika.RobustConnection] = None

async def connect(url: str) -> None:
    global _connection
    try:
        _connection = await aio_pika.connect_robust(url)
        logger.info("Connected to RabbitMQ")
    except Exception as e:
        logger.warning(f"RabbitMQ not available: {e}")

async def close() -> None:
    global _connection
    if _connection:
        await _connection.close()

async def publish(queue_name: str, message: dict) -> None:
    if not _connection or _connection.is_closed:
        return
    try:
        channel = await _connection.channel()
        await channel.declare_queue(queue_name, durable=True)
        await channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(message).encode(),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            ),
            routing_key=queue_name,
        )
        await channel.close()
    except Exception as e:
        logger.warning(f"Failed to publish to {queue_name}: {e}")
