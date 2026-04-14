from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.expense import ExpenseCategory
from app.schemas.expense import ExpenseCreate, ExpenseRead
from app.services.finance_service import add_expense, list_expenses

router = APIRouter(tags=["expenses"])


@router.post("/expense", response_model=ExpenseRead)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    return add_expense(db, payload)


@router.get("/expenses", response_model=list[ExpenseRead])
def get_expenses(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: ExpenseCategory | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_expenses(db, start_date=start_date, end_date=end_date, category=category)
