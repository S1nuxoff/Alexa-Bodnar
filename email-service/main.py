"""
Email Service Microservice
Consumes:
  - inquiry_email        → sends thank-you confirmation to client
  - inquiry_status_email → sends status update to client (accepted/rejected/completed)
  - broadcast_emails     → sends bulk newsletter emails
Run: python main.py
"""
import asyncio
import json
import logging
import mimetypes
import os
import smtplib
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aio_pika
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

load_dotenv()

RABBITMQ_URL  = os.getenv("RABBITMQ_URL", "")
SMTP_EMAIL    = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "")
DATABASE_URL  = os.getenv("DATABASE_URL", "")

QUEUE_INQUIRY   = "inquiry_email"
QUEUE_STATUS    = "inquiry_status_email"
QUEUE_BROADCAST = "broadcast_emails"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [EMAIL-SVC] %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# DB engine (used only for updating broadcast sent_count)
engine = create_async_engine(DATABASE_URL, echo=False) if DATABASE_URL else None
SessionLocal = async_sessionmaker(engine, expire_on_commit=False) if engine else None


# ── HTML templates ────────────────────────────────────────────────────────────

def html_confirmation(name: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Thank you</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;">
        <tr><td style="background:#141414;padding:40px 48px;text-align:center;">
          <p style="margin:0;font-size:13px;letter-spacing:0.2em;color:#fff;text-transform:uppercase;">Alexa Bodnar Photography</p>
        </td></tr>
        <tr><td style="padding:48px;color:#141414;">
          <p style="margin:0 0 24px;font-size:32px;font-style:italic;">Thank you, {name}!</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">
            Your inquiry has been received and I'll be in touch with you shortly.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">
            Feel free to explore my portfolio and get inspired for your upcoming session.
          </p>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
            With love,<br/><span style="font-style:italic;font-size:18px;">Alexa</span>
          </p>
        </td></tr>
        <tr><td style="padding:24px 48px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">
            Alexa Bodnar Photography
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


def html_status(name: str, status: str) -> str:
    if status == "accepted":
        heading = f"Great news, {name}!"
        body_text = (
            "Your inquiry has been <strong>accepted</strong>! "
            "I'm excited to work with you and will be in touch shortly to discuss all the details."
        )
        plain = f"Hi {name},\n\nYour inquiry has been accepted! I'll be in touch shortly.\n\nWith love,\nAlexa"
    elif status == "rejected":
        heading = f"Hi {name},"
        body_text = (
            "Thank you for reaching out. Unfortunately, I'm unable to take on your inquiry at this time. "
            "I hope we'll have the opportunity to work together in the future."
        )
        plain = f"Hi {name},\n\nThank you for reaching out. Unfortunately, your inquiry cannot be accommodated at this time.\n\nWith love,\nAlexa"
    else:  # completed
        heading = f"Thank you, {name}!"
        body_text = (
            "It was an absolute pleasure working with you! "
            "Your session is now complete. I can't wait to share the final results with you."
        )
        plain = f"Hi {name},\n\nThank you! It was a pleasure working with you. Your session is complete.\n\nWith love,\nAlexa"

    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Update from Alexa Bodnar Photography</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;">
        <tr><td style="background:#141414;padding:40px 48px;text-align:center;">
          <p style="margin:0;font-size:13px;letter-spacing:0.2em;color:#fff;text-transform:uppercase;">Alexa Bodnar Photography</p>
        </td></tr>
        <tr><td style="padding:48px;color:#141414;">
          <p style="margin:0 0 24px;font-size:32px;font-style:italic;">{heading}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">{body_text}</p>
          <p style="margin:32px 0 0;font-size:15px;line-height:1.7;color:#444;">
            With love,<br/><span style="font-style:italic;font-size:18px;">Alexa</span>
          </p>
        </td></tr>
        <tr><td style="padding:24px 48px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">Alexa Bodnar Photography</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>""", plain


def _wrap_html(body_html: str) -> str:
    """Wrap body content in branded email layout."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Alexa Bodnar Photography</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;">
        <tr><td style="background:#141414;padding:40px 48px;text-align:center;">
          <p style="margin:0;font-size:13px;letter-spacing:0.2em;color:#fff;text-transform:uppercase;">Alexa Bodnar Photography</p>
        </td></tr>
        <tr><td style="padding:48px;color:#141414;">
          {body_html}
        </td></tr>
        <tr><td style="padding:24px 48px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">Alexa Bodnar Photography</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


def html_from_text(name: str, plain: str) -> str:
    """Convert plain text body (with \\n) into branded HTML email."""
    lines = plain.split("\n")
    paragraphs = "".join(
        f'<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">{line}</p>'
        if line.strip() else '<p style="margin:0 0 8px;"></p>'
        for line in lines
    )
    return _wrap_html(paragraphs)


def html_confirmation_from_text(name: str, plain: str) -> str:
    return html_from_text(name, plain)


SIZE_WIDTHS = {"full": "100%", "large": "70%", "small": "40%"}


def _inline_img(size: str) -> str:
    w = SIZE_WIDTHS.get(size, "100%")
    return '<img src="cid:broadcast_img" alt="" style="width:%s;border:0;border-radius:4px;display:inline-block;" />' % w


def html_broadcast(
    name: str, subject: str, body: str,
    has_image: bool = False, signature: str = "", greeting_tpl: str = "",
    image_position: str = "top", image_size: str = "full",
) -> str:
    if greeting_tpl:
        greeting = greeting_tpl.replace("{name}", name)
    else:
        greeting = ("Hi %s," % name) if name else "Hi there,"

    body_html = body.replace("\n", "<br/>")
    sig_html = signature.replace("\n", "<br/>") if signature else \
        'With love,<br/><span style="font-style:italic;font-size:18px;">Alexa</span>'

    # top image — full bleed, no padding
    top_img = (
        '<tr><td style="padding:0"><img src="cid:broadcast_img" alt="" style="width:100%;display:block;border:0;"/></td></tr>'
        if (has_image and image_position == "top" and image_size == "full") else
        '<tr><td style="padding:24px 48px 0;text-align:center;">%s</td></tr>' % _inline_img(image_size)
        if (has_image and image_position == "top") else ""
    )

    before_body_img = (
        '<div style="margin:0 0 24px;text-align:center;">%s</div>' % _inline_img(image_size)
        if (has_image and image_position == "before_body") else ""
    )

    after_body_img = (
        '<div style="margin:24px 0 0;text-align:center;">%s</div>' % _inline_img(image_size)
        if (has_image and image_position == "after_body") else ""
    )

    bottom_img = (
        '<tr><td style="padding:0 48px 24px;text-align:center;">%s</td></tr>' % _inline_img(image_size)
        if (has_image and image_position == "bottom") else ""
    )

    return (
        "<!DOCTYPE html>"
        '<html lang="en"><head><meta charset="UTF-8"/><title>' + subject + "</title></head>"
        "<body style=\"margin:0;padding:0;background:#f5f5f5;font-family:'Georgia',serif;\">"
        '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">'
        '<tr><td align="center">'
        '<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;">'
        '<tr><td style="background:#141414;padding:32px 48px;text-align:center;">'
        '<p style="margin:0;font-size:13px;letter-spacing:0.2em;color:#fff;text-transform:uppercase;">Alexa Bodnar Photography</p>'
        '</td></tr>'
        + top_img +
        '<tr><td style="padding:48px;color:#141414;">'
        '<p style="margin:0 0 24px;font-size:22px;">' + greeting + '</p>'
        + before_body_img +
        '<div style="font-size:15px;line-height:1.8;color:#333;">' + body_html + '</div>'
        + after_body_img +
        '<p style="margin:32px 0 0;font-size:15px;color:#444;">' + sig_html + '</p>'
        '</td></tr>'
        + bottom_img +
        '<tr><td style="padding:24px 48px 40px;text-align:center;">'
        '<p style="margin:0;font-size:12px;letter-spacing:0.15em;color:#999;text-transform:uppercase;">Alexa Bodnar Photography</p>'
        '</td></tr>'
        '</table></td></tr></table>'
        '</body></html>'
    )


# ── SMTP ──────────────────────────────────────────────────────────────────────

def _smtp_send(to_email: str, subject: str, html: str, plain: str, image_path: str = "") -> None:
    has_image = bool(image_path and os.path.exists(image_path))

    if has_image:
        # multipart/related wraps alternative + inline image
        outer = MIMEMultipart("related")
        alt = MIMEMultipart("alternative")
        alt.attach(MIMEText(plain, "plain"))
        alt.attach(MIMEText(html, "html"))
        outer.attach(alt)
        mime_type, _ = mimetypes.guess_type(image_path)
        sub = (mime_type or "image/jpeg").split("/")[-1]
        with open(image_path, "rb") as f:
            img = MIMEImage(f.read(), _subtype=sub)
        img.add_header("Content-ID", "<broadcast_img>")
        img.add_header("Content-Disposition", "inline", filename=os.path.basename(image_path))
        outer.attach(img)
        msg = outer
    else:
        msg = MIMEMultipart("alternative")
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html, "html"))

    msg["Subject"] = subject
    msg["From"] = "Alexa Bodnar Photography <%s>" % SMTP_EMAIL
    msg["To"] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())


