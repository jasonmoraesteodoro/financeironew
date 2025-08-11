import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard, Banknote } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { BankAccount } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import BankAccountForm from './BankAccountForm';

const BankAccountsSettings: React.FC = () => {
  const { bankAccounts, deleteBankAccount } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      deleteBankAccount(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      credit_card: 'Cartão de Crédito',
      investment: 'Investimento'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Banknote className="w-5 h-5" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'savings':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'credit_card':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'investment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contas Bancárias</h3>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie suas contas bancárias e cartões de crédito
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </button>
        </div>

        {/* Bank Accounts List */}
        <div className="space-y-4">
          {bankAccounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Banknote className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma conta cadastrada
              </h4>
              <p className="text-gray-500 mb-4">
                Adicione suas contas bancárias para melhor controle financeiro
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Conta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getAccountTypeIcon(account.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{account.bankName}</h4>
                        <p className="text-sm text-gray-500">
                          ****{account.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Conta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Conta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAccountTypeColor(account.type)}`}>
                        {getAccountTypeLabel(account.type)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bank Account Form Modal */}
      {showForm && (
        <BankAccountForm
          account={editingAccount}
          onClose={handleCloseForm}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default BankAccountsSettings;