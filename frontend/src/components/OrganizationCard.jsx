import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyOrganization, getOrganizationStats, getPlanDisplayName, getPlanColor } from '../services/organizationService';

const OrganizationCard = ({ userRole, onManageClick }) => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      
      if (userRole === 'admin') {
        // Admin vê estatísticas gerais do sistema
        setOrganization({
          name: 'Sistema Administrativo',
          subscription: { plan: 'enterprise' }
        });
        setStats({
          totalOrganizations: 12,
          activeOrganizations: 10,
          totalUsers: 45
        });
      } else {
        // Owner vê dados da própria organização
        const [orgResponse, statsResponse] = await Promise.all([
          getMyOrganization(),
          getOrganizationStats()
        ]);
        
        setOrganization(orgResponse.organization);
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da organização:', error);
      setError('Erro ao carregar dados da organização');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px', color: '#dc3545' }}>❌</div>
          <p style={{ color: '#dc3545' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>
          {userRole === 'admin' ? '🏢 Organizações' : '⚙️ Configurações'}
        </h3>
      </div>

      <div className="card-content">
        {userRole === 'admin' ? (
          // Card para Admin - Visão geral do sistema
          <>
            <div className="stat-number" style={{ color: '#007bff' }}>
              {stats?.totalOrganizations || 0}
            </div>
            <div className="stat-label">
              {stats?.totalOrganizations === 1 ? 'consultório cadastrado' : 'consultórios cadastrados'}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '12px',
              fontSize: '14px',
              color: '#666'
            }}>
              <span>✅ Ativos: {stats?.activeOrganizations || 0}</span>
              <span>👥 Usuários: {stats?.totalUsers || 0}</span>
            </div>
          </>
        ) : (
          // Card para Owner - Dados da própria organização
          <>
            <div className="organization-info">
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {organization?.name || 'Minha Organização'}
              </div>
              
              <div style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: getPlanColor(organization?.subscription?.plan),
                color: 'white',
                marginBottom: '12px'
              }}>
                Plano {getPlanDisplayName(organization?.subscription?.plan)}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#666'
            }}>
              <span>👥 {stats?.activeUsers || 0}/{stats?.maxUsers || 5} usuários</span>
              <span>📊 {stats?.totalPatients || 0} pacientes</span>
            </div>
          </>
        )}
      </div>

      <div className="card-actions">
        <button 
          onClick={onManageClick}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {userRole === 'admin' ? '🏢 Gerenciar Organizações' : '⚙️ Configurar Organização'}
        </button>
      </div>
    </div>
  );
};

export default OrganizationCard;
