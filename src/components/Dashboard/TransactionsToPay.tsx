import React from 'react';
import { TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { Transaction, Category, SubCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionsToPayProps {
  transactions: Transaction[];
  categories: Category[];
  subcategories: SubCategory[];
}

const TransactionsToPay: React.FC<TransactionsToPayProps> = ({ transactions, categories, subcategories }) => {
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Categoria não encontrada';
  };

  const getSubCategoryName = (subCategoryId?: string) => {
    if (!subCategoryId) return null;
    return subcategories.find(sc => sc.id === subCategoryId)?.name || null;
  };

  // Filter unpaid expenses and sort by date (oldest first)
  const unpaidExpenses = transactions
    .filter(t => t.type === 'expense' && !t.paid)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Show only first 5

  if (unpaidExpenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações a Pagar</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-500 font-medium">Parabéns!</p>
          <p className="text-sm text-gray-400 mt-1">Não há despesas pendentes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transações a Pagar</h3>
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{unpaidExpenses.length}</span>
        </div>
      </div>
      <div className="space-y-4">
        {unpaidExpenses.map((transaction) => {
          const isOverdue = new Date(transaction.date) < new Date();
          
          return (
            <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              isOverdue 
                ? 'border-red-200 bg-red-50 hover:border-red-300' 
                : 'border-gray-100 hover:border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isOverdue ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {transaction.observation || getSubCategoryName(transaction.subCategory) || getCategoryName(transaction.category)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.observation 
                      ? (getSubCategoryName(transaction.subCategory) 
                          ? `${getCategoryName(transaction.category)} → ${getSubCategoryName(transaction.subCategory)}`
                          : getCategoryName(transaction.category))
                      : getCategoryName(transaction.category)
                    }
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                    {isOverdue && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        Vencida
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-red-500">
                  Pendente
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {transactions.filter(t => t.type === 'expense' && !t.paid).length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            E mais {transactions.filter(t => t.type === 'expense' && !t.paid).length - 5} transação(ões) pendente(s)
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionsToPay;