export type ExpenseCategory = "Food" | "Fuel" | "Other";

export interface Expense {
  id: number;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function addExpense(payload: {
  amount: number;
  category?: ExpenseCategory;
  date: string;
  note?: string;
}) {
  return request<Expense>("/expense", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateExpense(
  expenseId: number,
  payload: { amount: number; category: ExpenseCategory; date: string; note?: string },
) {
  return request<Expense>(`/expense/${expenseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getExpenses(filters?: {
  start_date?: string;
  end_date?: string;
  category?: ExpenseCategory;
}) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set("start_date", filters.start_date);
  if (filters?.end_date) params.set("end_date", filters.end_date);
  if (filters?.category) params.set("category", filters.category);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<Expense[]>(`/expenses${suffix}`);
}

export async function setBudget(payload: { month: string; amount: number }) {
  return request<{ month: string; amount: number }>("/budget", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function clearBudget(month: string) {
  return request<{ month: string; deleted: boolean }>(`/budget/${month}`, {
    method: "DELETE",
  });
}

export async function clearSpent(month: string) {
  return request<{ month: string; deleted_count: number }>(`/expenses?month=${month}`, {
    method: "DELETE",
  });
}

export async function getSummary(month?: string) {
  const suffix = month ? `?month=${month}` : "";
  return request<{
    month: string;
    total_spent: number;
    budget: number | null;
    remaining_budget: number | null;
    breakdown: Record<string, number>;
  }>(`/summary${suffix}`);
}

export async function chatWithAgent(message: string) {
  return request<{ response: string }>("/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
