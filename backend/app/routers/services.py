from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceOut, ServiceCreate, ServiceUpdate
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=list[ServiceOut])
@router.get("", response_model=list[ServiceOut])
async def get_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).order_by(Service.order))
    return result.scalars().all()


@router.post("/", response_model=ServiceOut)
@router.post("", response_model=ServiceOut)
async def create_service(
    data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    service = Service(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


@router.put("/{id}", response_model=ServiceOut)
async def update_service(
    id: int,
    data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Service).where(Service.id == id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(service, field, value)
    await db.commit()
    await db.refresh(service)
    return service


@router.delete("/{id}")
async def delete_service(
    id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Service).where(Service.id == id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    await db.delete(service)
    await db.commit()
    return {"ok": True}
