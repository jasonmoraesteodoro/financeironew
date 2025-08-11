import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Transaction, Category, SubCategory, MonthlyReport, BankAccount } from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  subcategories: SubCategory[];
  bankAccounts: BankAccount[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubCategory: (subCategory: Omit<SubCategory, 'id'>) => Promise<void>;
  updateSubCategory: (id: string, subCategory: Partial<SubCategory>) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
  addBankAccount: (bankAccount: Omit<BankAccount, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateBankAccount: (id: string, bankAccount: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  getReport: (yearFilter: string | number, monthFilter: string | number) => MonthlyReport;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear data when user logs out
      setTransactions([]);
      setCategories([]);
      setSubcategories([]);
      setBankAccounts([]);
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Load subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (subcategoriesError) throw subcategoriesError;

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, type, amount, category_id, subcategory_id, bank_account_id, date, paid, observation, user_id')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Load bank accounts
      const { data: bankAccountsData, error: bankAccountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('bank_name');

      if (bankAccountsError) throw bankAccountsError;

      // Transform data to match local types
      setCategories(categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
      })));

      setSubcategories(subcategoriesData.map(sub => ({
        id: sub.id,
        name: sub.name,
        parentId: sub.parent_id,
        type: sub.type,
      })));

      setTransactions(transactionsData.map(trans => ({
        id: trans.id,
        type: trans.type,
        amount: trans.amount,
        category: trans.category_id,
        subCategory: trans.subcategory_id,
        bankAccount: trans.bank_account_id || undefined,
        date: trans.date,
        paid: trans.paid,
        observation: trans.observation,
      })));

      setBankAccounts(bankAccountsData.map(account => ({
        id: account.id,
        bankName: account.bank_name,
        accountNumber: account.account_number,
        type: account.type,
        userId: account.user_id,
        createdAt: account.created_at,
      })));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category,
        subcategory_id: transaction.subCategory || null,
        bank_account_id: transaction.bankAccount || null,
        date: transaction.date,
        paid: transaction.paid || false,
        observation: transaction.observation || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    const newTransaction: Transaction = {
      id: data.id,
      type: data.type,
      amount: data.amount,
      category: transaction.category,
      subCategory: data.subcategory_id,
      bankAccount: data.bank_account_id || undefined,
      date: data.date,
      paid: data.paid,
      observation: data.observation,
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    if (!user) return;

    const updateData: any = {};
    if (transaction.type) updateData.type = transaction.type;
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.category) updateData.category_id = transaction.category;
    if (transaction.subCategory !== undefined) updateData.subcategory_id = transaction.subCategory || null;
    if (transaction.bankAccount !== undefined) updateData.bank_account_id = transaction.bankAccount || null;
    if (transaction.date) updateData.date = transaction.date;
    if (transaction.paid !== undefined) updateData.paid = transaction.paid;
    if (transaction.observation !== undefined) updateData.observation = transaction.observation || null;

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...transaction } : t)
    );
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        type: category.type,
        color: category.color,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    const newCategory: Category = {
      id: data.id,
      name: data.name,
      type: data.type,
      color: data.color,
    };

    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        type: category.type,
        color: category.color,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setCategories(prev =>
      prev.map(c => c.id === id ? { ...c, ...category } : c)
    );
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setCategories(prev => prev.filter(c => c.id !== id));
    setSubcategories(prev => prev.filter(sc => sc.parentId !== id));
    setTransactions(prev => prev.filter(t => t.category !== id));
  };

  const addSubCategory = async (subCategory: Omit<SubCategory, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        name: subCategory.name,
        parent_id: subCategory.parentId,
        type: subCategory.type,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    const newSubCategory: SubCategory = {
      id: data.id,
      name: data.name,
      parentId: data.parent_id,
      type: data.type,
    };

    setSubcategories(prev => [...prev, newSubCategory]);
  };

  const updateSubCategory = async (id: string, subCategory: Partial<SubCategory>) => {
    if (!user) return;

    const { error } = await supabase
      .from('subcategories')
      .update({
        name: subCategory.name,
        parent_id: subCategory.parentId,
        type: subCategory.type,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setSubcategories(prev =>
      prev.map(sc => sc.id === id ? { ...sc, ...subCategory } : sc)
    );
  };

  const deleteSubCategory = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setSubcategories(prev => prev.filter(sc => sc.id !== id));
    setTransactions(prev => prev.map(t => 
      t.subCategory === id ? { ...t, subCategory: undefined } : t
    ));
  };

  const addBankAccount = async (bankAccount: Omit<BankAccount, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        bank_name: bankAccount.bankName,
        account_number: bankAccount.accountNumber,
        type: bankAccount.type,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    const newBankAccount: BankAccount = {
      id: data.id,
      bankName: data.bank_name,
      accountNumber: data.account_number,
      type: data.type,
      userId: data.user_id,
      createdAt: data.created_at,
    };

    setBankAccounts(prev => [...prev, newBankAccount]);
  };

  const updateBankAccount = async (id: string, bankAccount: Partial<BankAccount>) => {
    if (!user) return;

    const updateData: any = {};
    if (bankAccount.bankName) updateData.bank_name = bankAccount.bankName;
    if (bankAccount.accountNumber) updateData.account_number = bankAccount.accountNumber;
    if (bankAccount.type) updateData.type = bankAccount.type;

    const { error } = await supabase
      .from('bank_accounts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setBankAccounts(prev =>
      prev.map(account => account.id === id ? { ...account, ...bankAccount } : account)
    );
  };

  const deleteBankAccount = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setBankAccounts(prev => prev.filter(account => account.id !== id));
  };

  const getReport = (yearFilter: string | number, monthFilter: string | number): MonthlyReport => {
    let filteredTransactions = transactions;
    
    if (yearFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionYear = new Date(t.date).getFullYear();
        return transactionYear === Number(yearFilter);
      });
    }
    
    if (monthFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionMonth = new Date(t.date).getMonth() + 1;
        return transactionMonth === Number(monthFilter);
      });
    }
    
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const investmentTransactions = filteredTransactions.filter(t => t.type === 'investment');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalInvestments = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalUnpaidExpenses = expenseTransactions
      .filter(t => !t.paid)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const incomeByCategory: { [category: string]: number } = {};
    const expensesByCategory: { [category: string]: number } = {};
    const investmentsByBank: { [bankName: string]: number } = {};
    
    incomeTransactions.forEach(t => {
      const categoryName = categories.find(c => c.id === t.category)?.name || 'Outros';
      incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + t.amount;
    });
    
    expenseTransactions.forEach(t => {
      const categoryName = categories.find(c => c.id === t.category)?.name || 'Outros';
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + t.amount;
    });
    
    investmentTransactions.forEach(t => {
      const bankAccount = bankAccounts.find(b => b.id === t.bankAccount);
      const bankName = bankAccount ? bankAccount.bankName : 'Conta não especificada';
      investmentsByBank[bankName] = (investmentsByBank[bankName] || 0) + t.amount;
    });
    
    return {
      month: yearFilter === 'all' && monthFilter === 'all' ? 'all' : 
            yearFilter === 'all' ? `all-${monthFilter}` :
            monthFilter === 'all' ? `${yearFilter}-all` : 
            `${yearFilter}-${String(monthFilter).padStart(2, '0')}`,
      totalIncome,
      totalExpenses,
      totalInvestments,
      totalUnpaidExpenses,
      balance: totalIncome - totalExpenses,
      incomeByCategory,
      expensesByCategory,
      investmentsByBank,
    };
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      categories,
      subcategories,
      bankAccounts,
      loading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
      addBankAccount,
      updateBankAccount,
      deleteBankAccount,
      getReport,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};