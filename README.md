# AI Expense Tracker MVP

Full-stack intelligent expense tracker built with FastAPI, SQLite, React, Tailwind, and Groq tool-calling.

## Project Structure

- `backend/` - FastAPI API, SQLAlchemy models, services, and Groq agent tools
- `frontend/` - React + Tailwind UI with dashboard, table, and chat interface

## Prerequisites

- Python 3.11+
- Node.js 20+
- Groq API key

## Backend Setup

1. Go to backend:
   - `cd backend`
2. Create and activate virtual environment:
   - `python -m venv .venv`
   - PowerShell: `.\.venv\Scripts\Activate.ps1`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Configure environment:
   - Copy `.env.example` to `.env`
   - Set `GROQ_API_KEY`
   - Optional: change `GROQ_MODEL`, `DATABASE_URL`, `FRONTEND_ORIGIN`
5. Start API:
   - `uvicorn app.main:app --reload --port 8000`

## Frontend Setup

1. Go to frontend:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Configure environment:
   - Copy `.env.example` to `.env`
   - Set `VITE_API_BASE_URL` (default `http://localhost:8000`)
4. Start app:
   - `npm run dev`

## API Endpoints

- `POST /expense` - add expense
- `GET /expenses` - list expenses (filters: `start_date`, `end_date`, `category`)
- `GET /summary` - monthly summary (`month=YYYY-MM`)
- `POST /budget` - set/update monthly budget
- `POST /agent/chat` - chat with tool-calling AI assistant
- `GET /health` - health check

## Example Agent Prompts

- `I spent 500 on petrol today`
- `Show my expenses this week`
- `How much did I spend on food this month?`
- `Set my April budget to 5000`

## Agent Tool-Calling Notes

- The agent route calls `GroqAgentService`, which sends the user message plus tool schemas to Groq.
- If Groq requests function calls, backend executes mapped Python tools (`add_expense`, `get_expenses`, `get_summary`, `set_budget`).
- Tool outputs are fed back to the model so it generates a final human-readable response.
- If category is missing while adding expense, the system allows model-driven category selection with fallback to `Other`.

## Quick Verification Checklist

- [ ] Add budget for current month
- [ ] Add at least two expenses from form
- [ ] Confirm table filtering by date/category
- [ ] Confirm summary total/breakdown updates
- [ ] Ask chat queries and verify DB-backed responses
