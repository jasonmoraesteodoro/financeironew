import React, { useState } from 'react';
import { TrendingUp, Edit2, Trash2, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction } from '../../types';
import { formatInvestmentCurrency, generateMonths, getAvailableYears, groupTransactionsByMonth, formatDate } from '../../utils/formatters';
import TransactionForm from './TransactionForm';

const IncomeAnalytics: React.FC = () => {
  const { transactions, categories, subcategories, deleteTransaction } = useFinance();
  const [selectedFilterYear, setSelectedFilterYear] = useState(new Date().getFullYear().toString());
  const [selectedFilterMonth, setSelectedFilterMonth] = useState('all');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'total'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [detailedSortBy, setDetailedSortBy] = useState<'description' | 'category' | 'date' | 'amount'>('date');
  const [detailedSortOrder, setDetailedSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter income transactions
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const incomeCategories = categories.filter(c => c.type === 'income');
  const incomeSubcategories = subcategories.filter(sc => sc.type === 'income');

  // Filter transactions for the detailed section
  const getFilteredTransactions = () => {
    return incomeTransactions.filter(t => {
      const transactionYear = parseInt(t.date.substring(0, 4));
      const transactionMonth = parseInt(t.date.substring(5, 7));
      const matchesYear = selectedFilterYear === 'all' || transactionYear === Number(selectedFilterYear);
      const matchesMonth = selectedFilterMonth === 'all' || transactionMonth === Number(selectedFilterMonth);
      const matchesCategory = selectedFilterCategory === '' || t.category === selectedFilterCategory;
      
      return matchesYear && matchesMonth && matchesCategory;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate KPIs by category
  const categoryKPIs = incomeCategories.map(category => {
    const categoryTransactions = filteredTransactions.filter(t => t.category === category.id);
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = totalIncome > 0 ? (total / totalIncome) * 100 : 0;
    
    return {
      id: category.id,
      name: category.name,
      total,
      percentage,
      color: category.color
    };
  }).sort((a, b) => b.total - a.total);

  const totalIncome = categoryKPIs.reduce((sum, kpi) => sum + kpi.total, 0);

  const months = generateMonths(selectedFilterYear === 'all' ? new Date().getFullYear() : Number(selectedFilterYear));

  // Calculate monthly data by category
  let monthlyData = incomeCategories.map(category => {
    const categorySubcategories = incomeSubcategories.filter(sc => sc.parentId === category.id);
    
    const monthlyTotals = months.map(month => {
      const monthTransactions = filteredTransactions.filter(t => 
        t.category === category.id && t.date.startsWith(month.key)
      );
      return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    const categoryTotal = monthlyTotals.reduce((sum, amount) => sum + amount, 0);

    // Calculate subcategory data
    const subcategoryData = categorySubcategories.map(subcategory => {
      const subMonthlyTotals = months.map(month => {
        const subMonthTransactions = filteredTransactions.filter(t => 
          t.category === category.id && 
          t.subCategory === subcategory.id && 
          t.date.startsWith(month.key)
        );
        return subMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      });

      const subcategoryTotal = subMonthlyTotals.reduce((sum, amount) => sum + amount, 0);

      return {
        id: subcategory.id,
        name: subcategory.name,
        monthlyTotals: subMonthlyTotals,
        total: subcategoryTotal
      };
    });

    return {
      id: category.id,
      category: category.name,
      monthlyTotals,
      total: categoryTotal,
      subcategories: subcategoryData,
      hasSubcategories: categorySubcategories.length > 0
    };
  });

  // Sort monthly data based on selected criteria
  monthlyData = monthlyData.sort((a, b) => {
    if (sortBy === 'name') {
      const comparison = a.category.localeCompare(b.category, 'pt-BR');
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

  const availableYears = getAvailableYears(incomeTransactions);

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

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
      <ArrowUp className="w-4 h-4 text-green-600" /> :
      <ArrowDown className="w-4 h-4 text-green-600" />;
  };

  const getDetailedSortIcon = (column: 'description' | 'category' | 'date' | 'amount') => {
    if (detailedSortBy !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return detailedSortOrder === 'asc' ?
      <ArrowUp className="w-4 h-4 text-green-600" /> :
      <ArrowDown className="w-4 h-4 text-green-600" />;
  };

  const handleDetailedSort = (newSortBy: 'description' | 'category' | 'date' | 'amount') => {
    if (detailedSortBy === newSortBy) {
      setDetailedSortOrder(detailedSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setDetailedSortBy(newSortBy);
      setDetailedSortOrder(newSortBy === 'date' ? 'desc' : 'asc');
    }
  };

  const getSubCategoryName = (subCategoryId?: string) => {
    if (!subCategoryId) return null;
    const subCategory = incomeSubcategories.find(sc => sc.id === subCategoryId);
    return subCategory?.name || null;
  };

  const getCategoryName = (categoryId: string) => {
    const category = incomeCategories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const getDisplayTitle = (transaction: Transaction) => {
    const subCategoryName = getSubCategoryName(transaction.subCategory);
    if (subCategoryName) {
      return subCategoryName;
    }
    return getCategoryName(transaction.category);
  };

  const getDisplaySubtitle = (transaction: Transaction) => {
    const categoryName = getCategoryName(transaction.category);
    const subCategoryName = getSubCategoryName(transaction.subCategory);
    const observation = transaction.observation;

    const parts = [];

    if (subCategoryName) {
      parts.push(categoryName);
    }

    if (observation) {
      parts.push(observation);
    }

    return parts.join(' • ');
  };

  const sortDetailedTransactions = (transactions: Transaction[]) => {
    return [...transactions].sort((a, b) => {
      let comparison = 0;

      switch (detailedSortBy) {
        case 'description':
          comparison = getDisplayTitle(a).localeCompare(getDisplayTitle(b), 'pt-BR');
          break;
        case 'category':
          comparison = getCategoryName(a.category).localeCompare(getCategoryName(b.category), 'pt-BR');
          break;
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        default:
          return 0;
      }

      return detailedSortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const sortedTransactions = sortDetailedTransactions(filteredTransactions);
  const groupedTransactions = groupTransactionsByMonth(sortedTransactions);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDuplicateTransaction = (transaction: Transaction) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const duplicatedTransaction = {
      ...transaction,
      id: '',
      date: formattedDate
    };

    setEditingTransaction(duplicatedTransaction as Transaction);
    setShowTransactionForm(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id);
    }
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const handleCloseForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const getDefaultFormData = () => {
    const currentYear = selectedFilterYear === 'all' ? new Date().getFullYear() : Number(selectedFilterYear);
    const currentMonth = selectedFilterMonth === 'all' ? new Date().getMonth() + 1 : Number(selectedFilterMonth);
    const currentDay = new Date().getDate();
    const defaultDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    return {
      defaultDate,
      defaultCategory: selectedFilterCategory
    };
  };

  return (
    <div className="space-y-6">
      {/* Filtros Principais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <p className="text-sm text-gray-600">Filtre os dados por período e categoria</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
            <select
              value={selectedFilterYear}
              onChange={(e) => setSelectedFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {incomeCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo por Categoria e Mês */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Resumo por Categoria e Mês</h3>
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-2 hover:text-green-600 transition-colors"
                  >
                    <span>CATEGORIAS</span>
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
                    className="flex items-center space-x-2 hover:text-green-600 transition-colors ml-auto"
                  >
                    <span>TOTAL</span>
                    {getSortIcon('total')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, index) => (
                <React.Fragment key={index}>
                  {/* Category Row */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        {row.hasSubcategories && (
                          <button
                            onClick={() => toggleCategoryExpansion(row.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {expandedCategories.has(row.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        )}
                        {!row.hasSubcategories && <div className="w-6" />}
                        <span>{row.category}</span>
                      </div>
                    </td>
                    {row.monthlyTotals.map((amount, monthIndex) => (
                      <td key={monthIndex} className="py-3 px-2 text-center text-sm">
                        {amount > 0 ? (
                          <span className="text-green-600 font-medium whitespace-nowrap">
                            {formatInvestmentCurrency(amount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right font-bold text-green-600 whitespace-nowrap">
                      {formatInvestmentCurrency(row.total)}
                    </td>
                  </tr>
                  
                  {/* Subcategory Rows */}
                  {expandedCategories.has(row.id) && row.subcategories.map((subcategory, subIndex) => (
                    <tr key={`${index}-${subIndex}`} className="border-b border-gray-50 bg-gray-25 hover:bg-gray-100">
                      <td className="py-2 px-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-2 ml-8">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span>{subcategory.name}</span>
                        </div>
                      </td>
                      {subcategory.monthlyTotals.map((amount, monthIndex) => (
                        <td key={monthIndex} className="py-2 px-2 text-center text-sm">
                          {amount > 0 ? (
                            <span className="text-green-500 font-medium whitespace-nowrap">
                              {formatInvestmentCurrency(amount)}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      ))}
                      <td className="py-2 px-4 text-right font-semibold text-green-500 text-sm whitespace-nowrap">
                        {formatInvestmentCurrency(subcategory.total)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {/* Totals Row */}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                <td className="py-3 px-4 text-gray-900">Totais</td>
                {monthlyTotals.map((amount, monthIndex) => (
                  <td key={monthIndex} className="py-3 px-2 text-center text-sm">
                    {amount > 0 ? (
                      <span className="text-green-600 font-bold whitespace-nowrap">
                        {formatInvestmentCurrency(amount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
                <td className="py-3 px-4 text-right text-green-600 font-bold text-lg whitespace-nowrap">
                  {formatInvestmentCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Filtros e Transações Detalhadas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Transações Detalhadas</h3>
          <p className="text-sm text-gray-600">Lista completa das transações filtradas</p>
        </div>

        {/* Lista de Transações Filtradas */}
        <div className="space-y-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma receita encontrada
              </h4>
              <p className="text-gray-500 mb-4">
                Não há receitas para os filtros selecionados
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} receita(s) encontrada(s) - Total: {' '}
                  <span className="font-semibold text-green-600 whitespace-nowrap">
                    {formatInvestmentCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </p>
              </div>
              
              {/* Transações agrupadas por mês */}
              {groupedTransactions.map((monthGroup) => (
                <div key={monthGroup.monthKey} className="space-y-3">
                  {/* Cabeçalho do mês */}
                  <div className="flex items-center justify-between py-3 px-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-800 capitalize">
                      {monthGroup.monthLabel}
                    </h4>
                    <div className="text-right">
                      <span className="text-sm text-green-600">
                        {monthGroup.transactions.length} transação(ões)
                      </span>
                      <div className="font-bold text-green-700 whitespace-nowrap">
                        {formatInvestmentCurrency(monthGroup.total)}
                      </div>
                    </div>
                  </div>

                  {/* Tabela de Transações do mês */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            <button
                              onClick={() => handleDetailedSort('description')}
                              className="flex items-center space-x-2 w-full text-left hover:text-green-600 transition-colors"
                            >
                              <span>Descrição</span>
                              {getDetailedSortIcon('description')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            <button
                              onClick={() => handleDetailedSort('category')}
                              className="flex items-center space-x-2 w-full text-left hover:text-green-600 transition-colors"
                            >
                              <span>Categoria</span>
                              {getDetailedSortIcon('category')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            <button
                              onClick={() => handleDetailedSort('date')}
                              className="flex items-center justify-center space-x-2 w-full hover:text-green-600 transition-colors"
                            >
                              <span>Data</span>
                              {getDetailedSortIcon('date')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                            <button
                              onClick={() => handleDetailedSort('amount')}
                              className="flex items-center justify-end space-x-2 w-full hover:text-green-600 transition-colors"
                            >
                              <span>Valor</span>
                              {getDetailedSortIcon('amount')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthGroup.transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {getDisplayTitle(transaction)}
                                  </div>
                                  {transaction.observation && (
                                    <div className="text-sm text-gray-500 truncate">
                                      {transaction.observation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                {getCategoryName(transaction.category)}
                              </div>
                              {getSubCategoryName(transaction.subCategory) && (
                                <div className="text-xs text-gray-500">
                                  {getSubCategoryName(transaction.subCategory)}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-900">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-green-600 whitespace-nowrap">
                                {formatInvestmentCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleDuplicateTransaction(transaction)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Duplicar"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          type="income"
          transaction={editingTransaction}
          onClose={handleCloseForm}
          onSave={() => {}}
          {...getDefaultFormData()}
        />
      )}
    </div>
  );
};

export default IncomeAnalytics;