async def send_email(to_email: str, subject: str, html: str, plain: str, image_path: str = "") -> bool:
    try:
        await asyncio.to_thread(_smtp_send, to_email, subject, html, plain, image_path)
        logger.info("Sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send to %s: %s", to_email, e)
        return False


# ── DB helper ─────────────────────────────────────────────────────────────────

async def increment_sent(broadcast_id: int, total: int) -> None:
    if not SessionLocal:
        return
    try:
        async with SessionLocal() as session:
            await session.execute(
                text("""
                    UPDATE broadcasts
                    SET sent_count = sent_count + 1,
                        status = CASE WHEN sent_count + 1 >= total_recipients THEN 'done' ELSE status END
                    WHERE id = :id
                """),
                {"id": broadcast_id},
            )
            await session.commit()
    except Exception as e:
        logger.error(f"DB update failed for broadcast #{broadcast_id}: {e}")


# ── Message handlers ──────────────────────────────────────────────────────────

async def get_template(status_key: str) -> dict | None:
    """Fetch email template from DB. Returns None if not found."""
    if not SessionLocal:
        return None
    try:
        async with SessionLocal() as session:
            result = await session.execute(
                text("SELECT subject, body FROM email_templates WHERE status_key = :k"),
                {"k": status_key},
            )
            row = result.fetchone()
            if row:
                return {"subject": row[0], "body": row[1]}
    except Exception as e:
        logger.error(f"Failed to fetch template '{status_key}': {e}")
    return None


