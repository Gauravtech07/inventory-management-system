from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey,String
from sqlalchemy.sql import func

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"),nullable=False)
    total_amount = Column(Numeric(10, 2),nullable=False)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True),server_default=func.now())