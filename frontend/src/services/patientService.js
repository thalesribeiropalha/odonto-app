import api from './api';

// Obter lista de pacientes com filtros e paginação
export const getPatients = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.active !== undefined) params.append('active', filters.active);

    const response = await api.get(`/patients?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    throw error.response?.data || { message: 'Erro ao buscar pacientes' };
  }
};

// Obter paciente por ID
export const getPatientById = async (id) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    throw error.response?.data || { message: 'Erro ao buscar paciente' };
  }
};

// Criar novo paciente
export const createPatient = async (patientData) => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    throw error.response?.data || { message: 'Erro ao criar paciente' };
  }
};

// Atualizar paciente
export const updatePatient = async (id, patientData) => {
  try {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    throw error.response?.data || { message: 'Erro ao atualizar paciente' };
  }
};

// Alternar status do paciente (ativo/inativo)
export const togglePatientStatus = async (id) => {
  try {
    const response = await api.patch(`/patients/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar status do paciente:', error);
    throw error.response?.data || { message: 'Erro ao alterar status' };
  }
};

// Buscar pacientes (para autocomplete)
export const searchPatients = async (query, limit = 10) => {
  try {
    const response = await api.get(`/patients/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erro na busca de pacientes:', error);
    throw error.response?.data || { message: 'Erro na busca' };
  }
};

// Obter estatísticas de pacientes
export const getPatientsStats = async () => {
  try {
    const response = await api.get('/patients/stats');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error.response?.data || { message: 'Erro ao obter estatísticas' };
  }
};

// Funções de utilidade

// Formatar CPF
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  const numericCPF = cpf.replace(/\D/g, '');
  return numericCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Remover formatação do CPF
export const unformatCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
};

// Formatar telefone
export const formatPhone = (phone) => {
  if (!phone) return '';
  const numericPhone = phone.replace(/\D/g, '');
  
  if (numericPhone.length === 11) {
    return numericPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numericPhone.length === 10) {
    return numericPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

// Remover formatação do telefone
export const unformatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

// Formatar CEP
export const formatCEP = (cep) => {
  if (!cep) return '';
  const numericCEP = cep.replace(/\D/g, '');
  return numericCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Remover formatação do CEP
export const unformatCEP = (cep) => {
  if (!cep) return '';
  return cep.replace(/\D/g, '');
};

// Calcular idade
export const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Obter nome de exibição do gênero
export const getGenderDisplayName = (gender) => {
  const genderMap = {
    'masculino': 'Masculino',
    'feminino': 'Feminino',
    'outro': 'Outro'
  };
  
  return genderMap[gender] || gender;
};

// Obter cor do status
export const getStatusColor = (isActive) => {
  return isActive ? '#28a745' : '#dc3545';
};

// Obter nome de exibição do status
export const getStatusDisplayName = (isActive) => {
  return isActive ? 'Ativo' : 'Inativo';
};

// Validar CPF
export const isValidCPF = (cpf) => {
  const numericCPF = unformatCPF(cpf);
  
  if (numericCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(numericCPF)) return false; // Verifica sequências iguais
  
  // Validação do algoritmo do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCPF.charAt(10))) return false;
  
  return true;
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar telefone
export const isValidPhone = (phone) => {
  const numericPhone = unformatPhone(phone);
  return numericPhone.length >= 10 && numericPhone.length <= 11;
};

// Exportação padrão com todas as funções
export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  togglePatientStatus,
  searchPatients,
  getPatientsStats,
  formatCPF,
  unformatCPF,
  formatPhone,
  unformatPhone,
  formatCEP,
  unformatCEP,
  calculateAge,
  getGenderDisplayName,
  getStatusColor,
  getStatusDisplayName,
  isValidCPF,
  isValidEmail,
  isValidPhone
};

