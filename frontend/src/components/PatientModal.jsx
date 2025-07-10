import React, { useState, useEffect } from 'react';
import { 
  updatePatient, 
  formatCPF, 
  unformatCPF, 
  formatPhone, 
  unformatPhone,
  formatCEP,
  unformatCEP,
  isValidCPF,
  isValidEmail,
  isValidPhone,
  calculateAge
} from '../services/patientService';

const PatientModal = ({ patient, isOpen, onClose, onPatientUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    birth_date: '',
    gender: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    medical_info: {
      allergies: [],
      medications: [],
      medical_conditions: [],
      medical_history: '',
      blood_type: '',
      insurance: {
        provider: '',
        number: '',
        expires_at: ''
      }
    },
    emergency_contact: {
      name: '',
      phone: '',
      relationship: '',
      address: ''
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');

  // Preencher formulário quando patient mudar
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: formatPhone(patient.phone) || '',
        document: formatCPF(patient.document) || '',
        birth_date: patient.birth_date || '',
        gender: patient.gender || '',
        address: {
          cep: formatCEP(patient.address?.cep) || '',
          street: patient.address?.street || '',
          number: patient.address?.number || '',
          complement: patient.address?.complement || '',
          neighborhood: patient.address?.neighborhood || '',
          city: patient.address?.city || '',
          state: patient.address?.state || ''
        },
        medical_info: {
          allergies: patient.medical_info?.allergies || [],
          medications: patient.medical_info?.medications || [],
          medical_conditions: patient.medical_info?.medical_conditions || [],
          medical_history: patient.medical_info?.medical_history || '',
          blood_type: patient.medical_info?.blood_type || '',
          insurance: {
            provider: patient.medical_info?.insurance?.provider || '',
            number: patient.medical_info?.insurance?.number || '',
            expires_at: patient.medical_info?.insurance?.expires_at || ''
          }
        },
        emergency_contact: {
          name: patient.emergency_contact?.name || '',
          phone: formatPhone(patient.emergency_contact?.phone) || '',
          relationship: patient.emergency_contact?.relationship || '',
          address: patient.emergency_contact?.address || ''
        },
        notes: patient.notes || ''
      });
    }
  }, [patient]);

  const handleClose = () => {
    setErrors({});
    setCurrentTab('basic');
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação automática
    let formattedValue = value;
    if (name === 'document') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cep') {
      formattedValue = formatCEP(value);
    }

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: formattedValue
      }
    }));
  };

  const handleMedicalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        [name]: value
      }
    }));
  };

  const handleInsuranceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        insurance: {
          ...prev.medical_info.insurance,
          [name]: value
        }
      }
    }));
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [name]: formattedValue
      }
    }));
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        [field]: items
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validações obrigatórias
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.document && !isValidCPF(formData.document)) {
      newErrors.document = 'CPF inválido';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    if (formData.emergency_contact.phone && !isValidPhone(formData.emergency_contact.phone)) {
      newErrors.emergency_phone = 'Telefone de emergência inválido';
    }

    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'Data de nascimento não pode ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para envio
      const patientData = {
        ...formData,
        document: unformatCPF(formData.document),
        phone: unformatPhone(formData.phone),
        address: {
          ...formData.address,
          cep: unformatCEP(formData.address.cep)
        },
        emergency_contact: {
          ...formData.emergency_contact,
          phone: unformatPhone(formData.emergency_contact.phone)
        }
      };

      // Remover campos vazios
      if (!patientData.email) delete patientData.email;
      if (!patientData.phone) delete patientData.phone;
      if (!patientData.document) delete patientData.document;
      if (!patientData.birth_date) delete patientData.birth_date;
      if (!patientData.gender) delete patientData.gender;
      if (!patientData.notes) delete patientData.notes;

      const response = await updatePatient(patient.id, patientData);

      if (response.success) {
        onPatientUpdated(response.patient);
        handleClose();
      } else {
        setErrors({ submit: response.message || 'Erro ao atualizar paciente' });
      }
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      setErrors({ submit: error.message || 'Erro ao atualizar paciente' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !patient) return null;

  const tabs = [
    { id: 'basic', name: 'Dados Básicos', icon: '👤' },
    { id: 'address', name: 'Endereço', icon: '📍' },
    { id: 'medical', name: 'Dados Médicos', icon: '🏥' },
    { id: 'emergency', name: 'Emergência', icon: '🚨' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: '4px' }}>✏️ Editar Paciente</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#666' }}>
              <span><strong>CPF:</strong> {formatCPF(patient.document)}</span>
              {patient.birth_date && (
                <span><strong>Idade:</strong> {calculateAge(patient.birth_date)} anos</span>
              )}
              <span style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: patient.is_active ? '#d4edda' : '#f8d7da',
                color: patient.is_active ? '#155724' : '#721c24'
              }}>
                {patient.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Abas */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderBottom: currentTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
                color: currentTab === tab.id ? '#007bff' : '#666',
                fontSize: '14px',
                fontWeight: currentTab === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Aba Dados Básicos */}
          {currentTab === 'basic' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.name ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Digite o nome completo"
                />
                {errors.name && (
                  <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.name}</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    CPF
                  </label>
                  <input
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleInputChange}
                    maxLength="14"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.document ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="000.000.000-00"
                  />
                  {errors.document && (
                    <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.document}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength="15"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.phone ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && (
                    <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.phone}</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.email ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.email}</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.birth_date ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.birth_date && (
                    <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.birth_date}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Gênero
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Aba Endereço */}
          {currentTab === 'address' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.address.cep}
                    onChange={handleAddressChange}
                    maxLength="9"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Rua/Avenida
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nome da rua"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Número
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.address.number}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="123"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.address.complement}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Apartamento, bloco, etc."
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Bairro
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.address.neighborhood}
                  onChange={handleAddressChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Nome do bairro"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    maxLength="2"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Dados Médicos */}
          {currentTab === 'medical' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Alergias
                </label>
                <input
                  type="text"
                  value={formData.medical_info.allergies.join(', ')}
                  onChange={(e) => handleArrayChange('allergies', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Separe por vírgulas: Penicilina, Látex"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Medicamentos em Uso
                </label>
                <input
                  type="text"
                  value={formData.medical_info.medications.join(', ')}
                  onChange={(e) => handleArrayChange('medications', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Separe por vírgulas: Aspirina, Vitamina D"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Tipo Sanguíneo
                  </label>
                  <select
                    name="blood_type"
                    value={formData.medical_info.blood_type}
                    onChange={handleMedicalChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Selecione</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Convênio
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.medical_info.insurance.provider}
                    onChange={handleInsuranceChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nome do convênio"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Histórico Médico
                </label>
                <textarea
                  name="medical_history"
                  value={formData.medical_info.medical_history}
                  onChange={handleMedicalChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Histórico médico relevante..."
                />
              </div>
            </div>
          )}

          {/* Aba Contato de Emergência */}
          {currentTab === 'emergency' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Nome do Contato
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.emergency_contact.name}
                  onChange={handleEmergencyChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Nome completo"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.emergency_contact.phone}
                    onChange={handleEmergencyChange}
                    maxLength="15"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.emergency_phone ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.emergency_phone && (
                    <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.emergency_phone}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Parentesco
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    value={formData.emergency_contact.relationship}
                    onChange={handleEmergencyChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Pai, Mãe, Cônjuge, etc."
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Observações gerais sobre o paciente..."
                />
              </div>
            </div>
          )}

          {/* Erro de submit */}
          {errors.submit && (
            <div style={{
              padding: '12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              color: '#721c24',
              marginBottom: '16px'
            }}>
              {errors.submit}
            </div>
          )}

          {/* Botões */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '24px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabIndex = tabs.findIndex(tab => tab.id === currentTab);
                    if (tabIndex > 0) {
                      setCurrentTab(tabs[tabIndex - 1].id);
                    }
                  }}
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
                  ← Anterior
                </button>
              )}
              
              {currentTab !== 'emergency' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabIndex = tabs.findIndex(tab => tab.id === currentTab);
                    if (tabIndex < tabs.length - 1) {
                      setCurrentTab(tabs[tabIndex + 1].id);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Próxima →
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleClose}
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
                ❌ Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '⏳ Salvando...' : '✅ Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;


