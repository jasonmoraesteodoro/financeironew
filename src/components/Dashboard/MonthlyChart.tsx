import React from 'react';
import { BarChart3 } from 'lucide-react';
import { MonthlyReport, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyChartProps {
  monthlyReport: MonthlyReport;
  categories: Category[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ monthlyReport, categories }) => {
  const renderCategoryBars = (data: { [category: string]: number }, type: 'income' | 'expense') => {
    const entries = Object.entries(data);
    const totalAmount = entries.reduce((sum, [, amount]) => sum + amount, 0);
    
    if (entries.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhuma {type === 'income' ? 'receita' : 'despesa'} registrada
        </div>
      );
    }

    // Sort entries by amount in descending order
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
    const maxAmount = Math.max(...entries.map(([, amount]) => amount));

    return sortedEntries.map(([categoryName, amount]) => {
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      
      return (
        <div key={categoryName} className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{categoryName}</span>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
              <span className="text-xs text-gray-500 ml-2">{percentage.toFixed(1)}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                type === 'income' ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                width: `${(amount / maxAmount) * 100}%`,
              }}
            />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Demonstrativo Mensal por Categorias</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Categories */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <h4 className="font-semibold text-green-700">Receitas por Categoria</h4>
          </div>
          {renderCategoryBars(monthlyReport.incomeByCategory, 'income')}
          
          {monthlyReport.totalIncome > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total de Receitas:</span>
                <span className="font-bold text-green-600">{formatCurrency(monthlyReport.totalIncome)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <h4 className="font-semibold text-red-700">Despesas por Categoria</h4>
          </div>
          {renderCategoryBars(monthlyReport.expensesByCategory, 'expense')}
          
          {monthlyReport.totalExpenses > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total de Despesas:</span>
                <span className="font-bold text-red-600">{formatCurrency(monthlyReport.totalExpenses)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;