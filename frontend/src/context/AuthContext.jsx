import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DADOS FIXOS PARA DESENVOLVIMENTO - DRA. LARISSA
  const FIXED_USER_DATA = {
    id: "13cb3351-cc5f-4a24-9220-6b922e2fac7e",
    name: "Dra Larissa Rufino",
    email: "dralarissarufino@gmail.com",
    role: "dentist",
    organization_id: "fc380e62-de4e-495d-9914-d5fbb5447058",
    permissions: ["patients.read", "patients.create", "patients.update", "patients.delete"],
    is_active: true,
    profile: {
      cro: "CRO-SP 123456",
      specialty: "Ortodontia • Cirurgia • Estética"
    }
  };

  useEffect(() => {
    // Verificar se existe token no localStorage ao carregar a aplicação
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = localStorage.getItem('odonto-token');
      const storedUser = localStorage.getItem('odonto-user');
      
      if (storedToken && storedUser) {
        // VERIFICAR SE É TOKEN FIXO DE DESENVOLVIMENTO
        if (storedToken.startsWith('FIXED_TOKEN_LARISSA_DEV_')) {
          // TOKEN FIXO SEMPRE VÁLIDO
          console.log('🔓 Modo desenvolvimento: Token fixo detectado');
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }
        
        // VERIFICAÇÃO NORMAL DE TOKEN PARA PRODUÇÃO
        try {
          const response = await apiService.verifyToken();
          if (response.data.valid) {
            setUser(JSON.parse(storedUser));
          } else {
            clearAuthData();
          }
        } catch (apiError) {
          // Se API falhar, mas token existe, tentar manter sessão
          console.warn('API indisponível, mantendo sessão local:', apiError);
          const userData = JSON.parse(storedUser);
          if (userData && userData.email) {
            setUser(userData);
          } else {
            clearAuthData();
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao verificar estado de auth:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('odonto-token');
    localStorage.removeItem('odonto-user');
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(email, password);
      const { token, ...userData } = response.data;
      
      // Salvar dados no localStorage
      localStorage.setItem('odonto-token', token);
      localStorage.setItem('odonto-user', JSON.stringify(userData));
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      // Capturar mensagens específicas do backend
      let errorMessage = 'Erro ao fazer login';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.register(userData);
      const { token, ...userInfo } = response.data;
      
      // Salvar dados no localStorage
      localStorage.setItem('odonto-token', token);
      localStorage.setItem('odonto-user', JSON.stringify(userInfo));
      
      setUser(userInfo);
      
      return { success: true, user: userInfo };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.updateProfile(profileData);
      const updatedUser = response.data;
      
      // Atualizar dados no localStorage
      localStorage.setItem('odonto-user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;




