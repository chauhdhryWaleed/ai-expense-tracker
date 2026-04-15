import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401
from app.db.session import Base, engine
from app.routes.agent import router as agent_router
from app.routes.budget import router as budget_router
from app.routes.expense import router as expense_router
from app.routes.summary import router as summary_router

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(title="AI Expense Tracker API", version="1.0.0")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(expense_router)
app.include_router(budget_router)
app.include_router(summary_router)
app.include_router(agent_router)


@app.get("/health")
def health():
    return {"status": "ok"}
