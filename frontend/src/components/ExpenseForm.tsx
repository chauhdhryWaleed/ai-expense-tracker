import { useState } from "react";

import type { ExpenseCategory } from "../api/client";

interface Props {
  onSubmit: (payload: { amount: number; category?: ExpenseCategory; date: string; note?: string }) => Promise<void>;
}

export default function ExpenseForm({ onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          amount: Number(amount),
          category: category || undefined,
          date,
          note: note || undefined,
        });
        setAmount("");
        setCategory("");
        setNote("");
      }}
    >
      <h2 className="text-lg font-semibold">Add Expense</h2>
      <div className="grid gap-2 md:grid-cols-4">
        <input className="rounded border p-2" type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <select className="rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory | "")}>
          <option value="">Auto/Select Category</option>
          <option value="Food">Food</option>
          <option value="Fuel">Fuel</option>
          <option value="Other">Other</option>
        </select>
        <input className="rounded border p-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input className="rounded border p-2" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button className="w-fit rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" type="submit">Save Expense</button>
    </form>
  );
}
