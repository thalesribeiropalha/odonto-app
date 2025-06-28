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
  const [debugInfo, setDebugInfo] = useState('');

  const { login, register, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se já está autenticado, redirecionar para dashboard
    if (isAuthenticated) {
      setDebugInfo('✅ Usuário já autenticado, redirecionando...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Limpar erros quando componente desmonta ou muda de aba
    return () => clearError();
  }, [clearError, showRegister]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limpar debug info apenas quando usuário começar a digitar após um erro
    if (debugInfo.includes('❌')) {
      setDebugInfo('');
    }
    
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
    setDebugInfo('🔄 Tentando fazer login...');
    clearError();

    console.log('Dados do login:', formData);

    // Modo demo temporário enquanto Railway não volta
    if (formData.email === 'demo@odonto.com' && formData.password === 'demo123') {
      setDebugInfo('✅ Login demo realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        // Simular autenticação no localStorage
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Dr. Demo',
          email: 'demo@odonto.com',
          role: 'admin'
        }));
        navigate('/dashboard');
      }, 2000);
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      console.log('Resultado do login:', result);
      
      if (result && result.success) {
        setDebugInfo('✅ Login realizado com sucesso! Redirecionando...');
        // Aguardar 2 segundos antes de redirecionar para mostrar a mensagem
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setDebugInfo('❌ Falha no login: ' + (result?.message || error || 'Credenciais inválidas. Tente: demo@odonto.com / demo123'));
        console.error('Detalhes do erro:', { result, error });
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setDebugInfo('❌ Erro de conexão: ' + (err.message || 'Railway offline. Tente: demo@odonto.com / demo123'));
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
          {!showRegister && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              border: '1px solid #ffeaa7',
              borderRadius: '5px',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}>
              💡 <strong>Demo:</strong> demo@odonto.com / demo123
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {debugInfo && (
          <div style={{
            padding: '10px',
            marginBottom: '1rem',
            backgroundColor: debugInfo.includes('✅') ? '#d4edda' : 
                           debugInfo.includes('❌') ? '#f8d7da' : '#d1ecf1',
            color: debugInfo.includes('✅') ? '#155724' : 
                   debugInfo.includes('❌') ? '#721c24' : '#0c5460',
            border: '1px solid',
            borderColor: debugInfo.includes('✅') ? '#c3e6cb' : 
                        debugInfo.includes('❌') ? '#f5c6cb' : '#bee5eb',
            borderRadius: '5px',
            fontSize: '0.875rem'
          }}>
            {debugInfo}
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
