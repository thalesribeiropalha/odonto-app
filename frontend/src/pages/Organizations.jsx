import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllOrganizations, 
  getMyOrganization,
  updateOrganization,
  toggleOrganizationStatus,
  getPlanDisplayName, 
  getPlanColor,
  getStatusDisplayName,
  getStatusColor
} from '../services/organizationService';

const Organizations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [myOrganization, setMyOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.organization?.role === 'owner';

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
      const response = await toggleOrganizationStatus(organization._id);
      
      if (response.success) {
        if (isAdmin) {
          setOrganizations(prev => prev.map(org => 
            org._id === organization._id ? response.organization : org
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
          <h3>Lista de Organizações (Admin)</h3>
          <p>Funcionalidade em desenvolvimento...</p>
        </div>
      ) : isOwner ? (
        <div>
          <h3>Configurações da Organização</h3>
          {myOrganization ? (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h4>{myOrganization.name}</h4>
              <p>Email: {myOrganization.email}</p>
              <p>Plano: {getPlanDisplayName(myOrganization.subscription?.plan)}</p>
              <p>Status: {getStatusDisplayName(myOrganization.isActive)}</p>
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
    </div>
  );
};

export default Organizations;
