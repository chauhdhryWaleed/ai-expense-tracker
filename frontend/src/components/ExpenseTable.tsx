import type { Expense, ExpenseCategory } from "../api/client";

interface Props {
  expenses: Expense[];
  categoryFilter: ExpenseCategory | "";
  setCategoryFilter: (value: ExpenseCategory | "") => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onEditExpense: (expense: Expense) => Promise<void>;
}

export default function ExpenseTable(props: Props) {
  const {
    expenses,
    categoryFilter,
    setCategoryFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onEditExpense,
  } = props;
  const totalVisible = expenses.reduce((sum, item) => sum + item.amount, 0);
  const currency = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="panel p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input className="input-ui" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="input-ui" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <select className="input-ui" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "")}>
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Fuel">Fuel</option>
          <option value="Other">Other</option>
        </select>
        <div className="ml-auto text-sm text-slate-300">
          Visible total: <span className="font-semibold text-indigo-300">{currency.format(totalVisible)}</span>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full table-auto border-collapse text-left text-sm">
          <thead className="bg-slate-800 text-slate-200">
            <tr className="border-b border-slate-700">
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Note</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-400" colSpan={5}>
                  No expenses found for selected filters.
                </td>
              </tr>
            ) : (
              expenses.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "border-b border-slate-800 bg-slate-900/40" : "border-b border-slate-800 bg-slate-900/70"}>
                  <td className="p-3 text-slate-200">{item.date}</td>
                  <td className="p-3 text-slate-200">{item.category}</td>
                  <td className="p-3 font-semibold text-indigo-300">{currency.format(item.amount)}</td>
                  <td className="p-3 text-slate-300">{item.note || "-"}</td>
                  <td className="p-3">
                    <button
                      className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                      type="button"
                      onClick={() => onEditExpense(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
