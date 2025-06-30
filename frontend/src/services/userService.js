import api from './api';

// Dados mockados para demonstração
const mockUsers = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao.silva@clinica.com',
    role: 'dentista',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-12-29T08:30:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@clinica.com',
    role: 'secretaria',
    isActive: true,
    createdAt: '2024-02-20T14:20:00Z',
    lastLogin: '2024-12-28T16:45:00Z'
  },
  {
    id: '3',
    name: 'Admin Sistema',
    email: 'admin@clinica.com',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-12-29T09:15:00Z'
  },
  {
    id: '4',
    name: 'Dra. Ana Costa',
    email: 'ana.costa@clinica.com',
    role: 'dentista',
    isActive: false,
    createdAt: '2024-03-10T11:30:00Z',
    lastLogin: '2024-11-15T14:20:00Z'
  },
  {
    id: '5',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@clinica.com',
    role: 'secretaria',
    isActive: true,
    createdAt: '2024-04-05T12:15:00Z',
    lastLogin: '2024-12-27T10:30:00Z'
  }
];

// Buscar todos os usuários com filtros
export const getUsers = async (filters = {}) => {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredUsers = [...mockUsers];
    
    // Aplicar filtros
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }
    
    return {
      success: true,
      total: filteredUsers.length,
      users: filteredUsers
    };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

// Buscar usuário específico
export const getUserById = async (id) => {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

// Atualizar usuário
export const updateUser = async (id, userData) => {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }
    
    // Verificar se email já existe (exceto para o próprio usuário)
    const existingUser = mockUsers.find(u => 
      u.email.toLowerCase() === userData.email.toLowerCase() && u.id !== id
    );
    
    if (existingUser) {
      throw new Error('Este email já está sendo usado por outro usuário');
    }
    
    // Atualizar usuário mockado
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role,
      isActive: userData.isActive !== undefined ? userData.isActive : true
    };
    
    return {
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: mockUsers[userIndex]
    };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

// Ativar/desativar usuário
export const toggleUserStatus = async (id) => {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }
    
    mockUsers[userIndex].isActive = !mockUsers[userIndex].isActive;
    const user = mockUsers[userIndex];
    
    return {
      success: true,
      message: `Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso`,
      user
    };
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    throw error;
  }
};

// Mapear roles para exibição
export const getRoleDisplayName = (role) => {
  const roleMap = {
    admin: 'Administrador',
    dentista: 'Dentista',
    secretaria: 'Secretária'
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
export const validateUserData = (userData) => {
  const errors = {};
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }
  
  if (!userData.email || !validateEmail(userData.email)) {
    errors.email = 'Email inválido';
  }
  
  if (!userData.role || !['admin', 'dentista', 'secretaria'].includes(userData.role)) {
    errors.role = 'Função inválida';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  getRoleDisplayName,
  getStatusDisplayName,
  getStatusColor,
  validateEmail,
  validateUserData
};
