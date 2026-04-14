from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    month: Mapped[str] = mapped_column(String(7), unique=True, nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
