import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Category } from '../../types';

interface CategoryFormProps {
  category?: Category | null;
  defaultType?: 'income' | 'expense';
  onClose: () => void;
  onSave: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, defaultType = 'expense', onClose, onSave }) => {
  const { addCategory, updateCategory } = useFinance();
  
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || defaultType as 'income' | 'expense',
    color: category?.color || (category?.type === 'income' ? '#10B981' : '#EF4444'),
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (category) {
        await updateCategory(category.id, {
          ...formData,
          color: formData.type === 'income' ? '#10B981' : '#EF4444'
        });
      } else {
        await addCategory({
          ...formData,
          color: formData.type === 'income' ? '#10B981' : '#EF4444'
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
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
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Categoria
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Alimentação, Salário..."
              required
            />
          </div>

          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: formData.type === 'income' ? '#10B981' : '#EF4444' }}
              />
              <span className="text-sm font-medium text-gray-700">
                {formData.name || 'Nome da categoria'} - {formData.type === 'income' ? 'Receita' : 'Despesa'}
              </span>
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
              {isLoading ? 'Salvando...' : (category ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;