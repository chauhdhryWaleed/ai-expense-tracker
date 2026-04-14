from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.expense import ExpenseCategory


class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: ExpenseCategory | None = None
    date: date
    note: str | None = Field(default=None, max_length=255)


class ExpenseRead(BaseModel):
    id: int
    amount: float
    category: ExpenseCategory
    date: date
    note: str | None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class ExpenseUpdate(BaseModel):
    amount: float = Field(..., gt=0)
    category: ExpenseCategory
    date: date
    note: str | None = Field(default=None, max_length=255)
