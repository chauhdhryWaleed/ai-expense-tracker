import json
import os
from datetime import date

import httpx
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.agent import tools

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqAgentService:
    def __init__(self):
        self.tools_schema = [
            {
                "type": "function",
                "function": {
                    "name": "add_expense",
                    "description": "Add a new expense record.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "amount": {"type": "number"},
                            "category": {"type": "string"},
                            "date_value": {"type": "string", "description": "Date in YYYY-MM-DD"},
                            "note": {"type": "string"},
                        },
                        "required": ["amount", "date_value"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_expenses",
                    "description": "Retrieve expenses with optional filters.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "start_date": {"type": "string"},
                            "end_date": {"type": "string"},
                            "category": {"type": "string"},
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_summary",
                    "description": "Get monthly spending summary.",
                    "parameters": {
                        "type": "object",
                        "properties": {"month": {"type": "string"}},
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "set_budget",
                    "description": "Set monthly budget value.",
                    "parameters": {
                        "type": "object",
                        "properties": {"month": {"type": "string"}, "amount": {"type": "number"}},
                        "required": ["month", "amount"],
                    },
                },
            },
        ]

    async def _call_groq(self, messages: list[dict], tool_choice: str = "auto"):
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured.")

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": messages,
            "tools": self.tools_schema,
            "tool_choice": tool_choice,
            "temperature": 0.1,
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(GROQ_URL, headers=headers, json=payload)
            if not response.is_success:
                raise ValueError(f"Groq API error {response.status_code}: {response.text}")
            return response.json()

    async def chat(self, db: Session, user_message: str) -> str:
        today = date.today().isoformat()
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expense assistant. Use tools whenever the user asks to add, list, "
                    "summarize expenses, or set budget. If date is omitted while adding expense, use "
                    f"today's date ({today}). If category is missing, pick the closest among Food, Fuel, Other."
                ),
            },
            {"role": "user", "content": user_message},
        ]

        first_response = await self._call_groq(messages)
        message = first_response["choices"][0]["message"]
        tool_calls = message.get("tool_calls", [])

        if not tool_calls:
            return message.get("content") or "I could not process your request."

        messages.append(message)

        # Tool-calling loop: execute each requested tool and append its raw result
        # back to the conversation so the model can draft a human-readable reply.
        for call in tool_calls:
            fn_name = call["function"]["name"]
            args = json.loads(call["function"]["arguments"] or "{}")

            if fn_name == "add_expense":
                args.setdefault("category", None)
                args.setdefault("date_value", today)
                args.setdefault("note", None)
                tool_result = tools.add_expense(db=db, **args)
            elif fn_name == "get_expenses":
                tool_result = tools.get_expenses(db=db, **args)
            elif fn_name == "get_summary":
                tool_result = tools.get_summary(db=db, **args)
            elif fn_name == "set_budget":
                tool_result = tools.set_budget(db=db, **args)
            else:
                tool_result = {"error": f"Unknown tool: {fn_name}"}

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call["id"],
                    "name": fn_name,
                    "content": json.dumps(tool_result),
                }
            )

        final_response = await self._call_groq(messages, tool_choice="none")
        return final_response["choices"][0]["message"].get("content") or "Done."
