import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, getAvailableYears } from '../../utils/formatters';
import StatsCard from './StatsCard';
import TransactionsToPay from './TransactionsToPay';
import MonthlyChart from './MonthlyChart';
import TransactionForm from '../Transactions/TransactionForm';

interface DashboardProps {
  onNavigate?: (tab: string, settingsSubTab?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { transactions, categories, subcategories, getReport } = useFinance();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

  // Get filtered report
  const monthlyReport = getReport(selectedYear, selectedMonth);

  const availableYears = getAvailableYears(transactions);
  const handleNewIncome = () => {
    setTransactionType('income');
    setShowTransactionForm(true);
  };

  const handleNewExpense = () => {
    setTransactionType('expense');
    setShowTransactionForm(true);
  };

  const handleReports = () => {
    if (onNavigate) {
      onNavigate('reports');
    }
  };

  const handleCategories = () => {
    if (onNavigate) {
      onNavigate('settings', 'categories');
    }
  };

  const handleCloseForm = () => {
    setShowTransactionForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <p className="text-sm text-gray-600">Filtre os dados por período</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os anos</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const currentYear = selectedYear === 'all' ? new Date().getFullYear() : Number(selectedYear);
                const monthName = new Date(currentYear, i, 1).toLocaleDateString('pt-BR', { month: 'long' });
                return (
                  <option key={month} value={month}>
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Receita Provisionada"
          value={formatCurrency(monthlyReport.totalIncome)}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Receitas Recebidas"
          value={formatCurrency(monthlyReport.totalReceivedIncome)}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total de Despesas"
          value={formatCurrency(monthlyReport.totalExpenses)}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Despesas a Pagar"
          value={formatCurrency(monthlyReport.totalUnpaidExpenses)}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Saldo do Mês"
          value={formatCurrency(monthlyReport.balance)}
          icon={Wallet}
          color={monthlyReport.balance >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2">
          <MonthlyChart monthlyReport={monthlyReport} categories={categories} />
        </div>

        {/* Transactions to Pay */}
        <div className="lg:col-span-1">
          <TransactionsToPay transactions={transactions} categories={categories} subcategories={subcategories} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleNewIncome}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nova Receita</span>
          </button>
          <button 
            onClick={handleNewExpense}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <TrendingDown className="w-6 h-6 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nova Despesa</span>
          </button>
          <button 
            onClick={handleReports}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <PieChart className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Relatórios</span>
          </button>
          <button 
            onClick={handleCategories}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Wallet className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Categorias</span>
          </button>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          type={transactionType}
          onClose={handleCloseForm}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default Dashboard;