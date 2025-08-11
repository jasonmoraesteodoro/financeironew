import React, { useState } from 'react';
import { X, Save, Banknote } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { BankAccount } from '../../types';

interface BankAccountFormProps {
  account?: BankAccount | null;
  onClose: () => void;
  onSave: () => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ account, onClose, onSave }) => {
  const { addBankAccount, updateBankAccount } = useFinance();
  
  const [formData, setFormData] = useState({
    bankName: account?.bankName || '',
    accountNumber: account?.accountNumber || '',
    type: account?.type || 'checking' as 'checking' | 'savings' | 'credit_card' | 'investment',
  });

  const [isLoading, setIsLoading] = useState(false);

  const accountTypes = [
    { value: 'checking', label: 'Conta Corrente' },
    { value: 'savings', label: 'Poupança' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'investment', label: 'Investimento' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const accountData = {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        type: formData.type,
      };

      if (account) {
        await updateBankAccount(account.id, accountData);
      } else {
        await addBankAccount(accountData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving bank account:', error);
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
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Banknote className="w-5 h-5 mr-2 text-blue-600" />
            {account ? 'Editar Conta' : 'Nova Conta Bancária'}
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
              Nome do Banco
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Banco do Brasil, Itaú, Nubank..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número da Conta
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 12345-6, **** 1234..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Você pode usar apenas os últimos dígitos por segurança
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conta
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prévia:</h4>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Banknote className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {formData.bankName || 'Nome do Banco'}
                </p>
                <p className="text-sm text-gray-500">
                  {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : '****0000'} • {' '}
                  {accountTypes.find(t => t.value === formData.type)?.label}
                </p>
              </div>
            </div>
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
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : (account ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountForm;