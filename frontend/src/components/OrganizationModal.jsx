import React, { useState, useEffect } from 'react';

const OrganizationModal = ({ 
  isOpen, 
  onClose, 
  organization = null, 
  onSave, 
  isAdmin = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    subscription: {
      plan: 'starter'
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!organization;

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        email: organization.email || '',
        document: organization.document || '',
        phone: organization.phone || '',
        address: {
          street: organization.address?.street || '',
          city: organization.address?.city || '',
          state: organization.address?.state || '',
          zipCode: organization.address?.zipCode || ''
        },
        subscription: {
          plan: organization.subscription?.plan || 'starter'
        }
      });
    } else {
      // Reset form for new organization
      setFormData({
        name: '',
        email: '',
        document: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        subscription: {
          plan: 'starter'
        }
      });
    }
    setErrors({});
  }, [organization, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da organização é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar organização:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao salvar organização'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isEditing ? '✏️ Editar Organização' : '🏢 Nova Organização'}
          </h2>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && (
            <div className="error-message" style={{ marginBottom: '16px' }}>
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Nome da Organização *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="Ex: Clínica Odontológica São Paulo"
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="contato@clinica.com"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="document">CNPJ</label>
              <input
                type="text"
                id="document"
                name="document"
                value={formData.document}
                onChange={handleInputChange}
                placeholder="00.000.000/0001-00"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
                disabled={loading}
              />
            </div>
          </div>

          {isAdmin && (
            <div className="form-group">
              <label htmlFor="subscription.plan">Plano</label>
              <select
                id="subscription.plan"
                name="subscription.plan"
                value={formData.subscription.plan}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="starter">Starter (5 usuários)</option>
                <option value="professional">Professional (15 usuários)</option>
                <option value="enterprise">Enterprise (Ilimitado)</option>
              </select>
            </div>
          )}

          <div className="form-section">
            <h3>Endereço</h3>
            
            <div className="form-group">
              <label htmlFor="address.street">Rua/Avenida</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Rua das Flores, 123"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.city">Cidade</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.state">Estado</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="SP"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.zipCode">CEP</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="01234-567"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationModal;
