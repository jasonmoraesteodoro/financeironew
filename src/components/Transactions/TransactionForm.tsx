import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction } from '../../types';
import { FileUploadField } from './FileUploadField';

interface TransactionFormProps {
  type: 'income' | 'expense';
  transaction?: Transaction;
  onClose: () => void;
  onSave: () => void;
  defaultDate?: string;
  defaultCategory?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  type, 
  transaction, 
  onClose, 
  onSave, 
  defaultDate, 
  defaultCategory 
}) => {
  const { categories, subcategories, addTransaction, updateTransaction } = useFinance();
  
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toFixed(2) || '',
    category: transaction?.category || defaultCategory || '',
    subCategory: transaction?.subCategory || '',
    date: transaction?.date || defaultDate || new Date().toISOString().split('T')[0],
    paid: transaction?.paid || false,
    received: transaction?.received || false,
    observation: transaction?.observation || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);

  const filteredCategories = categories.filter(cat => cat.type === type);
  
  // Filter subcategories based on selected category
  const filteredSubCategories = formData.category 
    ? subcategories.filter(sub => sub.parentId === formData.category)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const transactionData = {
      type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      ...(formData.subCategory && { subCategory: formData.subCategory }),
      date: formData.date,
      ...(type === 'expense' && { paid: formData.paid }),
      ...(type === 'income' && { received: formData.received }),
      ...(formData.observation && { observation: formData.observation }),
    };

    try {
      if (transaction && transaction.id) {
        await updateTransaction(transaction.id, transactionData, selectedFile, removeExistingFile);
      } else {
        await addTransaction(transactionData, selectedFile);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao salvar transação. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Reset subcategory when category changes
      if (field === 'category') {
        newData.subCategory = '';
      }

      return newData;
    });
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setRemoveExistingFile(false);
    }
  };

  const handleRemoveExisting = () => {
    setRemoveExistingFile(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {transaction ? 'Editar' : 'Nova'} {type === 'income' ? 'Receita' : 'Despesa'}
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
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {formData.category && filteredSubCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoria
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma subcategoria (opcional)</option>
                {filteredSubCategories.map(subCategory => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
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
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>

          <FileUploadField
            file={selectedFile}
            existingFileUrl={!removeExistingFile ? transaction?.attachmentUrl : undefined}
            onFileSelect={handleFileSelect}
            onRemoveExisting={handleRemoveExisting}
          />

          {type === 'expense' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="paid"
                checked={formData.paid}
                onChange={(e) => handleInputChange('paid', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="paid" className="ml-2 text-sm text-gray-700">
                Já foi pago
              </label>
            </div>
          )}

          {type === 'income' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="received"
                checked={formData.received}
                onChange={(e) => handleInputChange('received', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="received" className="ml-2 text-sm text-gray-700">
                Já foi recebido
              </label>
            </div>
          )}

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
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                type === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;