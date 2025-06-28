import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });

  const { login, register, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se já está autenticado, redirecionar para dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Limpar erros quando componente desmonta ou muda de aba
    return () => clearError();
  }, [clearError, showRegister]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showRegister) {
      setRegisterData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    // Validações básicas
    if (registerData.password !== registerData.confirmPassword) {
      alert('Senhas não coincidem!');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      alert('Senha deve ter pelo menos 6 caracteres!');
      setIsLoading(false);
      return;
    }

    const { confirmPassword, ...dataToSend } = registerData;
    const result = await register(dataToSend);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const toggleMode = () => {
    setShowRegister(!showRegister);
    clearError();
    setFormData({ email: '', password: '' });
    setRegisterData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin'
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h1 className="auth-title">
            🦷 Odonto App
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            {showRegister ? 'Criar nova conta' : 'Faça login para continuar'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!showRegister ? (
          // Formulário de Login
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="text-center">
              <p style={{ color: '#6b7280' }}>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  style={{ 
                    color: 'var(--primary-color)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Criar conta
                </button>
              </p>
            </div>
          </form>
        ) : (
          // Formulário de Registro
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nome Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={registerData.name}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerData.email}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Função</label>
              <select
                id="role"
                name="role"
                value={registerData.role}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="admin">Administrador</option>
                <option value="dentista">Dentista</option>
                <option value="secretaria">Secretária</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerData.password}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>

            <div className="text-center">
              <p style={{ color: '#6b7280' }}>
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  style={{ 
                    color: 'var(--primary-color)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Fazer login
                </button>
              </p>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <Link 
            to="/" 
            style={{ 
              color: '#6b7280', 
              textDecoration: 'none', 
              fontSize: '0.875rem' 
            }}
          >
            ← Voltar ao teste de conexão
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
