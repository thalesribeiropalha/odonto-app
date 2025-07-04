import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllOrganizations, 
  getMyOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
  getPlanDisplayName, 
  getPlanColor,
  getStatusDisplayName,
  getStatusColor
} from '../services/organizationService';
import OrganizationModal from '../components/OrganizationModal';

const Organizations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [myOrganization, setMyOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (isAdmin) {
        const response = await getAllOrganizations();
        setOrganizations(response.organizations || []);
      } else if (isOwner) {
        const response = await getMyOrganization();
        setMyOrganization(response.organization);
      }
    } catch (error) {
      console.error('Erro ao carregar organizações:', error);
      setError('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (organization) => {
    try {
      const response = await toggleOrganizationStatus(organization.id);
      
      if (response.success) {
        if (isAdmin) {
          setOrganizations(prev => prev.map(org => 
            org.id === organization.id ? response.organization : org
          ));
        } else {
          setMyOrganization(response.organization);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status da organização');
    }
  };

  const handleCreateOrganization = () => {
    setEditingOrganization(null);
    setIsModalOpen(true);
  };

  const handleEditOrganization = (organization) => {
    setEditingOrganization(organization);
    setIsModalOpen(true);
  };

  const handleDeleteOrganization = async (organization) => {
    if (!window.confirm(`Tem certeza que deseja deletar a organização "${organization.name}"?`)) {
      return;
    }

    try {
      const response = await deleteOrganization(organization.id);
      
      if (response.success) {
        setOrganizations(prev => prev.filter(org => org.id !== organization.id));
        alert('Organização deletada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao deletar organização:', error);
      alert('Erro ao deletar organização: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveOrganization = async (formData) => {
    try {
      let response;
      
      if (editingOrganization) {
        response = await updateOrganization(editingOrganization.id, formData);
        
        if (response.success) {
          if (isAdmin) {
            setOrganizations(prev => prev.map(org => 
              org.id === editingOrganization.id ? response.organization : org
            ));
          } else {
            setMyOrganization(response.organization);
          }
          alert('Organização atualizada com sucesso!');
        }
      } else {
        response = await createOrganization(formData);
        
        if (response.success) {
          setOrganizations(prev => [...prev, response.organization]);
          alert('Organização criada com sucesso!');
        }
      }
      
      setIsModalOpen(false);
      setEditingOrganization(null);
    } catch (error) {
      console.error('Erro ao salvar organização:', error);
      throw error;
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2>Carregando organizações...</h2>
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
          <button onClick={fetchData} className="btn btn-primary">
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>
        {isAdmin ? '🏢 Gerenciar Organizações' : '⚙️ Configurações da Organização'}
      </h1>

      {isAdmin ? (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="text"
                placeholder="Buscar organizações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '300px'
                }}
              />
              <span style={{ color: '#666', fontSize: '14px' }}>
                {filteredOrganizations.length} organizações
              </span>
            </div>
            
            <button
              onClick={handleCreateOrganization}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ➕ Nova Organização
            </button>
          </div>

          {/* Tabela de organizações para admin */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #dee2e6', 
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {filteredOrganizations.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                <h3>Nenhuma organização encontrada</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  {searchTerm ? 'Nenhuma organização corresponde à sua busca.' : 'Ainda não há organizações cadastradas.'}
                </p>
                <button onClick={handleCreateOrganization} className="btn btn-primary">
                  ➕ Criar Primeira Organização
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Nome</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Plano</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <strong>{org.name}</strong>
                          {org.document && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              CNPJ: {org.document}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{org.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          backgroundColor: getPlanColor(org.subscription?.plan),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {getPlanDisplayName(org.subscription?.plan)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: getStatusColor(org.isActive),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {getStatusDisplayName(org.isActive)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditOrganization(org)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleStatus(org)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: org.isActive ? '#dc3545' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title={org.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {org.isActive ? '🔒' : '🔓'}
                          </button>
                          <button
                            onClick={() => handleDeleteOrganization(org)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : isOwner ? (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3>Configurações da Organização</h3>
            {myOrganization && (
              <button
                onClick={() => handleEditOrganization(myOrganization)}
                className="btn btn-primary"
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {myOrganization ? (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h4>{myOrganization.name}</h4>
              <p><strong>Email:</strong> {myOrganization.email}</p>
              <p><strong>Plano:</strong> {getPlanDisplayName(myOrganization.subscription?.plan)}</p>
              <p><strong>Status:</strong> {getStatusDisplayName(myOrganization.isActive)}</p>
              {myOrganization.document && (
                <p><strong>CNPJ:</strong> {myOrganization.document}</p>
              )}
              {myOrganization.phone && (
                <p><strong>Telefone:</strong> {myOrganization.phone}</p>
              )}
            </div>
          ) : (
            <p>Organização não encontrada</p>
          )}
        </div>
      ) : (
        <div>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      )}

      {/* Modal */}
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organization={editingOrganization}
        onSave={handleSaveOrganization}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Organizations;
