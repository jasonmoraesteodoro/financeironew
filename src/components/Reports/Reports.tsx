import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, formatInvestmentCurrency, getAvailableYears } from '../../utils/formatters';
import MonthlyChart from '../Dashboard/MonthlyChart';
import InvestmentStatement from './InvestmentStatement';

const Reports: React.FC = () => {
  const { getReport, categories, transactions, bankAccounts } = useFinance();
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Receita Provisionada</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalIncome)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Receitas Recebidas</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalReceivedIncome)}</p>
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

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Investimentos</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalInvestments)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className={`bg-gradient-to-r ${
          report.balance >= 0
            ? 'from-blue-500 to-blue-600'
            : 'from-orange-500 to-orange-600'
        } rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${
                report.balance >= 0 ? 'text-blue-100' : 'text-orange-100'
              } text-sm`}>
                Saldo do Período
              </p>
              <p className="text-2xl font-bold">{formatCurrency(report.balance)}</p>
            </div>
            <BarChart3 className={`w-8 h-8 ${
              report.balance >= 0 ? 'text-blue-200' : 'text-orange-200'
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

      {/* Consolidated Monthly Table */}
      {availableYears.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Resumo Consolidado Mensal</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">TIPO</th>
                  {['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'].map((month, i) => (
                    <th key={i} className="text-center py-3 px-2 font-semibold text-gray-700 text-sm">
                      {month}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {/* Receitas Row */}
                <tr className="border-b border-gray-100 hover:bg-green-50">
                  <td className="py-3 px-4 font-medium text-green-700">Receitas</td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthReport = getReport(selectedYear, i + 1);
                    return (
                      <td key={i} className="py-3 px-2 text-center text-sm">
                        {monthReport.totalIncome > 0 ? (
                          <span className="text-green-600 font-medium whitespace-nowrap">
                            {formatInvestmentCurrency(monthReport.totalIncome)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-bold text-green-600 whitespace-nowrap">
                    {formatInvestmentCurrency(Array.from({ length: 12 }, (_, i) => getReport(selectedYear, i + 1).totalIncome).reduce((sum, val) => sum + val, 0))}
                  </td>
                </tr>

                {/* Despesas Row */}
                <tr className="border-b border-gray-100 hover:bg-red-50">
                  <td className="py-3 px-4 font-medium text-red-700">Despesas</td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthReport = getReport(selectedYear, i + 1);
                    return (
                      <td key={i} className="py-3 px-2 text-center text-sm">
                        {monthReport.totalExpenses > 0 ? (
                          <span className="text-red-600 font-medium whitespace-nowrap">
                            {formatInvestmentCurrency(monthReport.totalExpenses)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-bold text-red-600 whitespace-nowrap">
                    {formatInvestmentCurrency(Array.from({ length: 12 }, (_, i) => getReport(selectedYear, i + 1).totalExpenses).reduce((sum, val) => sum + val, 0))}
                  </td>
                </tr>

                {/* Investimentos Row */}
                <tr className="border-b border-gray-100 hover:bg-blue-50">
                  <td className="py-3 px-4 font-medium text-blue-700">Investimentos</td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthReport = getReport(selectedYear, i + 1);
                    return (
                      <td key={i} className="py-3 px-2 text-center text-sm">
                        {monthReport.totalInvestments > 0 ? (
                          <span className="text-blue-600 font-medium whitespace-nowrap">
                            {formatInvestmentCurrency(monthReport.totalInvestments)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-bold text-blue-600 whitespace-nowrap">
                    {formatInvestmentCurrency(Array.from({ length: 12 }, (_, i) => getReport(selectedYear, i + 1).totalInvestments).reduce((sum, val) => sum + val, 0))}
                  </td>
                </tr>

                {/* Saldo Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <td className="py-3 px-4 text-gray-700">Saldo</td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthReport = getReport(selectedYear, i + 1);
                    const monthBalance = monthReport.totalIncome - monthReport.totalExpenses;
                    return (
                      <td key={i} className="py-3 px-2 text-center text-sm">
                        {monthBalance !== 0 ? (
                          <span className={`font-bold whitespace-nowrap ${
                            monthBalance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatInvestmentCurrency(monthBalance)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`py-3 px-4 text-right font-bold text-lg whitespace-nowrap ${
                    (() => {
                      const totalBalance = Array.from({ length: 12 }, (_, i) => {
                        const monthReport = getReport(selectedYear, i + 1);
                        return monthReport.totalIncome - monthReport.totalExpenses;
                      }).reduce((sum, val) => sum + val, 0);
                      return totalBalance >= 0 ? 'text-green-600' : 'text-red-600';
                    })()
                  }`}>
                    {formatInvestmentCurrency(Array.from({ length: 12 }, (_, i) => {
                      const monthReport = getReport(selectedYear, i + 1);
                      return monthReport.totalIncome - monthReport.totalExpenses;
                    }).reduce((sum, val) => sum + val, 0))}
                  </td>
                </tr>

                {/* Saldo Final Row */}
                <tr className="border-t border-gray-200 bg-blue-50 font-bold">
                  <td className="py-3 px-4 text-blue-700">Saldo Final</td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthReport = getReport(selectedYear, i + 1);
                    const finalBalance = monthReport.totalIncome - monthReport.totalExpenses - monthReport.totalInvestments;
                    return (
                      <td key={i} className="py-3 px-2 text-center text-sm">
                        {finalBalance !== 0 ? (
                          <span className={`font-bold whitespace-nowrap ${
                            finalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatInvestmentCurrency(finalBalance)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`py-3 px-4 text-right font-bold text-xl whitespace-nowrap ${
                    (() => {
                      const totalFinalBalance = Array.from({ length: 12 }, (_, i) => {
                        const monthReport = getReport(selectedYear, i + 1);
                        return monthReport.totalIncome - monthReport.totalExpenses - monthReport.totalInvestments;
                      }).reduce((sum, val) => sum + val, 0);
                      return totalFinalBalance >= 0 ? 'text-green-600' : 'text-red-600';
                    })()
                  }`}>
                    {formatInvestmentCurrency(Array.from({ length: 12 }, (_, i) => {
                      const monthReport = getReport(selectedYear, i + 1);
                      return monthReport.totalIncome - monthReport.totalExpenses - monthReport.totalInvestments;
                    }).reduce((sum, val) => sum + val, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;