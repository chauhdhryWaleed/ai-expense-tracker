from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.budget import BudgetCreate, BudgetRead
from app.services.finance_service import clear_budget, set_budget

router = APIRouter(tags=["budget"])


@router.post("/budget", response_model=BudgetRead)
def create_budget(payload: BudgetCreate, db: Session = Depends(get_db)):
    budget = set_budget(db, payload)
    return {"month": budget.month, "amount": budget.amount}


@router.delete("/budget/{month}")
def delete_budget(month: str, db: Session = Depends(get_db)):
    deleted = clear_budget(db, month)
    return {"month": month, "deleted": deleted}
