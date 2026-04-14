from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.summary import SummaryRead
from app.services.finance_service import get_summary

router = APIRouter(tags=["summary"])


@router.get("/summary", response_model=SummaryRead)
def summary(month: str | None = Query(default=None), db: Session = Depends(get_db)):
    selected_month = month or datetime.now().strftime("%Y-%m")
    return get_summary(db, selected_month)
