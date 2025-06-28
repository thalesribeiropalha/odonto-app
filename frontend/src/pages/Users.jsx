import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/debug/users');
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Erro ao carregar usuários: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🔄 Carregando usuários...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>❌ Erro</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchUsers} style={{ padding: '10px 20px', marginTop: '10px' }}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>👥 Usuários Cadastrados ({users.length})</h2>
      
      {users.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {users.map((user, index) => (
            <div key={user.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>👤 {user.name}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Função:</strong> {user.role}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Criado em:</strong> {new Date(user.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={fetchUsers} 
        style={{ 
          padding: '10px 20px', 
          marginTop: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🔄 Atualizar Lista
      </button>
    </div>
  );
};

export default Users;
