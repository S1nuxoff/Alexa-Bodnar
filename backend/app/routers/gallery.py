import io
import os
import uuid
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.gallery import GalleryPhoto
from app.schemas.gallery import GalleryPhotoOut, GalleryPhotoUpdate
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/gallery", tags=["gallery"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=list[GalleryPhotoOut])
@router.get("", response_model=list[GalleryPhotoOut])
async def get_gallery(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GalleryPhoto).order_by(GalleryPhoto.category, GalleryPhoto.order)
    )
    return result.scalars().all()


@router.post("/upload", response_model=GalleryPhotoOut)
async def upload_photo(
    file: UploadFile = File(...),
    category: str = "general",
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only jpg, png, webp allowed")

    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    # Generate thumbnail (max 400x400)
    thumb_url = None
    try:
        img = Image.open(io.BytesIO(content))
        img.thumbnail((400, 400), Image.LANCZOS)
        thumb_filename = f"thumb_{filename.rsplit('.', 1)[0]}.webp"
        thumb_filepath = os.path.join(UPLOAD_DIR, thumb_filename)
        img.save(thumb_filepath, "WEBP", quality=75)
        thumb_url = f"/uploads/{thumb_filename}"
    except Exception:
        pass

    photo = GalleryPhoto(filename=filename, url=f"/uploads/{filename}", thumb_url=thumb_url, category=category)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return photo


@router.put("/{id}", response_model=GalleryPhotoOut)
async def update_photo(
    id: int,
    data: GalleryPhotoUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(GalleryPhoto).where(GalleryPhoto.id == id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(photo, field, value)
    await db.commit()
    await db.refresh(photo)
    return photo


@router.delete("/{id}")
async def delete_photo(
    id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(GalleryPhoto).where(GalleryPhoto.id == id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    filepath = os.path.join(UPLOAD_DIR, photo.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    if photo.thumb_url:
        thumb_path = os.path.join(UPLOAD_DIR, os.path.basename(photo.thumb_url))
        if os.path.exists(thumb_path):
            os.remove(thumb_path)
    await db.delete(photo)
    await db.commit()
    return {"ok": True}
