from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agent.service import GroqAgentService
from app.db.session import get_db
from app.schemas.agent import AgentChatRequest, AgentChatResponse

router = APIRouter(tags=["agent"])
agent_service = GroqAgentService()


@router.post("/agent/chat", response_model=AgentChatResponse)
async def agent_chat(payload: AgentChatRequest, db: Session = Depends(get_db)):
    try:
        response = await agent_service.chat(db, payload.message)
        return {"response": response}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
