import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { Expense } from "../api/client";

interface Props {
  expenses: Expense[];
  month: string;
  summary: {
    month: string;
    total_spent: number;
    budget: number | null;
    remaining_budget: number | null;
    breakdown: Record<string, number>;
  } | null;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#06b6d4"];

export default function SummaryDashboard({ summary, expenses, month }: Props) {
  if (!summary) return null;
  const [isMounted, setIsMounted] = useState(false);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const currency = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pieData = Object.entries(summary.breakdown).map(([name, value]) => ({ name, value }));
  const hasData = pieData.length > 0;
  const dailyData = Object.values(
    safeExpenses
      .filter((item) => item.date.startsWith(month))
      .reduce<Record<string, { date: string; total: number }>>((acc, item) => {
        const key = item.date;
        if (!acc[key]) acc[key] = { date: key, total: 0 };
        acc[key].total += item.amount;
        return acc;
      }, {}),
  ).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="panel grid gap-3 p-5 md:grid-cols-4">
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <p className="text-xs text-slate-400">Month</p>
        <p className="text-xl font-semibold text-slate-100">{summary.month}</p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <p className="text-xs text-slate-400">Total Spent</p>
        <p className="text-xl font-semibold text-indigo-300">{currency.format(summary.total_spent)}</p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <p className="text-xs text-slate-400">Budget</p>
        <p className="text-xl font-semibold text-emerald-300">{summary.budget !== null ? currency.format(summary.budget) : "Not set"}</p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <p className="text-xs text-slate-400">Remaining</p>
        <p className="text-xl font-semibold text-cyan-300">{summary.remaining_budget !== null ? currency.format(summary.remaining_budget) : "N/A"}</p>
      </div>
      <div className="h-56 min-h-[220px] min-w-0 rounded-xl border border-slate-700 bg-slate-900/50 p-2 md:col-span-2">
        {isMounted && hasData ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No spending data yet for this month.
          </div>
        )}
      </div>
      <div className="h-56 min-h-[220px] min-w-0 rounded-xl border border-slate-700 bg-slate-900/50 p-2 md:col-span-2">
        {isMounted && hasData ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Category comparison will appear after expenses are added.
          </div>
        )}
      </div>
      <div className="h-64 min-h-[220px] min-w-0 rounded-xl border border-slate-700 bg-slate-900/50 p-2 md:col-span-4">
        {isMounted && dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3 }} name="Daily Spend" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Daily trend will appear when month data is available.
          </div>
        )}
      </div>
    </div>
  );
}
