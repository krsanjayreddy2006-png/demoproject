from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime, timezone
from app.database import Base

class AIHistory(Base):
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query_type = Column(String(100), default="AI Analysis")
    response = Column(Text)
    strategy = Column(Text)  # kept for backwards compatibility
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
