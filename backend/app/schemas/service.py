from datetime import datetime
from pydantic import BaseModel


class ServiceOut(BaseModel):
    id: int
    title: str
    description: str
    price: float
    currency: str
    is_active: bool
    order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ServiceCreate(BaseModel):
    title: str
    description: str = ""
    price: float
    currency: str = "USD"
    is_active: bool = True
    order: int = 0


class ServiceUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    currency: str | None = None
    is_active: bool | None = None
    order: int | None = None
