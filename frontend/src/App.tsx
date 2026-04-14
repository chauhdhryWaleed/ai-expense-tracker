import { useEffect, useMemo, useState } from "react";

import {
  addExpense,
  chatWithAgent,
  getExpenses,
  getSummary,
  setBudget,
  type Expense,
  type ExpenseCategory,
} from "./api/client";
import AgentChat from "./components/AgentChat";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import SummaryDashboard from "./components/SummaryDashboard";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getSummary>> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budgetAmount, setBudgetAmount] = useState("");

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  async function refreshData() {
    const [expenseRows, summaryRows] = await Promise.all([
      getExpenses({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category: categoryFilter || undefined,
      }),
      getSummary(currentMonth),
    ]);
    setExpenses(expenseRows);
    setSummary(summaryRows);
  }

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, startDate, endDate]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">AI Expense Tracker</h1>

      <ExpenseForm
        onSubmit={async (payload) => {
          await addExpense(payload);
          await refreshData();
        }}
      />

      <form
        className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-4 shadow"
        onSubmit={async (e) => {
          e.preventDefault();
          await setBudget({ month: budgetMonth, amount: Number(budgetAmount) });
          setBudgetAmount("");
          await refreshData();
        }}
      >
        <h2 className="w-full text-lg font-semibold">Set Monthly Budget</h2>
        <input className="rounded border p-2" type="month" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)} required />
        <input className="rounded border p-2" type="number" step="0.01" placeholder="Budget amount" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} required />
        <button className="rounded bg-emerald-600 px-3 py-2 text-white" type="submit">Save Budget</button>
      </form>

      <SummaryDashboard summary={summary} />
      <ExpenseTable
        expenses={expenses}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      <AgentChat
        onSend={async (message) => {
          const result = await chatWithAgent(message);
          await refreshData();
          return result.response;
        }}
      />
    </main>
  );
}
