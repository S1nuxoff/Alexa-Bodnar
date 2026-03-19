import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.broadcast import Broadcast
from app.models.inquiry import Inquiry
from app.schemas.broadcast import BroadcastCreate, BroadcastOut
from app.routers.auth import get_current_admin
from app import mq

router = APIRouter(prefix="/broadcasts", tags=["broadcasts"])

BROADCAST_IMAGES_DIR = "uploads/broadcast_images"
VALID_STATUSES = {"new", "accepted", "rejected", "closed", "completed"}


def _recipients_query(group: str):
    query = select(Inquiry.email, func.min(Inquiry.name).label("name")).group_by(Inquiry.email)
    if group != "all" and group in VALID_STATUSES:
        query = query.where(Inquiry.status == group)
    elif group not in ("all", *VALID_STATUSES):
        statuses = [s.strip() for s in group.split(",") if s.strip() in VALID_STATUSES]
        if statuses:
            query = query.where(Inquiry.status.in_(statuses))
    return query


@router.get("/", response_model=list[BroadcastOut])
@router.get("", response_model=list[BroadcastOut])
async def get_broadcasts(db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(Broadcast).order_by(Broadcast.created_at.desc()))
    return result.scalars().all()


@router.post("/upload-image")
async def upload_broadcast_image(
    file: UploadFile = File(...),
    _=Depends(get_current_admin),
):
    os.makedirs(BROADCAST_IMAGES_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(BROADCAST_IMAGES_DIR, filename)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return {
        "url": f"/uploads/broadcast_images/{filename}",
        # absolute path so email service can read the file regardless of working dir
        "path": os.path.abspath(filepath),
    }


@router.post("/recipients-preview")
async def recipients_preview(
    data: dict,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    group = data.get("recipient_group", "all")
    result = await db.execute(_recipients_query(group))
    rows = result.all()
    return {
        "count": len(rows),
        "sample": [{"email": r.email, "name": r.name} for r in rows[:5]],
    }


@router.post("/", response_model=BroadcastOut)
@router.post("", response_model=BroadcastOut)
async def create_broadcast(
    data: BroadcastCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(_recipients_query(data.recipient_group))
    recipients = result.all()

    broadcast = Broadcast(
        subject=data.subject,
        body=data.body,
        recipient_group=data.recipient_group,
        image_url=data.image_url,
        image_path=data.image_path,
        image_position=data.image_position or "top",
        image_size=data.image_size or "full",
        greeting=data.greeting,
        signature=data.signature,
        total_recipients=len(recipients),
        status="sending",
    )
    db.add(broadcast)
    await db.commit()
    await db.refresh(broadcast)

    for email, name in recipients:
        await mq.publish("broadcast_emails", {
            "broadcast_id": broadcast.id,
            "to_email": email,
            "to_name": name or "",
            "subject": data.subject,
            "body": data.body,
            "greeting": data.greeting or "",
            "signature": data.signature or "",
            "image_path": data.image_path or "",
            "image_position": data.image_position or "top",
            "image_size": data.image_size or "full",
            "total": len(recipients),
        })

    return broadcast


@router.delete("/{id}")
async def delete_broadcast(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(Broadcast).where(Broadcast.id == id))
    b = result.scalar_one_or_none()
    if b:
        await db.delete(b)
        await db.commit()
    return {"ok": True}
