import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const TestConnection = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getStatus();
      setStatus(response.data);
    } catch (err) {
      console.error('Erro ao conectar com API:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao conectar com a API');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    checkConnection();
  };

  if (loading) {
    return (
      <div className="test-container">
        <div className="test-card">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p style={{ marginLeft: '1rem' }}>Verificando conexão com a API...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-container">
        <div className="test-card">
          <h1 className="test-title">❌ Erro na Conexão</h1>
          
          <div className="error-message">
            <strong>Erro:</strong> {error}
          </div>
          
          <div className="text-center">
            <button onClick={handleRetry} className="btn btn-primary" style={{ marginRight: '1rem' }}>
              🔄 Tentar Novamente
            </button>
            <Link to="/login" className="btn btn-success">
              📱 Ir para Login
            </Link>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.375rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>💡 Dicas para resolver:</h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Verifique se o backend está rodando na porta 3001</li>
              <li>Execute: <code>cd backend && npm run dev</code></li>
              <li>Verifique se não há problemas de CORS</li>
              <li>Confirme se a URL da API está correta</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-container">
      <div className="test-card">
        <h1 className="test-title">🦷 Odonto App - Teste de Conexão</h1>
        
        <div className="success-message">
          <strong>✅ Conexão estabelecida com sucesso!</strong>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <div className="status-item">
            <span className="status-label">Status:</span>
            <span className={`status-value ${status.status === 'online' ? 'status-online' : 'status-offline'}`}>
              {status.status === 'online' ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Serviço:</span>
            <span className="status-value">{status.service}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Versão:</span>
            <span className="status-value">{status.version}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Ambiente:</span>
            <span className="status-value">{status.environment}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Timestamp:</span>
            <span className="status-value">
              {new Date(status.timestamp).toLocaleString('pt-BR')}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Uptime:</span>
            <span className="status-value">
              {Math.floor(status.uptime / 60)}m {Math.floor(status.uptime % 60)}s
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Mensagem:</span>
            <span className="status-value">{status.message}</span>
          </div>
        </div>
        
        <div className="text-center">
          <button onClick={handleRetry} className="btn btn-primary" style={{ marginRight: '1rem' }}>
            🔄 Atualizar Status
          </button>
          <Link to="/login" className="btn btn-success">
            📱 Ir para Login
          </Link>
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem', border: '1px solid #bbf7d0' }}>
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>🎉 Sistema Funcionando!</h3>
          <p style={{ color: '#166534', margin: 0 }}>
            A comunicação entre frontend e backend está funcionando perfeitamente. 
            Você pode prosseguir para fazer login e começar a usar o sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
