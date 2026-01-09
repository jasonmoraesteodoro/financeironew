import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CashFlowChartProps {
  transactions: Transaction[];
  categories: Category[];
  selectedYear: string;
  selectedMonth: string;
}

interface MonthData {
  month: string;
  receivedIncome: number;
  paidExpenses: number;
  balance: number;
}

interface ProvisionedMonthData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
}

type ChartView = 'realizado' | 'provisionado';

const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions, selectedYear, selectedMonth }) => {
  const [activeView, setActiveView] = useState<ChartView>('realizado');
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const formatAbbreviated = (value: number): string => {
    if (value === 0) return '0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) {
      return `${sign}${(absValue / 1000000).toFixed(1)}Mi`;
    } else if (absValue >= 1000) {
      return `${sign}${(absValue / 1000).toFixed(1)}k`;
    } else {
      return `${sign}${absValue.toFixed(0)}`;
    }
  };

  const getMonthlyData = (): MonthData[] => {
    const monthlyData: MonthData[] = [];

    const currentYear = selectedYear === 'all' ? new Date().getFullYear() : Number(selectedYear);

    for (let i = 0; i < 12; i++) {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth();

        if (selectedYear === 'all') {
          return transactionMonth === i;
        }
        return transactionYear === currentYear && transactionMonth === i;
      });

      const receivedIncome = monthTransactions
        .filter(t => t.type === 'income' && t.received)
        .reduce((sum, t) => sum + t.amount, 0);

      const paidExpenses = monthTransactions
        .filter(t => t.type === 'expense' && t.paid)
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = receivedIncome - paidExpenses;

      monthlyData.push({
        month: months[i],
        receivedIncome,
        paidExpenses,
        balance,
      });
    }

    return monthlyData;
  };

  const getProvisionedData = (): ProvisionedMonthData[] => {
    const provisionedData: ProvisionedMonthData[] = [];

    const currentYear = selectedYear === 'all' ? new Date().getFullYear() : Number(selectedYear);

    for (let i = 0; i < 12; i++) {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth();

        if (selectedYear === 'all') {
          return transactionMonth === i;
        }
        return transactionYear === currentYear && transactionMonth === i;
      });

      const totalIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      provisionedData.push({
        month: months[i],
        totalIncome,
        totalExpenses,
      });
    }

    return provisionedData;
  };

  const getFilteredCardData = () => {
    const isAllYears = selectedYear === 'all';
    const isAllMonths = selectedMonth === 'all';
    const currentYear = isAllYears ? new Date().getFullYear() : Number(selectedYear);
    const monthIndex = isAllMonths ? null : Number(selectedMonth) - 1;

    let receivedIncome = 0;
    let paidExpenses = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const transactionYear = transactionDate.getFullYear();
      const transactionMonth = transactionDate.getMonth();

      if (isAllYears && isAllMonths) {
        return true;
      } else if (isAllYears && !isAllMonths) {
        return transactionMonth === monthIndex;
      } else if (!isAllYears && isAllMonths) {
        return transactionYear === currentYear;
      } else {
        return transactionYear === currentYear && transactionMonth === monthIndex;
      }
    });

    receivedIncome = filteredTransactions
      .filter(t => t.type === 'income' && t.received)
      .reduce((sum, t) => sum + t.amount, 0);

    paidExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.paid)
      .reduce((sum, t) => sum + t.amount, 0);

    totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = receivedIncome - paidExpenses;

    return {
      receivedIncome,
      paidExpenses,
      balance,
      totalIncome,
      totalExpenses,
    };
  };

  const getPeriodLabel = () => {
    const isAllYears = selectedYear === 'all';
    const isAllMonths = selectedMonth === 'all';
    const monthIndex = isAllMonths ? null : Number(selectedMonth) - 1;
    const currentYear = isAllYears ? new Date().getFullYear() : Number(selectedYear);

    if (isAllYears && isAllMonths) {
      return 'Total Geral';
    } else if (isAllYears && !isAllMonths) {
      const monthName = new Date(currentYear, monthIndex!, 1).toLocaleDateString('pt-BR', { month: 'long' });
      return monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' (Todos os anos)';
    } else if (!isAllYears && isAllMonths) {
      return `Ano ${selectedYear}`;
    } else {
      const monthName = new Date(currentYear, monthIndex!, 1).toLocaleDateString('pt-BR', { month: 'long' });
      return monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + selectedYear;
    }
  };

  const monthlyData = getMonthlyData();
  const provisionedData = getProvisionedData();
  const cardData = getFilteredCardData();
  const periodLabel = getPeriodLabel();

  const maxIncome = Math.max(...monthlyData.map(d => d.receivedIncome), 1);
  const maxExpense = Math.max(...monthlyData.map(d => d.paidExpenses), 1);
  const maxValue = Math.max(maxIncome, maxExpense);

  const maxProvisionedIncome = Math.max(...provisionedData.map(d => d.totalIncome), 1);
  const maxProvisionedExpense = Math.max(...provisionedData.map(d => d.totalExpenses), 1);
  const maxProvisionedValue = Math.max(maxProvisionedIncome, maxProvisionedExpense);

  const minBalance = Math.min(...monthlyData.map(d => d.balance), 0);
  const maxBalance = Math.max(...monthlyData.map(d => d.balance), 1);
  const balanceRange = maxBalance - minBalance || 1;

  const getYAxisLabels = (maxVal: number) => {
    const labels = [];
    for (let i = 0; i <= 4; i++) {
      const value = maxVal * (1 - i / 4);
      labels.push({
        value,
        label: formatAbbreviated(value),
        y: 20 + (i * 20)
      });
    }
    return labels;
  };

  const yAxisLabels = activeView === 'realizado' ? getYAxisLabels(maxValue) : getYAxisLabels(maxProvisionedValue);

  const getIncomeY = (value: number) => {
    return 100 - (value / maxValue) * 80;
  };

  const getBalanceY = (value: number) => {
    return 100 - ((value - minBalance) / balanceRange) * 80;
  };

  const getProvisionedY = (value: number) => {
    return 100 - (value / maxProvisionedValue) * 80;
  };

  const incomePoints = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * 100;
    const y = getIncomeY(d.receivedIncome);
    return `${x},${y}`;
  }).join(' ');

  const expensePoints = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * 100;
    const y = getIncomeY(d.paidExpenses);
    return `${x},${y}`;
  }).join(' ');

  const balancePoints = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * 100;
    const y = getBalanceY(d.balance);
    return `${x},${y}`;
  }).join(' ');

  const provisionedIncomePoints = provisionedData.map((d, i) => {
    const x = (i / (provisionedData.length - 1)) * 100;
    const y = getProvisionedY(d.totalIncome);
    return `${x},${y}`;
  }).join(' ');

  const provisionedExpensePoints = provisionedData.map((d, i) => {
    const x = (i / (provisionedData.length - 1)) * 100;
    const y = getProvisionedY(d.totalExpenses);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa Mensal</h3>
          <p className="text-sm text-gray-600">
            {activeView === 'realizado'
              ? 'Evolução de receitas recebidas, despesas pagas e saldo'
              : 'Evolução de receitas e despesas provisionadas'}
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveView('realizado')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeView === 'realizado'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Realizado
        </button>
        <button
          onClick={() => setActiveView('provisionado')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeView === 'provisionado'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Provisionado
        </button>
      </div>

      {activeView === 'realizado' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="text-sm text-gray-600">Receitas Recebidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-500"></div>
            <span className="text-sm text-gray-600">Despesas Pagas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span className="text-sm text-gray-600">Saldo</span>
          </div>
        </div>

        <div className="relative h-64 flex">
          <div className="flex flex-col justify-between py-2 pr-3 text-xs text-gray-500 w-16">
            {yAxisLabels.map((label, i) => (
              <div key={i} className="text-right leading-none">
                {label.label}
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.2" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.2" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.2" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.2" />

            <polyline
              points={incomePoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={expensePoints}
              fill="none"
              stroke="#ef4444"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={balancePoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />

              {monthlyData.map((d, i) => {
                const x = (i / (monthlyData.length - 1)) * 100;
                const incomeY = getIncomeY(d.receivedIncome);
                const expenseY = getIncomeY(d.paidExpenses);
                const balanceY = getBalanceY(d.balance);

                return (
                  <g key={i}>
                    <circle cx={x} cy={incomeY} r="0.8" fill="#10b981" />
                    <circle cx={x} cy={expenseY} r="0.8" fill="#ef4444" />
                    <circle cx={x} cy={balanceY} r="0.8" fill="#3b82f6" />
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full">
                {monthlyData.map((d, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${(i / (monthlyData.length - 1)) * 100}%`,
                      top: '100%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="text-xs text-gray-500 mt-2">{d.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Receitas Recebidas - {periodLabel}</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(cardData.receivedIncome)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Despesas Pagas - {periodLabel}</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(cardData.paidExpenses)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Saldo - {periodLabel}</div>
            <div className={`text-lg font-bold ${cardData.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(cardData.balance)}
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span className="text-sm text-gray-600">Receitas Provisionadas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-red-500"></div>
              <span className="text-sm text-gray-600">Despesas Provisionadas</span>
            </div>
          </div>

          <div className="relative h-64 flex">
            <div className="flex flex-col justify-between py-2 pr-3 text-xs text-gray-500 w-16">
              {yAxisLabels.map((label, i) => (
                <div key={i} className="text-right leading-none">
                  {label.label}
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.2" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.2" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.2" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.2" />

                <polyline
                  points={provisionedIncomePoints}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={provisionedExpensePoints}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />

                {provisionedData.map((d, i) => {
                  const x = (i / (provisionedData.length - 1)) * 100;
                  const incomeY = getProvisionedY(d.totalIncome);
                  const expenseY = getProvisionedY(d.totalExpenses);

                  return (
                    <g key={i}>
                      <circle cx={x} cy={incomeY} r="0.8" fill="#10b981" />
                      <circle cx={x} cy={expenseY} r="0.8" fill="#ef4444" />
                    </g>
                  );
                })}
              </svg>

              <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full">
                  {provisionedData.map((d, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${(i / (provisionedData.length - 1)) * 100}%`,
                        top: '100%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="text-xs text-gray-500 mt-2">{d.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Receitas Provisionadas - {periodLabel}</div>
              <div className="text-lg font-bold text-green-600">{formatCurrency(cardData.totalIncome)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Despesas Provisionadas - {periodLabel}</div>
              <div className="text-lg font-bold text-red-600">{formatCurrency(cardData.totalExpenses)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowChart;
