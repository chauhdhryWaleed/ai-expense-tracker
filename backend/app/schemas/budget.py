from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$")
    amount: float = Field(..., gt=0)


class BudgetRead(BaseModel):
    month: str
    amount: float
