import React, { useState } from 'react';
import { User, Tag, Lock, Banknote } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import CategorySettings from './CategorySettings';
import PasswordSettings from './PasswordSettings';
import BankAccountsSettings from './BankAccountsSettings';

interface SettingsProps {
  initialTab?: string;
}

const Settings: React.FC<SettingsProps> = ({ initialTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'bank-accounts', label: 'Contas Bancárias', icon: Banknote },
    { id: 'password', label: 'Senha', icon: Lock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'categories':
        return <CategorySettings />;
      case 'bank-accounts':
        return <BankAccountsSettings />;
      case 'password':
        return <PasswordSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie suas configurações de conta e preferências
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Settings;