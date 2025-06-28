import axios from 'axios';

// URL base da API - em desenvolvimento usa localhost, em produção usa a URL do Railway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://odonto-app-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('odonto-token');
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
      localStorage.removeItem('odonto-token');
      localStorage.removeItem('odonto-user');
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
  
  // Futuras funcionalidades (pacientes, consultas, etc.)
  // getPatients: () => api.get('/api/patients'),
  // createPatient: (patientData) => api.post('/api/patients', patientData),
  // updatePatient: (id, patientData) => api.put(`/api/patients/${id}`, patientData),
  // deletePatient: (id) => api.delete(`/api/patients/${id}`),
};

export default api;
