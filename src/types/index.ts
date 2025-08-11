export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'investment';
  amount: number;
  category: string;
  subCategory?: string;
  date: string;
  paid?: boolean; // Only for expenses
  observation?: string;
  bankAccount?: string; // For investments - references BankAccount.id
}

export interface SubCategory {
  id: string;
  name: string;
  parentId: string; // References Category.id
  type: 'income' | 'expense';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment';
  userId: string;
  createdAt: string;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  totalUnpaidExpenses: number;
  totalInvestments: number;
  balance: number;
  incomeByCategory: { [category: string]: number };
  expensesByCategory: { [category: string]: number };
  investmentsByBank: { [bankName: string]: number };
}