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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F5E6D3 0%, #F4D1D1 50%, #E6A4A4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(196, 136, 136, 0.3)',
        border: '1px solid rgba(230, 164, 164, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {/* Logo Circular */}
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 20px auto',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E6A4A4 0%, #F4D1D1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #C48888',
            boxShadow: '0 8px 16px rgba(196, 136, 136, 0.3)'
          }}>
            <div style={{
              fontSize: '36px',
              background: 'linear-gradient(45deg, #F5E6D3, #FFFFFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              🦷
            </div>
          </div>
          
          <h1 style={{
            color: '#C48888',
            fontSize: '24px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Dra. Larissa Rufino
          </h1>
          
          <p style={{
            color: '#A67C7C',
            fontSize: '14px',
            margin: '0 0 20px 0',
            fontWeight: '400',
            letterSpacing: '0.5px'
          }}>
            ORTODONTIA • CIRURGIA • ESTÉTICA
          </p>
          
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #E6A4A4 50%, transparent 100%)',
            margin: '20px 0',
            borderRadius: '1px'
          }}></div>
          
          <p style={{ 
            color: '#8B6B6B', 
            fontSize: '16px',
            margin: '0',
            fontWeight: '300'
          }}>
            {showRegister ? 'Criar nova conta' : 'Acesso ao Sistema'}
          </p>
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
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#C48888',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                📧 Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '2px solid #F4D1D1',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(245, 230, 211, 0.3)',
                  color: '#8B6B6B',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #E6A4A4';
                  e.target.style.backgroundColor = 'rgba(230, 164, 164, 0.1)';
                  e.target.style.boxShadow = '0 0 15px rgba(230, 164, 164, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #F4D1D1';
                  e.target.style.backgroundColor = 'rgba(245, 230, 211, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#C48888',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                🔒 Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                minLength={6}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '2px solid #F4D1D1',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(245, 230, 211, 0.3)',
                  color: '#8B6B6B',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #E6A4A4';
                  e.target.style.backgroundColor = 'rgba(230, 164, 164, 0.1)';
                  e.target.style.boxShadow = '0 0 15px rgba(230, 164, 164, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #F4D1D1';
                  e.target.style.backgroundColor = 'rgba(245, 230, 211, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading 
                  ? 'linear-gradient(135deg, #C48888 0%, #A67C7C 100%)'
                  : 'linear-gradient(135deg, #E6A4A4 0%, #C48888 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(230, 164, 164, 0.4)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '20px',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 25px rgba(230, 164, 164, 0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(230, 164, 164, 0.4)';
                }
              }}
            >
              {isLoading ? '⏳ Entrando...' : '✨ Acessar Sistema'}
            </button>

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

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link 
            to="/" 
            style={{ 
              color: '#A67C7C', 
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: '400',
              transition: 'all 0.3s ease',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(230, 164, 164, 0.1)',
              border: '1px solid rgba(244, 209, 209, 0.5)'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#C48888';
              e.target.style.backgroundColor = 'rgba(230, 164, 164, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#A67C7C';
              e.target.style.backgroundColor = 'rgba(230, 164, 164, 0.1)';
            }}
          >
            ← Teste de Conexão
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;





