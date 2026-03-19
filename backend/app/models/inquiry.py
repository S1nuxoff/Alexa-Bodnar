from datetime import datetime
from sqlalchemy import String, Text, Boolean, Integer, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    partner_name: Mapped[str] = mapped_column(String(200), default="")
    email: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(50), default="")
    session_date: Mapped[str] = mapped_column(String(50), default="")
    venue: Mapped[str] = mapped_column(Text, default="")
    budget: Mapped[str] = mapped_column(String(200), default="")
    service: Mapped[str] = mapped_column(String(300), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    how_found: Mapped[str] = mapped_column(String(500), default="")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="new", server_default=text("'new'"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
