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

  useEffect(() => {
    // Verificar se existe token no localStorage ao carregar a aplicação
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = localStorage.getItem('odonto-token');
      const storedUser = localStorage.getItem('odonto-user');
      
      if (storedToken && storedUser) {
        // Verificar se o token ainda é válido
        const response = await apiService.verifyToken();
        if (response.data.valid) {
          setUser(JSON.parse(storedUser));
        } else {
          // Token inválido, limpar dados
          clearAuthData();
        }
      }
    } catch (error) {
      // Token inválido ou erro na verificação, limpar dados
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
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
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
