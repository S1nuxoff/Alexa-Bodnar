from pydantic import BaseModel


class EmailTemplateOut(BaseModel):
    id: int
    status_key: str
    label: str
    subject: str
    body: str

    model_config = {"from_attributes": True}


class EmailTemplateUpdate(BaseModel):
    subject: str
    body: str
