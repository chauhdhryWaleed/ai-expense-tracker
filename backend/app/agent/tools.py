from datetime import date, datetime

from sqlalchemy.orm import Session

from app.models.expense import ExpenseCategory
from app.schemas.budget import BudgetCreate
from app.schemas.expense import ExpenseCreate
from app.services.finance_service import (
    add_expense as add_expense_service,
    get_summary as get_summary_service,
    list_expenses as list_expenses_service,
    set_budget as set_budget_service,
)


def _parse_category(category: str | None) -> ExpenseCategory | None:
    if not category:
        return None
    normalized = category.strip().lower()
    if normalized in {"food"}:
        return ExpenseCategory.FOOD
    if normalized in {"fuel", "petrol", "gas"}:
        return ExpenseCategory.FUEL
    if normalized in {"other"}:
        return ExpenseCategory.OTHER
    return None


def add_expense(
    db: Session,
    amount: float,
    category: str | None = None,
    date_value: str | None = None,
    note: str | None = None,
):
    if not date_value:
        date_value = date.today().isoformat()
    payload = ExpenseCreate(
        amount=amount,
        category=_parse_category(category),
        date=date.fromisoformat(date_value),
        note=note,
    )
    expense = add_expense_service(db, payload)
    return {
        "id": expense.id,
        "amount": expense.amount,
        "category": expense.category.value,
        "date": expense.date.isoformat(),
        "note": expense.note,
    }


def get_expenses(
    db: Session,
    start_date: str | None = None,
    end_date: str | None = None,
    category: str | None = None,
):
    expenses = list_expenses_service(
        db,
        start_date=date.fromisoformat(start_date) if start_date else None,
        end_date=date.fromisoformat(end_date) if end_date else None,
        category=_parse_category(category),
    )
    return [
        {
            "id": item.id,
            "amount": item.amount,
            "category": item.category.value,
            "date": item.date.isoformat(),
            "note": item.note,
        }
        for item in expenses
    ]


def get_summary(db: Session, month: str | None = None):
    month_key = month or datetime.now().strftime("%Y-%m")
    return get_summary_service(db, month_key)


def set_budget(db: Session, month: str, amount: float):
    budget = set_budget_service(db, BudgetCreate(month=month, amount=amount))
    return {"month": budget.month, "amount": budget.amount}
