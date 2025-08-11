import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, getAvailableYears } from '../../utils/formatters';
import MonthlyChart from '../Dashboard/MonthlyChart';
import InvestmentStatement from './InvestmentStatement';

const Reports: React.FC = () => {
  const { getReport, categories, transactions, bankAccounts } = useFinance();
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const report = getReport(selectedYear, selectedMonth);

  const availableYears = getAvailableYears(transactions);
  
  const months = [
    { value: 'all', label: 'Todos os meses' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Relatórios Financeiros</h3>
          <p className="text-sm text-gray-600">
            Análise detalhada das suas receitas e despesas
          </p>
        </div>
        
        {/* Year and Month Selectors */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os anos</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total de Receitas</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalIncome)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total de Despesas</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalExpenses)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className={`bg-gradient-to-r ${
          report.balance >= 0 
            ? 'from-blue-500 to-blue-600' 
            : 'from-red-500 to-red-600'
        } rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${
                report.balance >= 0 ? 'text-blue-100' : 'text-red-100'
              } text-sm`}>
                Saldo do Período
              </p>
              <p className="text-2xl font-bold">{formatCurrency(report.balance)}</p>
            </div>
            <BarChart3 className={`w-8 h-8 ${
              report.balance >= 0 ? 'text-blue-200' : 'text-red-200'
            }`} />
          </div>
        </div>
      </div>

      {/* Charts and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Report Chart */}
        <MonthlyChart monthlyReport={report} categories={categories} />
        
        {/* Investment Statement */}
        <InvestmentStatement monthlyReport={report} bankAccounts={bankAccounts} />
      </div>
    </div>
  );
};

export default Reports;