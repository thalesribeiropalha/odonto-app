import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPatients, 
  togglePatientStatus, 
  getGenderDisplayName, 
  getStatusDisplayName, 
  getStatusColor,
  formatCPF,
  formatPhone,
  calculateAge
} from '../services/patientService';
import CreatePatientModal from '../components/CreatePatientModal';
import PatientModal from '../components/PatientModal';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Estados dos filtros
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    active: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [pagination.page, filters]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      if (response.success) {
        const patientsArray = response.patients || [];
        setPatients(patientsArray);
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
          total: patientsArray.length // Usar o tamanho real do array
        }));
        setError(null);
      } else {
        setError(response.message || 'Erro ao carregar pacientes');
      }
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
      setError('Erro ao carregar pacientes: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset para primeira página
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (patient) => {
    try {
      const response = await togglePatientStatus(patient.id);
      
      if (response.success) {
        // Atualizar o paciente na lista
        setPatients(prev => prev.map(p => 
          p.id === patient.id ? response.patient : p
        ));
      } else {
        alert('Erro ao alterar status: ' + response.message);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do paciente: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handlePatientUpdated = (updatedPatient) => {
    setPatients(prev => prev.map(p => 
      p.id === updatedPatient.id ? updatedPatient : p
    ));
  };

  const handlePatientCreated = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      gender: '',
      active: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && patients.length === 0) {
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
          <h2>Carregando pacientes...</h2>
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
            onClick={fetchPatients} 
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
            👥 Gerenciamento de Pacientes
          </h1>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '14px',
          color: '#666'
        }}>
          <span>Total: <strong>{pagination.total}</strong></span>
          <span>|</span>
          <span>Página: <strong>{pagination.page} de {pagination.totalPages}</strong></span>
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
            ➕ Novo Paciente
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
              placeholder="Nome, CPF, telefone ou email..."
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
              👫 Gênero:
            </label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Todos os gêneros</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
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
              value={filters.active}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Todos os status</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
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
              onClick={fetchPatients}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1
              }}
            >
              🔄 {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Pacientes */}
      {patients.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h3>Nenhum paciente encontrado</h3>
          <p style={{ color: '#666' }}>
            {filters.search || filters.gender || filters.active
              ? 'Tente ajustar os filtros para encontrar pacientes.'
              : 'Não há pacientes cadastrados no sistema.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            overflow: 'hidden'
          }}>
            {/* Header da tabela */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 150px 100px 100px 80px 150px',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              fontWeight: 'bold',
              borderBottom: '1px solid #dee2e6'
            }}>
              <div>👤 Paciente</div>
              <div>📞 Contato</div>
              <div>👫 Gênero</div>
              <div>🎂 Idade</div>
              <div>📊 Status</div>
              <div style={{ textAlign: 'center' }}>⚡ Ações</div>
            </div>

            {/* Linhas da tabela */}
            {patients.map((patient) => (
              <div
                key={patient.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 100px 100px 80px 150px',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {patient.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    CPF: {formatCPF(patient.document)}
                  </div>
                  {patient.email && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {patient.email}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '12px' }}>
                  {patient.phone && (
                    <div>{formatPhone(patient.phone)}</div>
                  )}
                  {patient.address?.city && (
                    <div style={{ color: '#666' }}>
                      {patient.address.city}/{patient.address.state}
                    </div>
                  )}
                </div>

                <div>
                  {patient.gender && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: patient.gender === 'masculino' ? '#e3f2fd' : '#fce4ec',
                      color: patient.gender === 'masculino' ? '#1565c0' : '#c2185b'
                    }}>
                      {getGenderDisplayName(patient.gender)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#666' }}>
                  {patient.birth_date ? `${calculateAge(patient.birth_date)} anos` : '-'}
                </div>

                <div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: patient.is_active ? '#d4edda' : '#f8d7da',
                    color: getStatusColor(patient.is_active)
                  }}>
                    {getStatusDisplayName(patient.is_active)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => handleEditPatient(patient)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Editar paciente"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleToggleStatus(patient)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: patient.is_active ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title={patient.is_active ? 'Desativar paciente' : 'Ativar paciente'}
                  >
                    {patient.is_active ? '🚫' : '✅'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: pagination.page === 1 ? '#f8f9fa' : '#007bff',
                  color: pagination.page === 1 ? '#6c757d' : 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Anterior
              </button>
              
              <span style={{ margin: '0 16px', fontSize: '14px', color: '#666' }}>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: pagination.page === pagination.totalPages ? '#f8f9fa' : '#007bff',
                  color: pagination.page === pagination.totalPages ? '#6c757d' : 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de Edição */}
      <PatientModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
        }}
        onPatientUpdated={handlePatientUpdated}
      />

      {/* Modal de Criação */}
      <CreatePatientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
};

export default Patients;


