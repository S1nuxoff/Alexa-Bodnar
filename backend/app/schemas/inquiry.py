from datetime import datetime
from pydantic import BaseModel, EmailStr


class InquiryCreate(BaseModel):
    name: str
    partner_name: str = ""
    email: str
    phone: str = ""
    session_date: str = ""
    venue: str = ""
    budget: str = ""
    service: str = ""
    message: str = ""
    how_found: str = ""


class InquiryOut(BaseModel):
    id: int
    name: str
    partner_name: str
    email: str
    phone: str
    session_date: str
    venue: str
    budget: str
    service: str
    message: str
    how_found: str
    is_read: bool
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InquiryUpdate(BaseModel):
    is_read: bool | None = None
    status: str | None = None
