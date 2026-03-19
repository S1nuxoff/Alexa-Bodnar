from datetime import datetime
from pydantic import BaseModel


class GalleryPhotoOut(BaseModel):
    id: int
    filename: str
    url: str
    thumb_url: str | None = None
    category: str
    order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class GalleryPhotoUpdate(BaseModel):
    category: str | None = None
    order: int | None = None
    is_active: bool | None = None
