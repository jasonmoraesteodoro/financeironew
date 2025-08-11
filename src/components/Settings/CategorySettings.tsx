import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Category, SubCategory } from '../../types';
import CategoryForm from './CategoryForm';
import SubCategoryForm from './SubCategoryForm';

const CategorySettings: React.FC = () => {
  const { categories, subcategories, deleteCategory, deleteSubCategory } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');

  const filteredCategories = categories.filter(cat => cat.type === activeTab);
  
  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter(sub => sub.parentId === categoryId);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    const parentCategory = categories.find(cat => cat.id === subCategory.parentId);
    if (parentCategory) {
      setSelectedParentCategory(parentCategory);
      setEditingSubCategory(subCategory);
      setShowSubCategoryForm(true);
    }
  };

  const handleAddSubCategory = (parentCategory: Category) => {
    setSelectedParentCategory(parentCategory);
    setEditingSubCategory(null);
    setShowSubCategoryForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Todas as transações associadas também serão removidas.')) {
      deleteCategory(id);
    }
  };

  const handleDeleteSubCategory = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta subcategoria?')) {
      deleteSubCategory(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleCloseSubCategoryForm = () => {
    setShowSubCategoryForm(false);
    setEditingSubCategory(null);
    setSelectedParentCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gerenciar Categorias</h3>
            <p className="text-sm text-gray-600 mt-1">
              Organize suas receitas e despesas por categorias personalizadas
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'income'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tag className="w-4 h-4 mr-2" />
            Receitas
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'expense'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tag className="w-4 h-4 mr-2" />
            Despesas
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Nenhuma categoria de {activeTab === 'income' ? 'receita' : 'despesa'} encontrada
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Categoria
              </button>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg">
                {/* Category Header */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500">
                        {category.type === 'income' ? 'Receita' : 'Despesa'} • {' '}
                        {getSubcategoriesForCategory(category.id).length} subcategoria(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddSubCategory(category)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Adicionar Subcategoria"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar Categoria"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {getSubcategoriesForCategory(category.id).length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500 mb-3">
                          Nenhuma subcategoria criada
                        </p>
                        <button
                          onClick={() => handleAddSubCategory(category)}
                          className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Primeira Subcategoria
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {getSubcategoriesForCategory(category.id).map((subCategory) => (
                          <div
                            key={subCategory.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors ml-6"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                              <div>
                                <h5 className="font-medium text-gray-800">{subCategory.name}</h5>
                                <p className="text-xs text-gray-500">
                                  Subcategoria de {category.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditSubCategory(subCategory)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar Subcategoria"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubCategory(subCategory.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir Subcategoria"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          defaultType={activeTab}
          onClose={handleCloseForm}
          onSave={() => {}}
        />
      )}

      {/* SubCategory Form Modal */}
      {showSubCategoryForm && selectedParentCategory && (
        <SubCategoryForm
          parentCategory={selectedParentCategory}
          subCategory={editingSubCategory}
          onClose={handleCloseSubCategoryForm}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default CategorySettings;