import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, toggleUserStatus, getRoleDisplayName, getStatusDisplayName, getStatusColor } from '../services/userService';
import UserModal from '../components/UserModal';
import CreateUserModal from '../components/CreateUserModal';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Estados dos filtros
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.users || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Erro ao carregar usuários: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de função
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Filtro de status
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      const response = await toggleUserStatus(user.id);
      
      if (response.success) {
        // Atualizar o usuário na lista
        setUsers(prev => prev.map(u => 
          u.id === user.id ? response.user : u
        ));
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
  };

  const handleUserCreated = (newUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <h2>Carregando usuários...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2>Erro</h2>
          <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={fetchUsers} 
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Voltar
          </button>
          <h1 style={{ margin: 0, color: '#333' }}>
            👥 Gerenciamento de Usuários
          </h1>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '14px',
          color: '#666'
        }}>
          <span>Total: <strong>{users.length}</strong></span>
          <span>|</span>
          <span>Filtrados: <strong>{filteredUsers.length}</strong></span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: '16px'
            }}
          >
            ➕ Novo Usuário
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              🔍 Buscar:
            </label>
            <input
              type="text"
              placeholder="Nome ou email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              🏷️ Função:
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Todas as funções</option>
              <option value="admin">Administrador</option>
              <option value="dentist">Dentista</option>
              <option value="secretary">Secretária</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              📊 Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ Limpar
            </button>
            <button
              onClick={fetchUsers}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      {filteredUsers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h3>Nenhum usuário encontrado</h3>
          <p style={{ color: '#666' }}>
            {users.length === 0 
              ? 'Não há usuários cadastrados no sistema.'
              : 'Tente ajustar os filtros para encontrar usuários.'}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          overflow: 'hidden'
        }}>
          {/* Header da tabela */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 200px 120px 100px 150px',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            fontWeight: 'bold',
            borderBottom: '1px solid #dee2e6'
          }}>
            <div>👤 Usuário</div>
            <div>🏷️ Função</div>
            <div>📊 Status</div>
            <div>📅 Cadastro</div>
            <div style={{ textAlign: 'center' }}>⚡ Ações</div>
          </div>

          {/* Linhas da tabela */}
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 200px 120px 100px 150px',
                gap: '16px',
                padding: '16px',
                borderBottom: '1px solid #f0f0f0',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {user.email}
                </div>
              </div>

              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: user.role === 'admin' ? '#e3f2fd' : user.role === 'dentist' ? '#f3e5f5' : '#e8f5e8',
                  color: user.role === 'admin' ? '#1565c0' : user.role === 'dentist' ? '#7b1fa2' : '#2e7d32'
                }}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>

              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                  color: getStatusColor(user.isActive)
                }}>
                  {getStatusDisplayName(user.isActive)}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => handleEditUser(user)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Editar usuário"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: user.isActive ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                >
                  {user.isActive ? '🚫' : '✅'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
      />

      {/* Modal de Criação */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default Users;



