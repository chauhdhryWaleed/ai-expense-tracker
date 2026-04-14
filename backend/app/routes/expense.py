from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.expense import ExpenseCategory
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseUpdate
from app.services.finance_service import add_expense, clear_spent, list_expenses, update_expense

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


@router.put("/expense/{expense_id}", response_model=ExpenseRead)
def edit_expense(expense_id: int, payload: ExpenseUpdate, db: Session = Depends(get_db)):
    updated = update_expense(db, expense_id, ExpenseCreate(**payload.model_dump()))
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated


@router.delete("/expenses")
def clear_total_spent(month: str | None = Query(default=None), db: Session = Depends(get_db)):
    target_month = month or datetime.now().strftime("%Y-%m")
    deleted_count = clear_spent(db, target_month)
    return {"month": target_month, "deleted_count": deleted_count}
