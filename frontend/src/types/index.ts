export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  initial_balance: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

export type TransactionType = "CREDIT" | "DEBIT";

export interface Transaction {
  id: number;
  profile_id: number;
  category_id: number | null;
  type: TransactionType;
  amount: number;
  title: string;
  notes: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface Transfer {
  id: number;
  source_profile_id: number;
  destination_profile_id: number;
  amount: number;
  created_at: string;
}

export interface Dashboard {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  expenseTrend: { date: string; amount: number }[];
  incomeTrend: { date: string; amount: number }[];
  categoryBreakdown: { category: string; color: string; amount: number }[];
  topCategories: { category: string; color: string; amount: number }[];
  recentTransactions: Transaction[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
