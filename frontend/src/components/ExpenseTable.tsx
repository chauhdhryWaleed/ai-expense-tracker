import type { Expense, ExpenseCategory } from "../api/client";

interface Props {
  expenses: Expense[];
  categoryFilter: ExpenseCategory | "";
  setCategoryFilter: (value: ExpenseCategory | "") => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export default function ExpenseTable(props: Props) {
  const { expenses, categoryFilter, setCategoryFilter, startDate, setStartDate, endDate, setEndDate } = props;

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="rounded border p-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="rounded border p-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <select className="rounded border p-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "")}>
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Fuel">Fuel</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <table className="w-full table-auto border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Date</th>
            <th className="p-2">Category</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.date}</td>
              <td className="p-2">{item.category}</td>
              <td className="p-2">{item.amount.toFixed(2)}</td>
              <td className="p-2">{item.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
