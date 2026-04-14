from pydantic import BaseModel


class SummaryRead(BaseModel):
    month: str
    total_spent: float
    budget: float | None
    remaining_budget: float | None
    breakdown: dict[str, float]
