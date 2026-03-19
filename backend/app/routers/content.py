from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.content import Content
from app.schemas.content import ContentOut, ContentUpdate, ContentCreate
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/", response_model=list[ContentOut])
@router.get("", response_model=list[ContentOut])
async def get_all_content(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Content).order_by(Content.section, Content.key))
    return result.scalars().all()


@router.get("/{key}", response_model=ContentOut)
async def get_content(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Content).where(Content.key == key))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    return item


@router.post("/", response_model=ContentOut)
@router.post("", response_model=ContentOut)
async def create_content(
    data: ContentCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Content).where(Content.key == data.key))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Key already exists")
    item = Content(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{key}")
async def delete_content(
    key: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Content).where(Content.key == key))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    await db.delete(item)
    await db.commit()
    return {"ok": True}


@router.put("/{key}", response_model=ContentOut)
async def update_content(
    key: str,
    data: ContentUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Content).where(Content.key == key))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    item.value = data.value
    await db.commit()
    await db.refresh(item)
    return item
