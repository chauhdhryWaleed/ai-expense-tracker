import { useEffect, useMemo, useState } from "react";

import {
  addExpense,
  chatWithAgent,
  clearBudget,
  clearSpent,
  getExpenses,
  getSummary,
  setBudget,
  updateExpense,
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
  const pkr = useMemo(
    () =>
      new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
      }),
    [],
  );

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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4 md:p-6">
      <header className="panel p-5">
        <h1 className="text-2xl font-bold text-white md:text-3xl">AI Expense Tracker</h1>
        <p className="mt-1 text-sm text-slate-300">
          Smart spending insights with interactive analytics and AI assistant.
        </p>
      </header>

      <ExpenseForm
        onSubmit={async (payload) => {
          await addExpense(payload);
          await refreshData();
        }}
      />

      <form
        className="panel flex flex-wrap items-end gap-2 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await setBudget({ month: budgetMonth, amount: Number(budgetAmount) });
          setBudgetAmount("");
          await refreshData();
        }}
      >
        <h2 className="w-full text-lg font-semibold text-slate-100">Set Monthly Budget</h2>
        <input className="input-ui" type="month" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)} required />
        <input className="input-ui" type="number" step="0.01" placeholder="Budget amount" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} required />
        <button className="btn-secondary" type="submit">Save Budget</button>
        <button
          className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white transition hover:bg-rose-500"
          type="button"
          onClick={async () => {
            const firstConfirm = window.confirm(
              `Clear budget for ${budgetMonth}? This action cannot be undone.`,
            );
            if (!firstConfirm) return;
            const secondConfirm = window.confirm(
              "Please confirm again: permanently remove this month's budget?",
            );
            if (!secondConfirm) return;
            await clearBudget(budgetMonth);
            await refreshData();
          }}
        >
          Clear Budget
        </button>
        <button
          className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-500"
          type="button"
          onClick={async () => {
            const firstConfirm = window.confirm(
              `Clear all spent entries for ${currentMonth}? This deletes expenses and resets total spent.`,
            );
            if (!firstConfirm) return;
            const secondConfirm = window.confirm(
              "Please confirm again: permanently delete all expenses for this month?",
            );
            if (!secondConfirm) return;
            await clearSpent(currentMonth);
            await refreshData();
          }}
        >
          Clear Total Spent
        </button>
        {summary && summary.budget !== null && (
          <p className="w-full text-sm text-slate-300">
            Current budget for {summary.month}:{" "}
            <span className="font-semibold text-emerald-300">{pkr.format(summary.budget || 0)}</span>
          </p>
        )}
      </form>

      <SummaryDashboard summary={summary} expenses={expenses} month={currentMonth} />
      <ExpenseTable
        expenses={expenses}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onEditExpense={async (expense) => {
          const amountRaw = window.prompt("Edit amount (PKR):", String(expense.amount));
          if (amountRaw === null) return;
          const categoryRaw = window.prompt(
            "Edit category (Food/Fuel/Other):",
            expense.category,
          );
          if (categoryRaw === null) return;
          const dateRaw = window.prompt("Edit date (YYYY-MM-DD):", expense.date);
          if (dateRaw === null) return;
          const noteRaw = window.prompt("Edit note (optional):", expense.note || "");
          const parsedAmount = Number(amountRaw);
          const normalizedCategory = categoryRaw.trim();
          if (!parsedAmount || !["Food", "Fuel", "Other"].includes(normalizedCategory)) {
            window.alert("Invalid input. Please provide valid amount and category.");
            return;
          }
          await updateExpense(expense.id, {
            amount: parsedAmount,
            category: normalizedCategory as ExpenseCategory,
            date: dateRaw,
            note: noteRaw || undefined,
          });
          await refreshData();
        }}
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
