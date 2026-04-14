import enum

from sqlalchemy import Date, DateTime, Enum, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ExpenseCategory(str, enum.Enum):
    FOOD = "Food"
    FUEL = "Fuel"
    OTHER = "Other"


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[ExpenseCategory] = mapped_column(
        Enum(ExpenseCategory, name="expense_category"),
        nullable=False,
    )
    date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
