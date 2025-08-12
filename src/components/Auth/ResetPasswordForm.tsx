import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordForm: React.FC = () => {
  const { updateUserPassword, session } = useAuth();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setMessage({ 
        type: 'error', 
        text: 'Sessão de autenticação ausente! O link de redefinição pode ter expirado ou ser inválido. Por favor, solicite um novo link de redefinição de senha.' 
      });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await updateUserPassword(formData.newPassword);
      
      if (error) {
        setMessage({ type: 'error', text: error });
      } else {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso! Você será redirecionado em instantes.' });
        // Clear form
        setFormData({ newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Redefinir Senha</h1>
          <p className="text-gray-600 mt-2">Digite sua nova senha abaixo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                <span>{message.text}</span>
              </div>
              {message.type === 'error' && message.text.includes('Sessão de autenticação ausente') && (
                <div className="mt-3">
                  <a 
                    href="/" 
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Voltar para a tela de login e solicitar novo link
                  </a>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Digite sua nova senha"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Confirme sua nova senha"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Dicas de Segurança:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use pelo menos 8 caracteres</li>
              <li>• Combine letras maiúsculas, minúsculas, números e símbolos</li>
              <li>• Não use informações pessoais óbvias</li>
              <li>• Não reutilize senhas de outras contas</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Alterando Senha...' : 'Alterar Senha'}
          </button>
        </form>
        
        {/* Help Section */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Problemas com a redefinição?</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Certifique-se de usar o link mais recente do email</li>
            <li>• O link de redefinição expira após algumas horas</li>
            <li>• Verifique se você está acessando o link no mesmo navegador</li>
            <li>• Certifique-se de que as URLs estão configuradas no Supabase</li>
          </ul>
          <div className="mt-3">
            <a 
              href="/" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Solicitar novo link de redefinição
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;