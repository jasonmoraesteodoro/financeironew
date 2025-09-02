import React, { useState } from 'react';
import { Banknote, Edit2, Trash2, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction } from '../../types';
import { formatCurrency, formatDate, generateMonths, getAvailableYears, groupTransactionsByMonth } from '../../utils/formatters';
import InvestmentForm from './InvestmentForm';

const InvestmentAnalytics: React.FC = () => {
  const { transactions, categories, bankAccounts, deleteTransaction } = useFinance();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFilterYear, setSelectedFilterYear] = useState('all');
  const [selectedFilterMonth, setSelectedFilterMonth] = useState('all');
  const [selectedFilterBank, setSelectedFilterBank] = useState('');
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'total'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter investment transactions
  const investmentTransactions = transactions.filter(t => t.type === 'investment');

  // Filter transactions for the detailed section
  const getFilteredTransactions = () => {
    return investmentTransactions.filter(t => {
      const transactionYear = parseInt(t.date.substring(0, 4));
      const transactionMonth = parseInt(t.date.substring(5, 7));
      const matchesYear = selectedFilterYear === 'all' || transactionYear === Number(selectedFilterYear);
      const matchesMonth = selectedFilterMonth === 'all' || transactionMonth === Number(selectedFilterMonth);
      const matchesBank = selectedFilterBank === '' || t.bankAccount === selectedFilterBank;
      
      return matchesYear && matchesMonth && matchesBank;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate KPIs by bank
  const bankKPIs = bankAccounts.map(bank => {
    const bankTransactions = filteredTransactions.filter(t => t.bankAccount === bank.id);
    const total = bankTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalInvestments = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = totalInvestments > 0 ? (total / totalInvestments) * 100 : 0;
    
    return {
      id: bank.id,
      name: bank.bankName,
      accountNumber: bank.accountNumber,
      total,
      percentage
    };
  }).sort((a, b) => b.total - a.total);

  const totalInvestments = bankKPIs.reduce((sum, kpi) => sum + kpi.total, 0);

  const months = generateMonths(selectedYear);

  // Calculate monthly data by bank
  let monthlyData = bankAccounts.map(bank => {
    const monthlyTotals = months.map(month => {
      const monthTransactions = filteredTransactions.filter(t => 
        t.bankAccount === bank.id && t.date.startsWith(month.key)
      );
      return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    const bankTotal = monthlyTotals.reduce((sum, amount) => sum + amount, 0);

    return {
      id: bank.id,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      monthlyTotals,
      total: bankTotal
    };
  });

  // Sort monthly data based on selected criteria
  monthlyData = monthlyData.sort((a, b) => {
    if (sortBy === 'name') {
      const comparison = a.bankName.localeCompare(b.bankName, 'pt-BR');
      return sortOrder === 'asc' ? comparison : -comparison;
    } else {
      const comparison = b.total - a.total; // Default descending for totals
      return sortOrder === 'asc' ? -comparison : comparison;
    }
  });

  // Calculate monthly totals
  const monthlyTotals = months.map((_, monthIndex) => 
    monthlyData.reduce((sum, row) => sum + row.monthlyTotals[monthIndex], 0)
  );

  const grandTotal = monthlyTotals.reduce((sum, amount) => sum + amount, 0);

  const availableYears = getAvailableYears(investmentTransactions);

  const handleSort = (newSortBy: 'name' | 'total') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'name' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (column: 'name' | 'total') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-600" /> : 
      <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const groupedTransactions = groupTransactionsByMonth(filteredTransactions);

  const getBankName = (bankAccountId?: string) => {
    if (!bankAccountId) return 'Conta não especificada';
    const bank = bankAccounts.find(b => b.id === bankAccountId);
    return bank ? `${bank.bankName} - ****${bank.accountNumber.slice(-4)}` : 'Conta não encontrada';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowInvestmentForm(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este investimento?')) {
      deleteTransaction(id);
    }
  };

  const handleCloseForm = () => {
    setShowInvestmentForm(false);
    setEditingTransaction(null);
  };

  const getDefaultFormData = () => {
    const currentYear = selectedFilterYear === 'all' ? new Date().getFullYear() : Number(selectedFilterYear);
    const currentMonth = selectedFilterMonth === 'all' ? new Date().getMonth() + 1 : Number(selectedFilterMonth);
    const currentDay = new Date().getDate();
    const defaultDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    return {
      defaultDate,
      defaultBankAccount: selectedFilterBank
    };
  };

  return (
    <div className="space-y-6">
      {/* Filtros Principais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <p className="text-sm text-gray-600">Filtre os dados por período e conta bancária</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
            <select
              value={selectedFilterYear}
              onChange={(e) => setSelectedFilterYear(e.target.value)}
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
              value={selectedFilterMonth}
              onChange={(e) => setSelectedFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const currentYear = selectedFilterYear === 'all' ? new Date().getFullYear() : Number(selectedFilterYear);
                const monthName = new Date(currentYear, i, 1).toLocaleDateString('pt-BR', { month: 'long' });
                return (
                  <option key={month} value={month}>
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conta Bancária</label>
            <select
              value={selectedFilterBank}
              onChange={(e) => setSelectedFilterBank(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as contas</option>
              {bankAccounts.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.bankName} - ****{bank.accountNumber.slice(-4)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs por Banco */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {/* Total Geral */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Total Investido</p>
              <p className="text-lg font-bold">{formatCurrency(totalInvestments)}</p>
            </div>
            <Banknote className="w-6 h-6 text-blue-200" />
          </div>
        </div>

        {/* Todos os Bancos */}
        {bankKPIs
          .filter(kpi => kpi.total > 0)
          .map((kpi) => (
            <div key={kpi.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-gray-600 text-xs font-medium truncate">{kpi.name}</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(kpi.total)}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${kpi.percentage}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">
                {kpi.percentage.toFixed(1)}% do total
              </p>
            </div>
          ))}
      </div>

      {/* Resumo por Conta e Mês */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Resumo por Conta e Mês</h3>
          <div className="flex items-center space-x-3">
           <div className="flex items-center space-x-2 text-sm text-gray-600">
             <span>Ordenar por:</span>
             <button
               onClick={() => handleSort('name')}
               className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
             >
               <span>Nome</span>
               {getSortIcon('name')}
             </button>
             <button
               onClick={() => handleSort('total')}
               className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
             >
               <span>Total</span>
               {getSortIcon('total')}
             </button>
           </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                  >
                    <span>CONTAS BANCÁRIAS</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                {months.map(month => (
                  <th key={month.key} className="text-center py-3 px-2 font-semibold text-gray-700 text-sm">
                    {month.label}
                  </th>
                ))}
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('total')}
                    className="flex items-center space-x-2 hover:text-blue-600 transition-colors ml-auto"
                  >
                    <span>TOTAL</span>
                    {getSortIcon('total')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{row.bankName}</span>
                      <span className="text-xs text-gray-500">****{row.accountNumber.slice(-4)}</span>
                    </div>
                  </td>
                  {row.monthlyTotals.map((amount, monthIndex) => (
                    <td key={monthIndex} className="py-3 px-2 text-center text-sm">
                      {amount > 0 ? (
                        <span className="text-blue-600 font-medium">
                          {formatCurrency(amount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right font-bold text-blue-600">
                    {formatCurrency(row.total)}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                <td className="py-3 px-4 text-gray-900">Totais</td>
                {monthlyTotals.map((amount, monthIndex) => (
                  <td key={monthIndex} className="py-3 px-2 text-center text-sm">
                    {amount > 0 ? (
                      <span className="text-blue-600 font-bold">
                        {formatCurrency(amount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
                <td className="py-3 px-4 text-right text-blue-600 font-bold text-lg">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Transações Detalhadas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Investimentos Detalhados</h3>
          <p className="text-sm text-gray-600">Lista completa dos investimentos filtrados</p>
        </div>

        {/* Lista de Investimentos Filtrados */}
        <div className="space-y-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Banknote className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum investimento encontrado
              </h4>
              <p className="text-gray-500 mb-4">
                Não há investimentos para os filtros selecionados
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} investimento(s) encontrado(s) - Total: {' '}
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </p>
              </div>
              
              {/* Investimentos agrupados por mês */}
              {groupedTransactions.map((monthGroup) => (
                <div key={monthGroup.monthKey} className="space-y-3">
                  {/* Cabeçalho do mês */}
                  <div className="flex items-center justify-between py-3 px-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-800 capitalize">
                      {monthGroup.monthLabel}
                    </h4>
                    <div className="text-right">
                      <span className="text-sm text-blue-600">
                        {monthGroup.transactions.length} investimento(s)
                      </span>
                      <div className="font-bold text-blue-700">
                        {formatCurrency(monthGroup.total)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Investimentos do mês */}
                  {monthGroup.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors ml-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {transaction.observation || 'Investimento'}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span className="truncate">
                                {getBankName(transaction.bankAccount)}
                              </span>
                              <span className="flex-shrink-0">
                                {formatDate(transaction.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <span className="font-bold text-lg text-blue-600">
                          {formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Investment Form Modal */}
      {showInvestmentForm && (
        <InvestmentForm
          transaction={editingTransaction}
          onClose={handleCloseForm}
          onSave={() => {}}
          {...getDefaultFormData()}
        />
      )}
    </div>
  );
};

export default InvestmentAnalytics;