import api from './api';

// Obter dados da organização atual (para owners)
export const getMyOrganization = async () => {
  try {
    const response = await api.get('/api/organizations/my');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    throw error;
  }
};

// Listar todas as organizações (apenas para admins)
export const getAllOrganizations = async () => {
  try {
    const response = await api.get('/api/organizations');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    throw error;
  }
};

// Criar nova organização (apenas para admins)
export const createOrganization = async (organizationData) => {
  try {
    const response = await api.post('/api/organizations', organizationData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    throw error;
  }
};

// Atualizar organização
export const updateOrganization = async (id, organizationData) => {
  try {
    const response = await api.put(`/api/organizations/${id}`, organizationData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    throw error;
  }
};

// Deletar organização (apenas para admins)
export const deleteOrganization = async (id) => {
  try {
    const response = await api.delete(`/api/organizations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar organização:', error);
    throw error;
  }
};

// Ativar/Desativar organização
export const toggleOrganizationStatus = async (id) => {
  try {
    const response = await api.patch(`/api/organizations/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar status da organização:', error);
    throw error;
  }
};

// Obter estatísticas da organização
export const getOrganizationStats = async (id = null) => {
  try {
    const url = id ? `/api/organizations/${id}/stats` : '/api/organizations/my/stats';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas da organização:', error);
    throw error;
  }
};

// Atualizar plano da organização
export const updateOrganizationPlan = async (id, planData) => {
  try {
    const response = await api.patch(`/api/organizations/${id}/plan`, planData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar plano da organização:', error);
    throw error;
  }
};

// Helpers para exibição
export const getPlanDisplayName = (plan) => {
  const plans = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise'
  };
  return plans[plan] || plan;
};

export const getPlanColor = (plan) => {
  const colors = {
    starter: '#28a745',
    professional: '#007bff',
    enterprise: '#6f42c1'
  };
  return colors[plan] || '#6c757d';
};

export const getStatusColor = (isActive) => {
  return isActive ? '#28a745' : '#dc3545';
};

export const getStatusDisplayName = (isActive) => {
  return isActive ? 'Ativo' : 'Inativo';
};
