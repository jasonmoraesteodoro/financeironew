import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Category, SubCategory } from '../../types';

interface SubCategoryFormProps {
  parentCategory: Category;
  subCategory?: SubCategory | null;
  onClose: () => void;
  onSave: () => void;
}

const SubCategoryForm: React.FC<SubCategoryFormProps> = ({ 
  parentCategory, 
  subCategory, 
  onClose, 
  onSave 
}) => {
  const { addSubCategory, updateSubCategory } = useFinance();
  
  const [formData, setFormData] = useState({
    name: subCategory?.name || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (subCategory) {
        await updateSubCategory(subCategory.id, {
          ...formData,
        });
      } else {
        await addSubCategory({
          ...formData,
          parentId: parentCategory.id,
          type: parentCategory.type,
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving subcategory:', error);
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
            {subCategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: parentCategory.color }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Categoria: {parentCategory.name}
                </p>
                <p className="text-xs text-gray-500">
                  {parentCategory.type === 'income' ? 'Receita' : 'Despesa'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Subcategoria
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Ex: ${parentCategory.name === 'Moradia' ? 'Aluguel, Água, Luz' : 'Subcategoria'}`}
              required
            />
          </div>

          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: parentCategory.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {parentCategory.name} → {formData.name || 'Nome da subcategoria'}
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
              {isLoading ? 'Salvando...' : (subCategory ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategoryForm;