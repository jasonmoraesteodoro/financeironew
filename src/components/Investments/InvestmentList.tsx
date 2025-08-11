import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import InvestmentForm from './InvestmentForm';
import InvestmentAnalytics from './InvestmentAnalytics';

const InvestmentList: React.FC = () => {
  const { transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const investmentTransactions = transactions.filter(transaction => transaction.type === 'investment');

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const totalAmount = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            💰
            <span className="ml-2">Meus Investimentos</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total investido: <span className="font-semibold">{formatCurrency(totalAmount)}</span> ({investmentTransactions.length} investimentos)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Investimento
          </button>
        </div>
      </div>

      {/* Analytics View */}
      <InvestmentAnalytics />

      {/* Investment Form Modal */}
      {showForm && (
        <InvestmentForm
          transaction={editingTransaction}
          onClose={handleCloseForm}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default InvestmentList;