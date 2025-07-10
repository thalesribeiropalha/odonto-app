import api from './api';

// Buscar todos os usuários com filtros
export const getUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.role && filters.role !== 'all') {
      params.append('role', filters.role);
    }
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    const response = await api.get(`/api/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

// Buscar usuário específico
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

// Criar novo usuário
export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

// Atualizar usuário
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

// Deletar usuário
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

// Ativar/desativar usuário
export const toggleUserStatus = async (id, currentStatus) => {
  try {
    const response = await api.put(`/api/users/${id}`, {
      isActive: !currentStatus
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    throw error;
  }
};

// Obter estatísticas de usuários
export const getUserStats = async () => {
  try {
    const response = await api.get('/api/users/stats');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas de usuários:', error);
    throw error;
  }
};

// Mapear roles para exibição
export const getRoleDisplayName = (role) => {
  const roleMap = {
    admin: 'Administrador',
    dentist: 'Dentista',
    secretary: 'Secretária',
    owner: 'Proprietário'
  };
  return roleMap[role] || role;
};

// Mapear status para exibição
export const getStatusDisplayName = (isActive) => {
  return isActive ? 'Ativo' : 'Inativo';
};

// Obter cor do status
export const getStatusColor = (isActive) => {
  return isActive ? '#28a745' : '#dc3545';
};

// Validar email
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar dados do usuário
export const validateUserData = (userData, isCreating = false) => {
  const errors = {};
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }
  
  if (!userData.email || !validateEmail(userData.email)) {
    errors.email = 'Email inválido';
  }
  
  if (!userData.role || !['admin', 'dentist', 'secretary', 'owner'].includes(userData.role)) {
    errors.role = 'Função inválida';
  }
  
  if (isCreating && (!userData.password || userData.password.length < 6)) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  getRoleDisplayName,
  getStatusDisplayName,
  getStatusColor,
  validateEmail,
  validateUserData
};
