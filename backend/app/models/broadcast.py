from datetime import datetime
from sqlalchemy import String, Text, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Broadcast(Base):
    __tablename__ = "broadcasts"
    id: Mapped[int] = mapped_column(primary_key=True)
    subject: Mapped[str] = mapped_column(String(300))
    body: Mapped[str] = mapped_column(Text)  # plain text written by admin
    recipient_group: Mapped[str] = mapped_column(String(50), default="all")  # "all" for now
    status: Mapped[str] = mapped_column(String(20), default="sending")  # sending | done
    total_recipients: Mapped[int] = mapped_column(Integer, default=0)
    sent_count: Mapped[int] = mapped_column(Integer, default=0)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    image_path: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    image_position: Mapped[str | None] = mapped_column(String(20), nullable=True, default="top")
    image_size: Mapped[str | None] = mapped_column(String(10), nullable=True, default="full")
    greeting: Mapped[str | None] = mapped_column(String(300), nullable=True, default=None)
    signature: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
