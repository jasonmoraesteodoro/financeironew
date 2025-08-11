// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export const generateMonths = (year: number) => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    return {
      key: `${year}-${String(i + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      fullLabel: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      value: i + 1,
      name: date.toLocaleDateString('pt-BR', { month: 'long' })
    };
  });
};

export const getAvailableYears = (transactions: any[]): number[] => {
  return [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);
};

export const groupTransactionsByMonth = (transactions: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  
  transactions.forEach(transaction => {
    const monthKey = transaction.date.slice(0, 7); // YYYY-MM format
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(transaction);
  });

  // Sort months in descending order (most recent first)
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  
  return sortedMonths.map(monthKey => ({
    monthKey,
    monthLabel: new Date(monthKey + '-15').toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase()),
    transactions: grouped[monthKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    total: grouped[monthKey].reduce((sum, t) => sum + t.amount, 0)
  }));
};