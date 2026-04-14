import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface Props {
  summary: {
    month: string;
    total_spent: number;
    budget: number | null;
    remaining_budget: number | null;
    breakdown: Record<string, number>;
  } | null;
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

export default function SummaryDashboard({ summary }: Props) {
  if (!summary) return null;

  const pieData = Object.entries(summary.breakdown).map(([name, value]) => ({ name, value }));
  const hasData = pieData.length > 0;

  return (
    <div className="grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-4">
      <div className="rounded border p-3">
        <p className="text-xs text-slate-500">Month</p>
        <p className="text-xl font-semibold">{summary.month}</p>
      </div>
      <div className="rounded border p-3">
        <p className="text-xs text-slate-500">Total Spent</p>
        <p className="text-xl font-semibold">{summary.total_spent.toFixed(2)}</p>
      </div>
      <div className="rounded border p-3">
        <p className="text-xs text-slate-500">Budget</p>
        <p className="text-xl font-semibold">{summary.budget?.toFixed(2) ?? "Not set"}</p>
      </div>
      <div className="rounded border p-3">
        <p className="text-xs text-slate-500">Remaining</p>
        <p className="text-xl font-semibold">{summary.remaining_budget?.toFixed(2) ?? "N/A"}</p>
      </div>
      <div className="md:col-span-4 h-56 min-h-[220px] min-w-0">
        {hasData ? (
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
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No spending data yet for this month.
          </div>
        )}
      </div>
    </div>
  );
}
