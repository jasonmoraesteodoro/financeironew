import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction } from '../../types';

interface InvestmentFormProps {
  transaction?: Transaction;
  onClose: () => void;
  onSave: () => void;
  defaultDate?: string;
  defaultBankAccount?: string;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ 
  transaction, 
  onClose, 
  onSave, 
  defaultDate, 
  defaultBankAccount 
}) => {
  const { bankAccounts, categories, addTransaction, updateTransaction } = useFinance();
  
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    bankAccount: transaction?.bankAccount || defaultBankAccount || '',
    date: transaction?.date || defaultDate || new Date().toISOString().split('T')[0],
    observation: transaction?.observation || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Find a suitable category for investments
    let categoryId: string;
    const investmentCategory = categories.find(c => c.name === 'Investimentos' && c.type === 'income');
    if (investmentCategory) {
      categoryId = investmentCategory.id;
    } else {
      // Use the first available income category
      const firstIncomeCategory = categories.find(c => c.type === 'income');
      if (firstIncomeCategory) {
        categoryId = firstIncomeCategory.id;
      } else {
        alert('Nenhuma categoria de receita encontrada. Por favor, crie uma categoria de receita primeiro.');
        setIsLoading(false);
        return;
      }
    }

    const transactionData = {
      type: 'investment' as const,
      amount: parseFloat(formData.amount),
      category: categoryId,
      bankAccount: formData.bankAccount,
      date: formData.date,
      ...(formData.observation && { observation: formData.observation }),
    };

    try {
      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving investment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {transaction ? 'Editar' : 'Novo'} Investimento
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conta Bancária *
            </label>
            <select
              value={formData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma conta</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - ****{account.accountNumber.slice(-4)}
                </option>
              ))}
            </select>
            {bankAccounts.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Você precisa cadastrar pelo menos uma conta bancária nas configurações.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Investido (sem centavos)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="number"
                step="1"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data do Investimento
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observação
            </label>
            <textarea
              value={formData.observation}
              onChange={(e) => handleInputChange('observation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ex: CDB, Tesouro Direto, Ações, etc."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || bankAccounts.length === 0}
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              {isLoading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentForm;