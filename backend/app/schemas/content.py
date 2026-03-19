from datetime import datetime
from pydantic import BaseModel


class ContentOut(BaseModel):
    id: int
    key: str
    value: str
    section: str
    label: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContentUpdate(BaseModel):
    value: str


class ContentCreate(BaseModel):
    key: str
    value: str
    section: str
    label: str
