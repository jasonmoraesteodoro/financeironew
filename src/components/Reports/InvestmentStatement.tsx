import React from 'react';
import { Banknote } from 'lucide-react';
import { MonthlyReport, BankAccount } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface InvestmentStatementProps {
  monthlyReport: MonthlyReport;
  bankAccounts: BankAccount[];
}

const InvestmentStatement: React.FC<InvestmentStatementProps> = ({ monthlyReport, bankAccounts }) => {
  const getBankColor = (bankName: string) => {
    // Generate a consistent color based on bank name
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    let hash = 0;
    for (let i = 0; i < bankName.length; i++) {
      hash = bankName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderInvestmentBars = (data: { [bankName: string]: number }) => {
    const entries = Object.entries(data);
    const maxAmount = Math.max(...entries.map(([, amount]) => amount));
    
    if (entries.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhum investimento registrado
        </div>
      );
    }

    return entries
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
      .map(([bankName, amount]) => {
        const bankAccount = bankAccounts.find(b => b.bankName === bankName);
        const accountNumber = bankAccount ? `****${bankAccount.accountNumber.slice(-4)}` : '';
        
        return (
          <div key={bankName} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <div>
                <span className="text-sm font-medium text-gray-700">{bankName}</span>
                {accountNumber && (
                  <span className="text-xs text-gray-500 ml-2">{accountNumber}</span>
                )}
              </div>
              <span className="text-sm text-gray-900">{formatCurrency(amount)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(amount / maxAmount) * 100}%`,
                  backgroundColor: getBankColor(bankName),
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
        <h3 className="text-lg font-semibold text-gray-900">Demonstrativo de Investimentos</h3>
        <Banknote className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Total Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Total Investido no Período</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(monthlyReport.totalInvestments)}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <Banknote className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Investments by Bank */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <h4 className="font-semibold text-blue-700">Investimentos por Conta Bancária</h4>
          </div>
          {renderInvestmentBars(monthlyReport.investmentsByBank)}
          
          {monthlyReport.totalInvestments > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total de Investimentos:</span>
                <span className="font-bold text-blue-600">{formatCurrency(monthlyReport.totalInvestments)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Investment Performance Indicator */}
        {monthlyReport.totalInvestments > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">Percentual do Saldo Investido:</span>
                <p className="text-xs text-gray-500 mt-1">
                  Baseado na diferença entre receitas e despesas
                </p>
              </div>
              <div className="text-right">
                {monthlyReport.balance > 0 ? (
                  <span className="text-lg font-bold text-blue-600">
                    {((monthlyReport.totalInvestments / monthlyReport.balance) * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">N/A</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentStatement;