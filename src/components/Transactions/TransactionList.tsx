import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import TransactionForm from './TransactionForm';
import IncomeAnalytics from './IncomeAnalytics';
import ExpenseAnalytics from './ExpenseAnalytics';

interface TransactionListProps {
  type: 'income' | 'expense';
}

const TransactionList: React.FC<TransactionListProps> = ({ type }) => {
  const { transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => transaction.type === type);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            {type === 'income' ? '📈' : '📉'}
            <span className="ml-2">
              {type === 'income' ? 'Minhas Receitas' : 'Minhas Despesas'}
            </span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: <span className="font-semibold">{formatCurrency(totalAmount)}</span> ({filteredTransactions.length} transações)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowForm(true)}
            className={`inline-flex items-center px-4 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm ${
              type === 'income'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova {type === 'income' ? 'Receita' : 'Despesa'}
          </button>
        </div>
      </div>

      {/* Analytics View for Income */}
      {type === 'income' ? (
        <IncomeAnalytics />
      ) : (
        <ExpenseAnalytics />
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          type={type}
          transaction={editingTransaction}
          onClose={handleCloseForm}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default TransactionList;