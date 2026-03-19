from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.email_template import EmailTemplate
from app.schemas.email_template import EmailTemplateOut, EmailTemplateUpdate
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/email-templates", tags=["email-templates"])

DEFAULTS = [
    {
        "status_key": "confirmation",
        "label": "Підтвердження заявки",
        "subject": "Thank you for reaching out — Alexa Bodnar Photography",
        "body": (
            "Hi {name},\n\n"
            "Thank you for reaching out! I'll be in touch with you shortly.\n\n"
            "With love,\nAlexa"
        ),
    },
    {
        "status_key": "accepted",
        "label": "Заявку прийнято",
        "subject": "Your inquiry has been accepted — Alexa Bodnar Photography",
        "body": (
            "Hi {name},\n\n"
            "Your inquiry has been accepted! I'm excited to work with you and will be in touch shortly to discuss all the details.\n\n"
            "With love,\nAlexa"
        ),
    },
    {
        "status_key": "rejected",
        "label": "Заявку відхилено",
        "subject": "Update on your inquiry — Alexa Bodnar Photography",
        "body": (
            "Hi {name},\n\n"
            "Thank you for reaching out. Unfortunately, I'm unable to take on your inquiry at this time. "
            "I hope we'll have the opportunity to work together in the future.\n\n"
            "With love,\nAlexa"
        ),
    },
    {
        "status_key": "completed",
        "label": "Сесію завершено",
        "subject": "Your session is complete — Alexa Bodnar Photography",
        "body": (
            "Hi {name},\n\n"
            "It was an absolute pleasure working with you! "
            "Your session is now complete. I can't wait to share the final results with you.\n\n"
            "With love,\nAlexa"
        ),
    },
]


async def seed_defaults(db: AsyncSession) -> None:
    for d in DEFAULTS:
        result = await db.execute(
            select(EmailTemplate).where(EmailTemplate.status_key == d["status_key"])
        )
        if not result.scalar_one_or_none():
            db.add(EmailTemplate(**d))
    await db.commit()


@router.get("/", response_model=list[EmailTemplateOut])
@router.get("", response_model=list[EmailTemplateOut])
async def get_templates(db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(EmailTemplate).order_by(EmailTemplate.id))
    return result.scalars().all()


@router.get("/{status_key}", response_model=EmailTemplateOut)
async def get_template(status_key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EmailTemplate).where(EmailTemplate.status_key == status_key)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Template not found")
    return item


@router.put("/{status_key}", response_model=EmailTemplateOut)
async def update_template(
    status_key: str,
    data: EmailTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(
        select(EmailTemplate).where(EmailTemplate.status_key == status_key)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Template not found")
    item.subject = data.subject
    item.body = data.body
    await db.commit()
    await db.refresh(item)
    return item
