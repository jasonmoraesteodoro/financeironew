import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: { name?: string }) => Promise<{ error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<{ error?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Traduzir mensagens de erro comuns para português
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
        }
        return { error: errorMessage };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao fazer login' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        // Traduzir mensagens de erro comuns para português
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido. Verifique o formato do email.';
        }
        return { error: errorMessage };
      }

      // Se o usuário não foi logado automaticamente, significa que precisa confirmar o e-mail
      if (!data.session && data.user && !data.user.email_confirmed_at) {
        return { needsConfirmation: true };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao criar conta' };
    }
  };

  const signOut = async () => {
    try {
      // Sempre limpar o estado local primeiro
      setSession(null);
      setUser(null);
      
      // Tentar fazer logout no servidor (pode falhar se a sessão já expirou)
      await supabase.auth.signOut();
    } catch (error) {
      // Ignorar erros de logout no servidor - o usuário já foi deslogado localmente
      console.log('Logout completed locally');
    }
  };

  const updateProfile = async (userData: { name?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: userData,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Erro ao atualizar perfil' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!user) {
        return false;
      }

      // Primeiro, reautentica o usuário para validar a senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        console.error('Error validating current password:', signInError);
        return false;
      }

      // Se a reautenticação foi bem-sucedida, atualiza a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error changing password:', error);
      return false;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      // Redirect to specific recovery page
      const redirectTo = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('User not found')) {
          errorMessage = 'Email não encontrado. Verifique se o email está correto.';
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        }
        return { error: errorMessage };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao enviar email de redefinição' };
    }
  };

  const updateUserPassword = async (newPassword: string, accessToken?: string, refreshToken?: string) => {
    try {
      // If tokens are provided, set the session first
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (sessionError) {
          return { error: 'Token de redefinição inválido ou expirado' };
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }
        return { error: errorMessage };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado ao atualizar senha' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      changePassword,
      sendPasswordResetEmail,
      updateUserPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};