import React, { useState } from 'react';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'secretary',
    profile: {
      cro: '',
      specialty: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Nome, email, senha e função são obrigatórios');
      return;
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        onUserCreated(data.user);
        onClose();
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'secretary',
          profile: { cro: '', specialty: '', phone: '' }
        });
      } else {
        setError(data.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>➕ Criar Novo Usuário</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>👤 Nome:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>📧 Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Senha:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>🏷️ Função:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="admin">Administrador</option>
              <option value="dentist">Dentista</option>
              <option value="secretary">Secretária</option>
            </select>
          </div>

          {formData.role === 'dentist' && (
            <>
              <div className="form-group">
                <label>🦷 CRO:</label>
                <input
                  type="text"
                  name="profile.cro"
                  value={formData.profile.cro}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>🎯 Especialidade:</label>
                <input
                  type="text"
                  name="profile.specialty"
                  value={formData.profile.specialty}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>📞 Telefone:</label>
            <input
              type="tel"
              name="profile.phone"
              value={formData.profile.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? '⏳ Criando...' : '✅ Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
