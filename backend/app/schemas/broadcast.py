from datetime import datetime
from pydantic import BaseModel

class BroadcastCreate(BaseModel):
    subject: str
    body: str
    recipient_group: str = "all"
    image_url: str | None = None
    image_path: str | None = None
    image_position: str | None = "top"
    image_size: str | None = "full"
    greeting: str | None = None
    signature: str | None = None

class BroadcastOut(BaseModel):
    id: int
    subject: str
    body: str
    recipient_group: str
    status: str
    total_recipients: int
    sent_count: int
    image_url: str | None = None
    image_position: str | None = None
    image_size: str | None = None
    greeting: str | None = None
    signature: str | None = None
    created_at: datetime
    model_config = {"from_attributes": True}
