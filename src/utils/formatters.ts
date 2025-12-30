// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatInvestmentCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  // Parse the date string directly to avoid timezone issues
  const [year, month, day] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
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
  return [...new Set(transactions.map(t => parseInt(t.date.substring(0, 4))))].sort((a, b) => b - a);
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

  return sortedMonths.map(monthKey => {
    // Parse year and month directly from the key to avoid timezone issues
    const [year, month] = monthKey.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1, 15); // Use day 15 to avoid edge cases

    return {
      monthKey,
      monthLabel: monthDate.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      }),
      transactions: grouped[monthKey],
      total: grouped[monthKey].reduce((sum, t) => sum + t.amount, 0)
    };
  });
};