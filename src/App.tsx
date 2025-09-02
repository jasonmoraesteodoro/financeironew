import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import LoginForm from './components/Auth/LoginForm';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import InvestmentList from './components/Investments/InvestmentList';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';

// Componente para rotas protegidas (requer autenticação)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redireciona para a página de login, mas salva a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Componente para rotas de autenticação (login, cadastro, recuperação de senha)
const AuthRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário já estiver autenticado, redireciona para a página inicial
  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'income':
        return 'Receitas';
      case 'expenses':
        return 'Despesas';
      case 'investments':
        return 'Investimentos';
      case 'reports':
        return 'Relatórios';
      case 'settings':
        return 'Configurações';
      default:
        return 'My Finance';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={(tab, settingsSubTab) => {
              setActiveTab(tab);
              if (settingsSubTab) {
                setSettingsTab(settingsSubTab);
              }
            }} 
          />
        );
      case 'income':
        return <TransactionList type="income" />;
      case 'expenses':
        return <TransactionList type="expense" />;
      case 'investments':
        return <InvestmentList />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings initialTab={settingsTab} />;
      default:
        return <Navigate to="/" replace />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Mobile Sidebar Overlay */}
          {showMobileMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
              <div className="w-64 h-full bg-white">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isMobile={true}
                  onClose={() => setShowMobileMenu(false)}
                />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="fixed h-full w-64">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-64">
            <Header
              title={getTabTitle()}
              showMobileMenu={showMobileMenu}
              setShowMobileMenu={setShowMobileMenu}
            />
            
            <main className="p-4 lg:p-6 max-w-none pr-4 lg:pr-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <FinanceProvider>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<AuthRoutes />} />
            <Route path="/forgot-password" element={<AuthRoutes />} />
            <Route path="/reset-password" element={<AuthRoutes />} />
            <Route path="*" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
          </Routes>
        </FinanceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;