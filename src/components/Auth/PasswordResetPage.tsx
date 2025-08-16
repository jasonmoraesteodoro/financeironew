import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ResetPasswordForm from './ResetPasswordForm';

const PasswordResetPage: React.FC = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<{ accessToken?: string; refreshToken?: string }>({});
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('URL Hash:', window.location.hash);
    console.log('URL Search:', window.location.search);
    
    // Extract tokens from URL hash
    const extractTokensFromHash = () => {
      const hash = window.location.hash;
      
      if (hash.includes('type=recovery')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (accessToken && refreshToken && type === 'recovery') {
          setTokens({ accessToken, refreshToken });
          setIsValidToken(true);
          
          // Clean the URL hash for security
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      
      setLoading(false);
    };

    // Also check URL search params (query parameters)
    const extractTokensFromQuery = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        setTokens({ accessToken, refreshToken });
        setIsValidToken(true);
        
        // Clean the URL query params for security
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    extractTokensFromHash();
    extractTokensFromQuery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando link de redefinição...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in and we don't have valid tokens, redirect to dashboard
  if (user && !isValidToken) {
    window.location.href = '/';
    return null;
  }

  // If we have valid tokens, show the reset password form
  if (isValidToken) {
    return (
      <ResetPasswordForm 
        accessToken={tokens.accessToken} 
        refreshToken={tokens.refreshToken} 
      />
    );
  }

  // If no valid tokens, show error message and login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-red-600 p-4 rounded-2xl mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h1>
          <p className="text-gray-600 mb-6">
            O link de redefinição de senha é inválido ou expirou. 
            Por favor, solicite um novo link.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voltar ao Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;