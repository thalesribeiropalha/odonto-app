import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se não está autenticado, redirecionar para login
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p style={{ marginLeft: '1rem' }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <Link to="/dashboard" className="logo">
              🦷 Odonto App
            </Link>
            
            <div className="user-menu">
              <span style={{ color: '#6b7280' }}>
                Olá, <strong>{user.name}</strong>
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                backgroundColor: '#dbeafe', 
                color: '#1e40af', 
                borderRadius: '0.25rem' 
              }}>
                {user.role}
              </span>
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="dashboard-container">
            {/* Header do Dashboard */}
            <div className="dashboard-header">
              <h1 className="dashboard-title">
                Dashboard - Consultório Odontológico
              </h1>
              <p className="dashboard-subtitle">
                Bem-vindo ao sistema de gestão do seu consultório! 🦷
              </p>
            </div>

            {/* Cards de Status */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3 className="card-title">👥 Pacientes</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  0
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Total de pacientes cadastrados
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '1rem', fontSize: '0.875rem' }}
                  disabled
                >
                  Gerenciar Pacientes (Em breve)
                </button>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">📅 Consultas</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                  0
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Consultas agendadas hoje
                </p>
                <button 
                  className="btn btn-success" 
                  style={{ marginTop: '1rem', fontSize: '0.875rem' }}
                  disabled
                >
                  Ver Agenda (Em breve)
                </button>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">💰 Financeiro</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                  R$ 0,00
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Faturamento do mês
                </p>
                <button 
                  className="btn" 
                  style={{ 
                    marginTop: '1rem', 
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--warning-color)',
                    color: 'white'
                  }}
                  disabled
                >
                  Relatórios (Em breve)
                </button>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">🔧 Configurações</h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Gerencie as configurações do sistema
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button 
                    className="btn" 
                    style={{ 
                      fontSize: '0.875rem',
                      backgroundColor: '#6b7280',
                      color: 'white'
                    }}
                    disabled
                  >
                    Usuários (Em breve)
                  </button>
                  <button 
                    className="btn" 
                    style={{ 
                      fontSize: '0.875rem',
                      backgroundColor: '#6b7280',
                      color: 'white'
                    }}
                    disabled
                  >
                    Backup (Em breve)
                  </button>
                </div>
              </div>
            </div>

            {/* Informações do Sistema */}
            <div className="dashboard-card">
              <h3 className="card-title">ℹ️ Informações do Sistema</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Usuário:</strong><br />
                  <span style={{ color: '#6b7280' }}>{user.name}</span>
                </div>
                <div>
                  <strong>Email:</strong><br />
                  <span style={{ color: '#6b7280' }}>{user.email}</span>
                </div>
                <div>
                  <strong>Função:</strong><br />
                  <span style={{ 
                    color: '#1e40af',
                    backgroundColor: '#dbeafe',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <strong>Conta criada:</strong><br />
                  <span style={{ color: '#6b7280' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status da Aplicação */}
            <div className="dashboard-card">
              <h3 className="card-title">🚀 Status da Aplicação</h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '0.375rem'
              }}>
                <div style={{ fontSize: '2rem' }}>✅</div>
                <div>
                  <strong style={{ color: '#166534' }}>Sistema Operacional</strong>
                  <p style={{ margin: 0, color: '#166534' }}>
                    Frontend e backend conectados com sucesso!
                    Sistema pronto para desenvolvimento de novas funcionalidades.
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link 
                  to="/" 
                  className="btn" 
                  style={{ 
                    fontSize: '0.875rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  🔍 Teste de Conexão
                </Link>
                <button 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.875rem' }}
                  onClick={() => window.location.reload()}
                >
                  🔄 Atualizar Dashboard
                </button>
              </div>
            </div>

            {/* Próximas Funcionalidades */}
            <div className="dashboard-card">
              <h3 className="card-title">🔮 Próximas Funcionalidades</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                    👥 Gestão de Pacientes
                  </h4>
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
                    <li>Cadastro de pacientes</li>
                    <li>Histórico médico</li>
                    <li>Fichas clínicas</li>
                  </ul>
                </div>
                
                <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success-color)' }}>
                    📅 Agendamento
                  </h4>
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
                    <li>Calendário de consultas</li>
                    <li>Notificações</li>
                    <li>Lembretes automáticos</li>
                  </ul>
                </div>
                
                <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--warning-color)' }}>
                    💰 Financeiro
                  </h4>
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
                    <li>Controle de pagamentos</li>
                    <li>Relatórios financeiros</li>
                    <li>Orçamentos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
