import React from 'react';
import { BarChart3 } from 'lucide-react';
import { MonthlyReport, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyChartProps {
  monthlyReport: MonthlyReport;
  categories: Category[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ monthlyReport, categories }) => {
  const getCategoryColor = (categoryName: string, type: 'income' | 'expense') => {
    const category = categories.find(c => c.name === categoryName && c.type === type);
    return category?.color || '#6B7280';
  };

  const renderCategoryBars = (data: { [category: string]: number }, type: 'income' | 'expense') => {
    const entries = Object.entries(data);
    const maxAmount = Math.max(...entries.map(([, amount]) => amount));
    
    if (entries.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhuma {type === 'income' ? 'receita' : 'despesa'} registrada
        </div>
      );
    }

    return entries.map(([category, amount]) => (
      <div key={category} className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{category}</span>
          <span className="text-sm text-gray-900">{formatCurrency(amount)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(amount / maxAmount) * 100}%`,
              backgroundColor: getCategoryColor(category, type),
            }}
          />
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Demonstrativo Mensal por Categorias</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <h4 className="font-semibold text-green-700">Receitas por Categoria</h4>
          </div>
          {renderCategoryBars(monthlyReport.incomeByCategory, 'income')}
          <div className="border-t border-gray-200 pt-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total de Receitas:</span>
              <span className="font-bold text-green-600">{formatCurrency(monthlyReport.totalIncome)}</span>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <h4 className="font-semibold text-red-700">Despesas por Categoria</h4>
          </div>
          {renderCategoryBars(monthlyReport.expensesByCategory, 'expense')}
          <div className="border-t border-gray-200 pt-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total de Despesas:</span>
              <span className="font-bold text-red-600">{formatCurrency(monthlyReport.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Saldo do Mês:</span>
            <span className={`text-xl font-bold ${
              monthlyReport.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(monthlyReport.balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;