import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, categories }) => {
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Categoria não encontrada';
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações Recentes</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma transação encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações Recentes</h3>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                transaction.type === 'income' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                <p className="text-xs text-gray-500">{getCategoryName(transaction.category)}</p>
                <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
              {transaction.type === 'expense' && (
                <p className={`text-xs ${
                  transaction.paid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.paid ? 'Pago' : 'Pendente'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;