import axios from 'axios';

// Detecta se está rodando em servidor unified ou separado
const isUnifiedMode = () => {
  return window.location.port === '3003' || 
         window.location.port === '3002' || 
         import.meta.env.VITE_UNIFIED_MODE === 'true';
};

// URL base da API - detecção inteligente entre modo unified e split
const API_BASE_URL = isUnifiedMode() 
  ? '' // URLs relativas no modo unified
  : (import.meta.env.VITE_API_URL || 'http://localhost:3003'); // URLs fixas no modo split

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('odonto-app-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se token expirado ou inválido, limpar localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('odonto-app-token');
      localStorage.removeItem('odonto-app-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções específicas da API
export const apiService = {
  // Status da API
  getStatus: () => api.get('/api/status'),
  
  // Autenticação
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  verifyToken: () => api.get('/api/auth/verify'),
  getProfile: () => api.get('/api/auth/profile'),
  
  // Pacientes
  getPatients: (params) => api.get('/api/patients', { params }),
  getPatientById: (id) => api.get(`/api/patients/${id}`),
  createPatient: (patientData) => api.post('/api/patients', patientData),
  updatePatient: (id, patientData) => api.put(`/api/patients/${id}`, patientData),
  togglePatientStatus: (id) => api.patch(`/api/patients/${id}/toggle-status`),
  searchPatients: (params) => api.get('/api/patients/search', { params }),
  getPatientsStats: () => api.get('/api/patients/stats'),
  
  // Futuras funcionalidades (consultas, agendamentos, etc.)
};

export default api;