async def handle_inquiry(data: dict) -> None:
    name = data.get("name", "")
    email = data.get("email", "")
    if not email:
        return

    tpl = await get_template("confirmation")
    if tpl:
        subject = tpl["subject"]
        plain = tpl["body"].replace("{name}", name)
        html = html_confirmation_from_text(name, plain)
    else:
        subject = "Thank you for reaching out — Alexa Bodnar Photography"
        plain = f"Hi {name},\n\nThank you for reaching out! I'll be in touch shortly.\n\nWith love,\nAlexa"
        html = html_confirmation(name)

    await send_email(to_email=email, subject=subject, html=html, plain=plain)


async def handle_status(data: dict) -> None:
    name   = data.get("name", "")
    email  = data.get("email", "")
    status = data.get("status", "")
    if not email or status not in ("accepted", "rejected", "completed"):
        return

    tpl = await get_template(status)
    if tpl:
        subject = tpl["subject"]
        plain = tpl["body"].replace("{name}", name)
        html = html_from_text(name, plain)
    else:
        subjects = {
            "accepted":  "Your inquiry has been accepted — Alexa Bodnar Photography",
            "rejected":  "Update on your inquiry — Alexa Bodnar Photography",
            "completed": "Your session is complete — Alexa Bodnar Photography",
        }
        html, plain = html_status(name, status)
        subject = subjects[status]

    await send_email(to_email=email, subject=subject, html=html, plain=plain)


async def handle_broadcast(data: dict) -> None:
    name         = data.get("to_name", "")
    email        = data.get("to_email", "")
    subject      = data.get("subject", "")
    body         = data.get("body", "")
    greeting_tpl = data.get("greeting", "")
    signature    = data.get("signature", "")
    image_path      = data.get("image_path", "")
    image_position  = data.get("image_position", "top")
    image_size      = data.get("image_size", "full")
    b_id            = data.get("broadcast_id")
    total      = data.get("total", 0)

    if not email:
        return

    has_image = bool(image_path and os.path.exists(image_path))
    plain_sig = signature if signature else "With love,\nAlexa"
    ok = await send_email(
        to_email=email,
        subject=subject,
        html=html_broadcast(name, subject, body, has_image, signature, greeting_tpl, image_position, image_size),
        plain="Hi %s,\n\n%s\n\n%s" % (name, body, plain_sig),
        image_path=image_path,
    )
    if ok and b_id:
        await increment_sent(b_id, total)


# ── Consumer ──────────────────────────────────────────────────────────────────

async def main() -> None:
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.error("SMTP_EMAIL or SMTP_PASSWORD not set")
        return

    logger.info("Connecting to RabbitMQ...")
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    logger.info("Connected. Waiting for messages...")

    channel = await connection.channel()
    await channel.set_qos(prefetch_count=5)

    inquiry_queue   = await channel.declare_queue(QUEUE_INQUIRY,   durable=True)
    status_queue    = await channel.declare_queue(QUEUE_STATUS,    durable=True)
    broadcast_queue = await channel.declare_queue(QUEUE_BROADCAST, durable=True)

    async def on_inquiry(msg: aio_pika.IncomingMessage) -> None:
        async with msg.process():
            try:
                await handle_inquiry(json.loads(msg.body))
            except Exception as e:
                logger.error(f"Error: {e}")

    async def on_status(msg: aio_pika.IncomingMessage) -> None:
        async with msg.process():
            try:
                await handle_status(json.loads(msg.body))
            except Exception as e:
                logger.error(f"Error: {e}")

    async def on_broadcast(msg: aio_pika.IncomingMessage) -> None:
        async with msg.process():
            try:
                await handle_broadcast(json.loads(msg.body))
            except Exception as e:
                logger.error(f"Error: {e}")

    await inquiry_queue.consume(on_inquiry)
    await status_queue.consume(on_status)
    await broadcast_queue.consume(on_broadcast)

    logger.info(f"Listening on: {QUEUE_INQUIRY}, {QUEUE_STATUS}, {QUEUE_BROADCAST}")
    try:
        await asyncio.Future()
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
