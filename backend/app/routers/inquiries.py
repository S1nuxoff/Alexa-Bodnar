from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.inquiry import Inquiry
from app.schemas.inquiry import InquiryCreate, InquiryOut, InquiryUpdate
from app.routers.auth import get_current_admin
from app import mq

router = APIRouter(prefix="/inquiries", tags=["inquiries"])


@router.post("/", response_model=InquiryOut)
@router.post("", response_model=InquiryOut)
async def create_inquiry(data: InquiryCreate, db: AsyncSession = Depends(get_db)):
    inquiry = Inquiry(**data.model_dump())
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    payload = {
        "id": inquiry.id,
        "name": inquiry.name,
        "partner_name": inquiry.partner_name,
        "email": inquiry.email,
        "phone": inquiry.phone,
        "service": inquiry.service,
        "session_date": inquiry.session_date,
        "venue": inquiry.venue,
        "budget": inquiry.budget,
        "message": inquiry.message,
        "how_found": inquiry.how_found,
    }
    await mq.publish("inquiry_tg", payload)
    await mq.publish("inquiry_email", payload)
    return inquiry


@router.get("/", response_model=list[InquiryOut])
@router.get("", response_model=list[InquiryOut])
async def get_inquiries(db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(Inquiry).order_by(Inquiry.created_at.desc()))
    return result.scalars().all()


@router.get("/unread-count")
async def get_unread_count(db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(func.count()).where(Inquiry.is_read == False))
    return {"count": result.scalar()}


@router.put("/{id}", response_model=InquiryOut)
async def update_inquiry(id: int, data: InquiryUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(Inquiry).where(Inquiry.id == id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Not found")

    prev_status = inquiry.status
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(inquiry, field, value)
    await db.commit()
    await db.refresh(inquiry)

    # Send email notification on status transitions
    if data.status and data.status != prev_status and data.status in ("accepted", "rejected", "completed"):
        await mq.publish("inquiry_status_email", {
            "status": data.status,
            "name": inquiry.name,
            "email": inquiry.email,
        })

    return inquiry


@router.delete("/{id}")
async def delete_inquiry(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(Inquiry).where(Inquiry.id == id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(inquiry)
    await db.commit()
    return {"ok": True}
