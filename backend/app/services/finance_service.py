from datetime import date, datetime

from sqlalchemy import and_, extract, func, select
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.expense import Expense, ExpenseCategory
from app.schemas.budget import BudgetCreate
from app.schemas.expense import ExpenseCreate


def add_expense(db: Session, payload: ExpenseCreate) -> Expense:
    expense = Expense(
        amount=payload.amount,
        category=payload.category or ExpenseCategory.OTHER,
        date=payload.date,
        note=payload.note,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def list_expenses(
    db: Session,
    start_date: date | None = None,
    end_date: date | None = None,
    category: ExpenseCategory | None = None,
) -> list[Expense]:
    query = select(Expense).order_by(Expense.date.desc(), Expense.id.desc())
    filters = []

    if start_date:
        filters.append(Expense.date >= start_date)
    if end_date:
        filters.append(Expense.date <= end_date)
    if category:
        filters.append(Expense.category == category)

    if filters:
        query = query.where(and_(*filters))

    return list(db.scalars(query).all())


def update_expense(db: Session, expense_id: int, payload: ExpenseCreate) -> Expense | None:
    expense = db.get(Expense, expense_id)
    if not expense:
        return None
    expense.amount = payload.amount
    expense.category = payload.category or ExpenseCategory.OTHER
    expense.date = payload.date
    expense.note = payload.note
    db.commit()
    db.refresh(expense)
    return expense


def clear_spent(db: Session, month: str | None = None) -> int:
    target_month = month or datetime.now().strftime("%Y-%m")
    year, month_num = target_month.split("-")
    rows = list(
        db.scalars(
            select(Expense).where(
                and_(
                    extract("year", Expense.date) == int(year),
                    extract("month", Expense.date) == int(month_num),
                )
            )
        ).all()
    )
    deleted_count = len(rows)
    for row in rows:
        db.delete(row)
    db.commit()
    return deleted_count


def set_budget(db: Session, payload: BudgetCreate) -> Budget:
    existing = db.scalar(select(Budget).where(Budget.month == payload.month))
    if existing:
        existing.amount = payload.amount
        db.commit()
        db.refresh(existing)
        return existing

    budget = Budget(month=payload.month, amount=payload.amount)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def clear_budget(db: Session, month: str) -> bool:
    budget = db.scalar(select(Budget).where(Budget.month == month))
    if not budget:
        return False
    db.delete(budget)
    db.commit()
    return True


def get_budget_by_month(db: Session, month: str) -> Budget | None:
    return db.scalar(select(Budget).where(Budget.month == month))


def get_summary(db: Session, month: str) -> dict:
    year, month_num = month.split("-")

    total_spent = (
        db.scalar(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                and_(
                    extract("year", Expense.date) == int(year),
                    extract("month", Expense.date) == int(month_num),
                )
            )
        )
        or 0
    )

    rows = db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(
            and_(
                extract("year", Expense.date) == int(year),
                extract("month", Expense.date) == int(month_num),
            )
        )
        .group_by(Expense.category)
    ).all()
    breakdown = {str(cat.value): float(amount or 0) for cat, amount in rows}

    budget = db.scalar(select(Budget).where(Budget.month == month))
    budget_amount = float(budget.amount) if budget else None
    remaining_budget = (budget_amount - float(total_spent)) if budget_amount is not None else None

    return {
        "month": month,
        "total_spent": float(total_spent),
        "budget": budget_amount,
        "remaining_budget": remaining_budget,
        "breakdown": breakdown,
    }
